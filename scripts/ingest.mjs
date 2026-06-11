#!/usr/bin/env node
// Lamplight ingestion pipeline: open council street-lighting datasets in
// (GeoJSON / CSV / ArcGIS REST) -> one canonical, licence-tracked lamp
// dataset out (data/lamps/<id>.csv.gz + data/lamps/index.json).
//
// Coordinate columns are detected heuristically; when a council's CSV
// schema is too weird for heuristics, Claude (claude-sonnet-4-6) is asked
// to name the coordinate columns and CRS (needs ANTHROPIC_API_KEY). The
// model only ever names columns - coordinates themselves always come from
// the source data. British National Grid eastings/northings are converted
// to WGS84 locally (OSTN-free Helmert, ~5m accuracy - fine for lamps).
//
// Usage:
//   node scripts/ingest.mjs                    # ingest all registry sources
//   node scripts/ingest.mjs --source bristol   # one registry source
//   node scripts/ingest.mjs --check            # probe registry URLs
//   node scripts/ingest.mjs --file path.csv --id my-council \
//        [--name "..."] [--licence OGL-UK-3.0] [--attribution "..."]
//
// Only ingest open-licensed data (OGL / CC-BY / ODbL-compatible). Never
// point this at PSGA or other restricted datasets.

import fs from "node:fs"
import path from "node:path"
import zlib from "node:zlib"
import { fileURLToPath } from "node:url"

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..")
const OUT_DIR = path.join(ROOT, "data", "lamps")
const REGISTRY = path.join(ROOT, "data", "sources.json")

// ---------------------------------------------------------------- CLI

const args = process.argv.slice(2)
const flag = (name) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? (args[i + 1]?.startsWith("--") ? true : (args[i + 1] ?? true)) : undefined
}

async function main() {
  const registry = JSON.parse(fs.readFileSync(REGISTRY, "utf8")).sources

  if (args.includes("--check")) {
    for (const s of registry) {
      try {
        const res = await fetch(s.url, { method: "HEAD", redirect: "follow" })
        console.log(`${s.id}: ${res.status} ${res.headers.get("content-type") ?? ""}`)
      } catch (err) {
        console.log(`${s.id}: unreachable (${err.cause?.code ?? err.message})`)
      }
    }
    return
  }

  if (flag("file")) {
    const id = flag("id")
    if (!id) throw new Error("--file mode requires --id <source-id>")
    const filePath = String(flag("file"))
    const text = fs.readFileSync(filePath, "utf8")
    const kind = filePath.endsWith(".json") || filePath.endsWith(".geojson") ? "geojson" : "csv"
    await ingest(
      {
        id,
        name: flag("name") ?? id,
        licence: flag("licence") ?? "UNKNOWN - set --licence",
        attribution: flag("attribution") ?? id,
        url: `file:${path.basename(filePath)}`,
      },
      kind,
      text
    )
    return
  }

  const only = flag("source")
  const targets = only ? registry.filter((s) => s.id === only) : registry
  if (targets.length === 0) throw new Error(`no source '${only}' in data/sources.json`)

  for (const source of targets) {
    try {
      console.log(`\n=== ${source.id} (${source.url})`)
      if (source.type === "arcgis") {
        await ingest(source, "geojson", JSON.stringify(await fetchArcgis(source.url)))
      } else {
        const res = await fetch(source.url, { redirect: "follow" })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        await ingest(source, source.type, await res.text())
      }
    } catch (err) {
      console.error(`${source.id}: FAILED - ${err.message}`)
      console.error(`  (download manually and use --file mode if the URL has rotted)`)
    }
  }
}

// ---------------------------------------------------------------- ingest

async function ingest(source, kind, text) {
  const points = kind === "geojson" ? fromGeojson(text) : await fromCsv(text, source.id)

  // sanity-filter + dedupe at ~1m precision
  const seen = new Set()
  const clean = []
  for (const [lat, lon] of points) {
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue
    if (Math.abs(lat) > 90 || Math.abs(lon) > 180 || (lat === 0 && lon === 0)) continue
    const key = `${lat.toFixed(5)},${lon.toFixed(5)}`
    if (seen.has(key)) continue
    seen.add(key)
    clean.push([lat, lon])
  }
  if (clean.length === 0) throw new Error("no usable coordinates found")

  fs.mkdirSync(OUT_DIR, { recursive: true })
  const csv = "lat,lon\n" + clean.map(([a, b]) => `${a.toFixed(6)},${b.toFixed(6)}`).join("\n") + "\n"
  const outFile = path.join(OUT_DIR, `${source.id}.csv.gz`)
  fs.writeFileSync(outFile, zlib.gzipSync(csv, { level: 9 }))

  const indexFile = path.join(OUT_DIR, "index.json")
  const index = fs.existsSync(indexFile) ? JSON.parse(fs.readFileSync(indexFile, "utf8")) : {}
  index[source.id] = {
    name: source.name,
    lamps: clean.length,
    licence: source.licence,
    attribution: source.attribution,
    source_url: source.url,
    fetched_at: new Date().toISOString().slice(0, 10),
  }
  fs.writeFileSync(indexFile, JSON.stringify(index, null, 2) + "\n")

  const kb = Math.round(fs.statSync(outFile).size / 1024)
  console.log(`${source.id}: ${clean.length} lamps -> ${path.relative(ROOT, outFile)} (${kb} KB)`)
}

// ---------------------------------------------------------------- parsers

function fromGeojson(text) {
  const json = JSON.parse(text)
  const features = json.features ?? []
  const points = []
  for (const f of features) {
    const g = f.geometry
    if (!g) continue
    if (g.type === "Point") points.push([g.coordinates[1], g.coordinates[0]])
    else if (g.type === "MultiPoint") for (const c of g.coordinates) points.push([c[1], c[0]])
  }
  return points
}

async function fromCsv(text, sourceId) {
  const rows = parseCsv(text)
  if (rows.length < 2) throw new Error("CSV has no data rows")
  const header = rows[0].map((h) => h.trim())
  const data = rows.slice(1)

  let mapping = heuristicMapping(header, data)
  if (!mapping) {
    console.log(`${sourceId}: column heuristics failed, asking claude-sonnet-4-6…`)
    mapping = await sonnetMapping(header, data)
  }
  if (!mapping) throw new Error(`cannot identify coordinate columns in: ${header.join(", ")}`)

  console.log(`${sourceId}: mapping ${JSON.stringify(mapping)}`)
  const points = []
  for (const row of data) {
    if (mapping.crs === "osgb36") {
      const E = parseFloat(row[mapping.x])
      const N = parseFloat(row[mapping.y])
      if (Number.isFinite(E) && Number.isFinite(N)) points.push(osgb36ToWgs84(E, N))
    } else {
      points.push([parseFloat(row[mapping.y]), parseFloat(row[mapping.x])])
    }
  }
  return points
}

function parseCsv(text) {
  const rows = []
  let row = []
  let field = ""
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ } else inQuotes = false
      } else field += c
    } else if (c === '"') inQuotes = true
    else if (c === ",") { row.push(field); field = "" }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++
      row.push(field); field = ""
      if (row.length > 1 || row[0] !== "") rows.push(row)
      row = []
    } else field += c
  }
  if (field !== "" || row.length > 0) { row.push(field); rows.push(row) }
  return rows
}

// ---------------------------------------------------------------- column mapping

const LAT_NAMES = ["lat", "latitude", "lat_wgs84", "wgs84_lat", "y_lat"]
const LON_NAMES = ["lon", "lng", "long", "longitude", "lon_wgs84", "wgs84_lon", "x_lon"]
const EAST_NAMES = ["easting", "eastings", "east", "bng_e", "grid_e", "x", "x_coord", "x_coordinate", "xcoord"]
const NORTH_NAMES = ["northing", "northings", "north", "bng_n", "grid_n", "y", "y_coord", "y_coordinate", "ycoord"]

function heuristicMapping(header, data) {
  const lower = header.map((h) => h.toLowerCase().replace(/[^a-z0-9_]/g, "_"))
  const find = (names) => lower.findIndex((h) => names.includes(h))
  const sample = (idx) =>
    data.slice(0, 50).map((r) => parseFloat(r[idx])).filter(Number.isFinite)
  const inRange = (vals, lo, hi) =>
    vals.length > 0 && vals.every((v) => v >= lo && v <= hi)

  const latI = find(LAT_NAMES)
  const lonI = find(LON_NAMES)
  if (latI >= 0 && lonI >= 0 && inRange(sample(latI), -90, 90) && inRange(sample(lonI), -180, 180)) {
    return { x: lonI, y: latI, crs: "wgs84" }
  }
  const eI = find(EAST_NAMES)
  const nI = find(NORTH_NAMES)
  if (eI >= 0 && nI >= 0 && inRange(sample(eI), 0, 800000) && inRange(sample(nI), 0, 1300000)) {
    return { x: eI, y: nI, crs: "osgb36" }
  }

  // Fuzzy pass for council-flavoured names like Asset_XCords / Easting_BNG
  const contains = (subs) =>
    lower.findIndex((h) => subs.some((s) => h.includes(s)))
  const eF = contains(["east", "xcord", "x_cord"])
  const nF = contains(["north", "ycord", "y_cord"])
  if (eF >= 0 && nF >= 0 && inRange(sample(eF), 0, 800000) && inRange(sample(nF), 0, 1300000)) {
    return { x: eF, y: nF, crs: "osgb36" }
  }
  const latF = contains(["lat"])
  const lonF = contains(["lon", "lng"])
  if (latF >= 0 && lonF >= 0 && inRange(sample(latF), -90, 90) && inRange(sample(lonF), -180, 180)) {
    return { x: lonF, y: latF, crs: "wgs84" }
  }
  return null
}

async function sonnetMapping(header, data) {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("  ANTHROPIC_API_KEY not set - cannot use Claude for schema mapping")
    return null
  }
  const { default: Anthropic } = await import("@anthropic-ai/sdk")
  const client = new Anthropic()

  const sampleCsv = [header, ...data.slice(0, 5)].map((r) => r.join(",")).join("\n")
  const schema = {
    type: "object",
    properties: {
      x_column: { type: ["string", "null"], description: "Column holding longitude or easting; null if none" },
      y_column: { type: ["string", "null"], description: "Column holding latitude or northing; null if none" },
      crs: { type: "string", enum: ["wgs84", "osgb36", "unknown"] },
    },
    required: ["x_column", "y_column", "crs"],
    additionalProperties: false,
  }

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    output_config: { format: { type: "json_schema", schema } },
    messages: [
      {
        role: "user",
        content:
          "This is the header and first rows of a council street-lighting dataset. " +
          "Identify which columns hold the coordinates and the coordinate reference system. " +
          "British National Grid eastings are ~6-digit metres (0-800000), northings 0-1300000; " +
          "WGS84 lat is -90..90 and lon -180..180. Answer with the exact column names.\n\n" +
          sampleCsv,
      },
    ],
  })
  const text = response.content.find((b) => b.type === "text")?.text
  if (!text) return null
  const parsed = JSON.parse(text)
  if (!parsed.x_column || !parsed.y_column || parsed.crs === "unknown") return null
  const x = header.indexOf(parsed.x_column)
  const y = header.indexOf(parsed.y_column)
  if (x < 0 || y < 0) return null
  // Trust the model for names only - verify the values look like the claimed CRS.
  const vals = (i) => data.slice(0, 50).map((r) => parseFloat(r[i])).filter(Number.isFinite)
  if (parsed.crs === "wgs84" && !vals(y).every((v) => Math.abs(v) <= 90)) return null
  if (parsed.crs === "osgb36" && !vals(y).every((v) => v >= 0 && v <= 1300000)) return null
  return { x, y, crs: parsed.crs }
}

// ---------------------------------------------------------------- arcgis

async function fetchArcgis(baseUrl) {
  const features = []
  let offset = 0
  for (;;) {
    const url =
      `${baseUrl}/query?where=1%3D1&outFields=*&outSR=4326&f=geojson` +
      `&resultOffset=${offset}&resultRecordCount=2000`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`ArcGIS HTTP ${res.status}`)
    const json = await res.json()
    const batch = json.features ?? []
    features.push(...batch)
    if (batch.length < 2000) break
    offset += 2000
    if (offset > 500000) throw new Error("ArcGIS pagination runaway")
  }
  return { type: "FeatureCollection", features }
}

// ---------------------------------------------------------------- OSGB36 -> WGS84
// Inverse transverse Mercator on Airy 1830 (OS national grid constants),
// then a 7-parameter Helmert shift to WGS84. ~5m accuracy without OSTN15,
// which is plenty for lamp positions.

const RAD = Math.PI / 180

export function osgb36ToWgs84(E, N) {
  // Airy 1830 / national grid
  const a = 6377563.396, b = 6356256.909, F0 = 0.9996012717
  const lat0 = 49 * RAD, lon0 = -2 * RAD, N0 = -100000, E0 = 400000
  const e2 = 1 - (b * b) / (a * a)
  const n = (a - b) / (a + b)

  const meridional = (lat) =>
    b * F0 * (
      (1 + n + 1.25 * n * n + 1.25 * n ** 3) * (lat - lat0)
      - (3 * n + 3 * n * n + (21 / 8) * n ** 3) * Math.sin(lat - lat0) * Math.cos(lat + lat0)
      + ((15 / 8) * n * n + (15 / 8) * n ** 3) * Math.sin(2 * (lat - lat0)) * Math.cos(2 * (lat + lat0))
      - (35 / 24) * n ** 3 * Math.sin(3 * (lat - lat0)) * Math.cos(3 * (lat + lat0))
    )

  let lat = lat0
  let M = 0
  do {
    lat = (N - N0 - M) / (a * F0) + lat
    M = meridional(lat)
  } while (Math.abs(N - N0 - M) >= 0.00001)

  const sinLat = Math.sin(lat), cosLat = Math.cos(lat), tanLat = Math.tan(lat)
  const nu = a * F0 / Math.sqrt(1 - e2 * sinLat * sinLat)
  const rho = a * F0 * (1 - e2) / Math.pow(1 - e2 * sinLat * sinLat, 1.5)
  const eta2 = nu / rho - 1

  const VII = tanLat / (2 * rho * nu)
  const VIII = tanLat / (24 * rho * nu ** 3) * (5 + 3 * tanLat ** 2 + eta2 - 9 * tanLat ** 2 * eta2)
  const IX = tanLat / (720 * rho * nu ** 5) * (61 + 90 * tanLat ** 2 + 45 * tanLat ** 4)
  const X = 1 / (cosLat * nu)
  const XI = (nu / rho + 2 * tanLat ** 2) / (6 * cosLat * nu ** 3)
  const XII = (5 + 28 * tanLat ** 2 + 24 * tanLat ** 4) / (120 * cosLat * nu ** 5)

  const dE = E - E0
  const latAiry = lat - VII * dE ** 2 + VIII * dE ** 4 - IX * dE ** 6
  const lonAiry = lon0 + X * dE - XI * dE ** 3 + XII * dE ** 5

  // Airy lat/lon -> cartesian
  const sinLA = Math.sin(latAiry), cosLA = Math.cos(latAiry)
  const nuA = a / Math.sqrt(1 - e2 * sinLA * sinLA)
  let x = nuA * cosLA * Math.cos(lonAiry)
  let y = nuA * cosLA * Math.sin(lonAiry)
  let z = (1 - e2) * nuA * sinLA

  // Helmert OSGB36 -> WGS84 (inverse of the published WGS84->OSGB36 set)
  const tx = 446.448, ty = -125.157, tz = 542.060
  const s = -20.4894e-6
  const rx = (0.1502 / 3600) * RAD, ry = (0.2470 / 3600) * RAD, rz = (0.8421 / 3600) * RAD
  const x2 = tx + (1 + s) * x - rz * y + ry * z
  const y2 = ty + rz * x + (1 + s) * y - rx * z
  const z2 = tz - ry * x + rx * y + (1 + s) * z

  // cartesian -> WGS84 lat/lon (GRS80/WGS84 ellipsoid)
  const aW = 6378137.0, bW = 6356752.3142
  const e2W = 1 - (bW * bW) / (aW * aW)
  const p = Math.hypot(x2, y2)
  let latW = Math.atan2(z2, p * (1 - e2W))
  for (let i = 0; i < 8; i++) {
    const sinW = Math.sin(latW)
    const nuW = aW / Math.sqrt(1 - e2W * sinW * sinW)
    latW = Math.atan2(z2 + e2W * nuW * sinW, p)
  }
  const lonW = Math.atan2(y2, x2)
  return [latW / RAD, lonW / RAD]
}

main().catch((err) => {
  console.error(`fatal: ${err.message}`)
  process.exit(1)
})

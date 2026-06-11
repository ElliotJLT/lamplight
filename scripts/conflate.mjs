#!/usr/bin/env node
// Conflates an ingested lamp dataset against OSM: finds highway ways with
// NO `lit` tag whose geometry is well-covered by council lamp records, and
// emits them as *proposals* for human-reviewed OSM tagging (GeoJSON,
// loadable in JOSM / MapRoulette).
//
//   node scripts/conflate.mjs --lamps data/lamps/bristol.csv.gz \
//        --bbox 51.44,-2.63,51.47,-2.57 [--out proposals.geojson]
//
// IMPORTANT: this never edits OSM. Outputs are suggestions with evidence
// counts attached. Follow the OSM Import Guidelines: discuss with the
// local community, review each way, and credit the source dataset
// (see its licence in data/lamps/index.json) before any upload.

import fs from "node:fs"
import zlib from "node:zlib"

const MATCH_METERS = 30
const MIN_LAMPS = 2
const MIN_LAMPS_PER_KM = 12 // ~one lamp per 80m of way

const args = process.argv.slice(2)
const flag = (name) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : undefined
}

const lampsPath = flag("lamps")
const bboxArg = flag("bbox")
if (!lampsPath || !bboxArg) {
  console.error("usage: node scripts/conflate.mjs --lamps <file.csv.gz> --bbox s,w,n,e [--out out.geojson]")
  process.exit(1)
}
const [s, w, n, e] = bboxArg.split(",").map(Number)

// --- load lamps within bbox
const csv = zlib.gunzipSync(fs.readFileSync(lampsPath)).toString("utf8")
const lamps = csv
  .split("\n")
  .slice(1)
  .map((line) => line.split(",").map(Number))
  .filter(([lat, lon]) => lat >= s && lat <= n && lon >= w && lon <= e)
console.error(`${lamps.length} lamps in bbox`)
if (lamps.length === 0) process.exit(1)

// --- fetch untagged ways from Overpass
const HIGHWAY_FILTER =
  "^(residential|unclassified|tertiary|secondary|primary|living_street|service|" +
  "footway|path|cycleway|pedestrian|steps)$"
const query = `[out:json][timeout:60];
way["highway"~"${HIGHWAY_FILTER}"][!"lit"](${s},${w},${n},${e});
out tags geom 8000;`

const res = await fetch("https://overpass-api.de/api/interpreter", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: "data=" + encodeURIComponent(query),
})
if (!res.ok) throw new Error(`Overpass returned ${res.status}`)
const ways = (await res.json()).elements.filter((el) => el.type === "way" && el.geometry)
console.error(`${ways.length} untagged ways in bbox`)

// --- local projection + lamp grid index
const lat0 = (s + n) / 2
const mLat = 110574
const mLon = 111320 * Math.cos((lat0 * Math.PI) / 180)
const xy = (lat, lon) => [lon * mLon, lat * mLat]
const CELL = 60

const grid = new Map()
for (const [lat, lon] of lamps) {
  const [x, y] = xy(lat, lon)
  const key = `${Math.floor(x / CELL)},${Math.floor(y / CELL)}`
  if (!grid.has(key)) grid.set(key, [])
  grid.get(key).push([x, y])
}

const lampsNear = (ax, ay, bx, by) => {
  const found = new Set()
  const x0 = Math.floor((Math.min(ax, bx) - MATCH_METERS) / CELL)
  const x1 = Math.floor((Math.max(ax, bx) + MATCH_METERS) / CELL)
  const y0 = Math.floor((Math.min(ay, by) - MATCH_METERS) / CELL)
  const y1 = Math.floor((Math.max(ay, by) + MATCH_METERS) / CELL)
  for (let cx = x0; cx <= x1; cx++) {
    for (let cy = y0; cy <= y1; cy++) {
      for (const [px, py] of grid.get(`${cx},${cy}`) ?? []) {
        const dx = bx - ax, dy = by - ay
        const lenSq = dx * dx + dy * dy
        let t = lenSq > 0 ? ((px - ax) * dx + (py - ay) * dy) / lenSq : 0
        t = Math.max(0, Math.min(1, t))
        const ddx = ax + t * dx - px, ddy = ay + t * dy - py
        if (ddx * ddx + ddy * ddy <= MATCH_METERS * MATCH_METERS) found.add(`${px},${py}`)
      }
    }
  }
  return found
}

// --- score each way
const proposals = []
for (const way of ways) {
  const pts = way.geometry.map((p) => xy(p.lat, p.lon))
  let lengthM = 0
  const near = new Set()
  for (let i = 1; i < pts.length; i++) {
    lengthM += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
    for (const id of lampsNear(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1])) near.add(id)
  }
  const perKm = lengthM > 0 ? near.size / (lengthM / 1000) : 0
  if (near.size >= MIN_LAMPS && perKm >= MIN_LAMPS_PER_KM) {
    proposals.push({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: way.geometry.map((p) => [p.lon, p.lat]),
      },
      properties: {
        osm_way_id: way.id,
        name: way.tags?.name ?? null,
        highway: way.tags?.highway,
        lamp_count: near.size,
        lamps_per_km: Math.round(perKm),
        length_m: Math.round(lengthM),
        proposal: "lit=yes",
        evidence: "council open-data lamp records within 30m",
      },
    })
  }
}

const out = flag("out") ?? "proposals.geojson"
fs.writeFileSync(out, JSON.stringify({ type: "FeatureCollection", features: proposals }, null, 1))
console.error(`${proposals.length} ways proposed as lit=yes -> ${out}`)
console.error("Review by hand before any OSM edit - see OSM Import Guidelines.")

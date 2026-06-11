// Fetches street-lighting data from OpenStreetMap via the Overpass API.
// Two element types matter to us:
//   - ways with a highway tag, classified by their `lit` tag
//   - nodes tagged highway=street_lamp (individual lamp posts)

export type LitStatus = "lit" | "unlit" | "unknown"

export interface LitWay {
  id: number
  status: LitStatus
  /** [lat, lon] pairs */
  points: [number, number][]
  name?: string
  highway: string
  litValue?: string
}

export interface StreetLamp {
  id: number
  lat: number
  lon: number
}

export interface LightingData {
  ways: LitWay[]
  lamps: StreetLamp[]
  stats: CoverageStats
}

export interface CoverageStats {
  totalWays: number
  taggedWays: number
  /** share of ways in view that carry any `lit` tag, 0-1 */
  coverage: number
  litKm: number
  unlitKm: number
  unknownKm: number
  lampCount: number
}

export interface Bbox {
  south: number
  west: number
  north: number
  east: number
}

// Routable-on-foot highway types. Motorways etc. are irrelevant to runners.
const HIGHWAY_FILTER =
  "^(residential|unclassified|tertiary|tertiary_link|secondary|secondary_link|" +
  "primary|primary_link|living_street|service|footway|path|cycleway|track|" +
  "pedestrian|steps|bridleway)$"

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
]

export function classifyLit(litValue: string | undefined): LitStatus {
  if (litValue === undefined) return "unknown"
  if (litValue === "no" || litValue === "disused") return "unlit"
  // yes, automatic, 24/7, sunset-sunrise, limited, interval, …
  return "lit"
}

function buildQuery(bbox: Bbox): string {
  const b = `${bbox.south},${bbox.west},${bbox.north},${bbox.east}`
  return `[out:json][timeout:25];
way["highway"~"${HIGHWAY_FILTER}"](${b});
out tags geom 8000;
node["highway"="street_lamp"](${b});
out 8000;`
}

function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371
  const dLat = ((b[0] - a[0]) * Math.PI) / 180
  const dLon = ((b[1] - a[1]) * Math.PI) / 180
  const lat1 = (a[0] * Math.PI) / 180
  const lat2 = (b[0] * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

function wayLengthKm(points: [number, number][]): number {
  let km = 0
  for (let i = 1; i < points.length; i++) {
    km += haversineKm(points[i - 1], points[i])
  }
  return km
}

interface OverpassElement {
  type: "way" | "node"
  id: number
  lat?: number
  lon?: number
  geometry?: { lat: number; lon: number }[]
  tags?: Record<string, string>
}

export async function fetchLighting(
  bbox: Bbox,
  signal?: AbortSignal
): Promise<LightingData> {
  const query = buildQuery(bbox)
  let lastError: unknown
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: "data=" + encodeURIComponent(query),
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        signal,
      })
      if (!res.ok) {
        lastError = new Error(`Overpass returned ${res.status}`)
        continue
      }
      const json = await res.json()
      return parseElements(json.elements ?? [])
    } catch (err) {
      if (signal?.aborted) throw err
      lastError = err
    }
  }
  throw lastError ?? new Error("All Overpass endpoints failed")
}

function parseElements(elements: OverpassElement[]): LightingData {
  const ways: LitWay[] = []
  const lamps: StreetLamp[] = []
  const km: Record<LitStatus, number> = { lit: 0, unlit: 0, unknown: 0 }
  let taggedWays = 0

  for (const el of elements) {
    if (el.type === "way" && el.geometry && el.geometry.length > 1) {
      const litValue = el.tags?.lit
      const status = classifyLit(litValue)
      const points = el.geometry.map(
        (p) => [p.lat, p.lon] as [number, number]
      )
      ways.push({
        id: el.id,
        status,
        points,
        name: el.tags?.name,
        highway: el.tags?.highway ?? "unknown",
        litValue,
      })
      km[status] += wayLengthKm(points)
      if (litValue !== undefined) taggedWays++
    } else if (el.type === "node" && el.lat !== undefined && el.lon !== undefined) {
      lamps.push({ id: el.id, lat: el.lat, lon: el.lon })
    }
  }

  return {
    ways,
    lamps,
    stats: {
      totalWays: ways.length,
      taggedWays,
      coverage: ways.length > 0 ? taggedWays / ways.length : 0,
      litKm: km.lit,
      unlitKm: km.unlit,
      unknownKm: km.unknown,
      lampCount: lamps.length,
    },
  }
}

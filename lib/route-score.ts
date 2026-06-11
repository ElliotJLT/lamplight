// Scores a route polyline against OSM lighting data: how much of this
// run will be on lit streets?
//
// Method: densify the route to ~20m samples, snap each sample to the
// nearest mapped way within 35m (via a uniform grid index), inherit that
// way's lit status, then merge consecutive samples into colored legs.
//
// Honesty rules (see CLAUDE.md): untagged ways are "unknown", never lit.
// The headline score is computed only over the tagged portion of the
// route; data coverage is reported separately as `confidence`.

import type { Bbox, LitStatus, LitWay } from "./overpass"

export type LegStatus = LitStatus | "off-network"

export interface ScoredLeg {
  /** [lat, lon] pairs */
  points: [number, number][]
  status: LegStatus
  km: number
}

export interface RouteScore {
  legs: ScoredLeg[]
  litKm: number
  unlitKm: number
  unknownKm: number
  /** distance not within 35m of any mapped path */
  offNetworkKm: number
  totalKm: number
  /** 0-100, lit share of the *tagged* distance; null if nothing is tagged */
  score: number | null
  /** share of total distance that carries a lit tag, 0-1 */
  confidence: number
}

const SAMPLE_METERS = 20
const MATCH_METERS = 35
const CELL_METERS = 60
const M_PER_DEG_LAT = 110_574

export const MAX_ROUTE_SPAN_KM = 20

/** Bbox covering the route plus a small pad, for the Overpass fetch. */
export function routeBbox(points: [number, number][], padDeg = 0.002): Bbox {
  let south = Infinity
  let west = Infinity
  let north = -Infinity
  let east = -Infinity
  for (const [lat, lon] of points) {
    if (lat < south) south = lat
    if (lat > north) north = lat
    if (lon < west) west = lon
    if (lon > east) east = lon
  }
  const midLat = ((north + south) / 2) * (Math.PI / 180)
  const spanKm = Math.max(
    ((north - south) * M_PER_DEG_LAT) / 1000,
    ((east - west) * M_PER_DEG_LAT * Math.cos(midLat)) / 1000
  )
  if (spanKm > MAX_ROUTE_SPAN_KM) {
    throw new Error(
      `Route covers too large an area for the prototype (max ${MAX_ROUTE_SPAN_KM} km span)`
    )
  }
  return {
    south: south - padDeg,
    west: west - padDeg,
    north: north + padDeg,
    east: east + padDeg,
  }
}

interface GridSeg {
  ax: number
  ay: number
  bx: number
  by: number
  status: LitStatus
}

export function scoreRoute(
  route: [number, number][],
  ways: LitWay[]
): RouteScore {
  if (route.length < 2) throw new Error("A route needs at least two points")

  // Local equirectangular projection (fine at <=20km scale).
  const lat0 = route[0][0]
  const lon0 = route[0][1]
  const mPerDegLon = M_PER_DEG_LAT * Math.cos((lat0 * Math.PI) / 180)
  const toXY = (lat: number, lon: number): [number, number] => [
    (lon - lon0) * mPerDegLon,
    (lat - lat0) * M_PER_DEG_LAT,
  ]

  // Index way segments into a uniform grid, padded by the match radius so
  // a lookup only ever needs the sample's own cell.
  const grid = new Map<string, GridSeg[]>()
  for (const way of ways) {
    for (let i = 1; i < way.points.length; i++) {
      const [ax, ay] = toXY(way.points[i - 1][0], way.points[i - 1][1])
      const [bx, by] = toXY(way.points[i][0], way.points[i][1])
      const seg: GridSeg = { ax, ay, bx, by, status: way.status }
      const x0 = Math.floor((Math.min(ax, bx) - MATCH_METERS) / CELL_METERS)
      const x1 = Math.floor((Math.max(ax, bx) + MATCH_METERS) / CELL_METERS)
      const y0 = Math.floor((Math.min(ay, by) - MATCH_METERS) / CELL_METERS)
      const y1 = Math.floor((Math.max(ay, by) + MATCH_METERS) / CELL_METERS)
      for (let cx = x0; cx <= x1; cx++) {
        for (let cy = y0; cy <= y1; cy++) {
          const key = `${cx},${cy}`
          const cell = grid.get(key)
          if (cell) cell.push(seg)
          else grid.set(key, [seg])
        }
      }
    }
  }

  const matchStatus = (x: number, y: number): LegStatus => {
    const cell = grid.get(
      `${Math.floor(x / CELL_METERS)},${Math.floor(y / CELL_METERS)}`
    )
    if (!cell) return "off-network"
    let best = MATCH_METERS * MATCH_METERS
    let status: LegStatus = "off-network"
    for (const s of cell) {
      const d = pointSegDistSq(x, y, s)
      if (d < best) {
        best = d
        status = s.status
      }
    }
    return status
  }

  // Densify the route to <=20m samples, carrying both lat/lon and xy.
  const dense: { ll: [number, number]; xy: [number, number] }[] = []
  for (let i = 1; i < route.length; i++) {
    const [aLat, aLon] = route[i - 1]
    const [bLat, bLon] = route[i]
    const a = toXY(aLat, aLon)
    const b = toXY(bLat, bLon)
    const len = Math.hypot(b[0] - a[0], b[1] - a[1])
    const n = Math.max(1, Math.ceil(len / SAMPLE_METERS))
    for (let k = 0; k < n; k++) {
      const t = k / n
      dense.push({
        ll: [aLat + (bLat - aLat) * t, aLon + (bLon - aLon) * t],
        xy: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t],
      })
    }
  }
  dense.push({
    ll: route[route.length - 1],
    xy: toXY(route[route.length - 1][0], route[route.length - 1][1]),
  })

  // Classify each sample segment and merge runs of the same status.
  const legs: ScoredLeg[] = []
  const km: Record<LegStatus, number> = {
    lit: 0,
    unlit: 0,
    unknown: 0,
    "off-network": 0,
  }
  for (let i = 1; i < dense.length; i++) {
    const a = dense[i - 1]
    const b = dense[i]
    const segKm =
      Math.hypot(b.xy[0] - a.xy[0], b.xy[1] - a.xy[1]) / 1000
    const status = matchStatus(
      (a.xy[0] + b.xy[0]) / 2,
      (a.xy[1] + b.xy[1]) / 2
    )
    km[status] += segKm
    const last = legs[legs.length - 1]
    if (last && last.status === status) {
      last.points.push(b.ll)
      last.km += segKm
    } else {
      legs.push({ points: [a.ll, b.ll], status, km: segKm })
    }
  }

  const totalKm = km.lit + km.unlit + km.unknown + km["off-network"]
  const taggedKm = km.lit + km.unlit
  return {
    legs,
    litKm: km.lit,
    unlitKm: km.unlit,
    unknownKm: km.unknown,
    offNetworkKm: km["off-network"],
    totalKm,
    score: taggedKm > 0.005 ? Math.round((km.lit / taggedKm) * 100) : null,
    confidence: totalKm > 0 ? taggedKm / totalKm : 0,
  }
}

function pointSegDistSq(px: number, py: number, s: GridSeg): number {
  const dx = s.bx - s.ax
  const dy = s.by - s.ay
  const lenSq = dx * dx + dy * dy
  let t = 0
  if (lenSq > 0) {
    t = ((px - s.ax) * dx + (py - s.ay) * dy) / lenSq
    t = Math.max(0, Math.min(1, t))
  }
  const cx = s.ax + t * dx - px
  const cy = s.ay + t * dy - py
  return cx * cx + cy * cy
}

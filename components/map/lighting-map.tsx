"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { fetchLighting, type LightingData, type LitStatus } from "@/lib/overpass"
import type { LegStatus, RouteScore } from "@/lib/route-score"

export type MapStatus =
  | { kind: "idle" }
  | { kind: "zoom-out" }
  | { kind: "loading" }
  | { kind: "loaded"; data: LightingData }
  | { kind: "error"; message: string }

interface LightingMapProps {
  onStatus: (status: MapStatus) => void
  /** Incremented externally to trigger a flyTo */
  flyTo?: { lat: number; lon: number; seq: number }
  /** Route points being drawn by hand */
  draft: [number, number][]
  /** Scored route to render on top of the lighting layer */
  scored: RouteScore | null
  drawing: boolean
  onMapClick: (lat: number, lon: number) => void
}

const MIN_DATA_ZOOM = 14
const LAMP_ZOOM = 16
const DEFAULT_CENTER: [number, number] = [51.5074, -0.1278]
const DEFAULT_ZOOM = 15

const WAY_STYLE: Record<LitStatus, L.PolylineOptions> = {
  lit: { color: "#fbbf24", weight: 3, opacity: 0.85 },
  unlit: { color: "#f43f5e", weight: 3, opacity: 0.7 },
  unknown: { color: "#475569", weight: 2, opacity: 0.5, dashArray: "4 6" },
}

const ROUTE_STYLE: Record<LegStatus, L.PolylineOptions> = {
  lit: { color: "#fbbf24", weight: 7, opacity: 0.95 },
  unlit: { color: "#f43f5e", weight: 7, opacity: 0.95 },
  unknown: { color: "#94a3b8", weight: 6, opacity: 0.9, dashArray: "6 8" },
  "off-network": { color: "#8b5cf6", weight: 5, opacity: 0.85, dashArray: "2 8" },
}

export function LightingMap({
  onStatus,
  flyTo,
  draft,
  scored,
  drawing,
  onMapClick,
}: LightingMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const draftLayerRef = useRef<L.LayerGroup | null>(null)
  const routeLayerRef = useRef<L.LayerGroup | null>(null)
  const onStatusRef = useRef(onStatus)
  onStatusRef.current = onStatus
  const onMapClickRef = useRef(onMapClick)
  onMapClickRef.current = onMapClick

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
    })
    mapRef.current = map

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
      }
    ).addTo(map)

    L.control.zoom({ position: "bottomright" }).addTo(map)

    const wayLayer = L.layerGroup().addTo(map)
    const lampLayer = L.layerGroup().addTo(map)
    routeLayerRef.current = L.layerGroup().addTo(map)
    draftLayerRef.current = L.layerGroup().addTo(map)

    map.on("click", (e: L.LeafletMouseEvent) => {
      onMapClickRef.current(e.latlng.lat, e.latlng.lng)
    })

    let abort: AbortController | null = null
    let debounce: ReturnType<typeof setTimeout> | null = null

    const load = async () => {
      abort?.abort()
      if (map.getZoom() < MIN_DATA_ZOOM) {
        onStatusRef.current({ kind: "zoom-out" })
        return
      }
      const controller = new AbortController()
      abort = controller
      onStatusRef.current({ kind: "loading" })
      const b = map.getBounds()
      try {
        const data = await fetchLighting(
          {
            south: b.getSouth(),
            west: b.getWest(),
            north: b.getNorth(),
            east: b.getEast(),
          },
          controller.signal
        )
        if (controller.signal.aborted) return
        render(data)
        onStatusRef.current({ kind: "loaded", data })
      } catch (err) {
        if (controller.signal.aborted) return
        onStatusRef.current({
          kind: "error",
          message: err instanceof Error ? err.message : "Failed to load data",
        })
      }
    }

    const render = (data: LightingData) => {
      wayLayer.clearLayers()
      lampLayer.clearLayers()
      for (const way of data.ways) {
        const line = L.polyline(way.points, WAY_STYLE[way.status])
        const label = way.name ?? way.highway
        const lit =
          way.litValue !== undefined ? `lit=${way.litValue}` : "no lighting data"
        line.bindTooltip(`${label} — ${lit}`, { sticky: true })
        wayLayer.addLayer(line)
      }
      if (map.getZoom() >= LAMP_ZOOM) {
        for (const lamp of data.lamps) {
          lampLayer.addLayer(
            L.circleMarker([lamp.lat, lamp.lon], {
              radius: 3,
              color: "#fde68a",
              fillColor: "#fde68a",
              fillOpacity: 0.9,
              weight: 1,
            })
          )
        }
      }
    }

    const scheduleLoad = () => {
      if (debounce) clearTimeout(debounce)
      debounce = setTimeout(load, 500)
    }

    map.on("moveend", scheduleLoad)
    load()

    return () => {
      abort?.abort()
      if (debounce) clearTimeout(debounce)
      map.remove()
      mapRef.current = null
      draftLayerRef.current = null
      routeLayerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (flyTo && mapRef.current) {
      mapRef.current.flyTo(
        [flyTo.lat, flyTo.lon],
        Math.max(mapRef.current.getZoom(), 15)
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flyTo?.seq])

  // Hand-drawn draft route
  useEffect(() => {
    const layer = draftLayerRef.current
    if (!layer) return
    layer.clearLayers()
    if (draft.length === 0) return
    if (draft.length > 1) {
      layer.addLayer(
        L.polyline(draft, { color: "#e4e4e7", weight: 2, dashArray: "2 6" })
      )
    }
    for (const p of draft) {
      layer.addLayer(
        L.circleMarker(p, {
          radius: 4,
          color: "#e4e4e7",
          fillColor: "#18181b",
          fillOpacity: 1,
          weight: 2,
        })
      )
    }
  }, [draft])

  // Scored route overlay
  useEffect(() => {
    const layer = routeLayerRef.current
    const map = mapRef.current
    if (!layer || !map) return
    layer.clearLayers()
    if (!scored) return
    for (const leg of scored.legs) {
      layer.addLayer(L.polyline(leg.points, ROUTE_STYLE[leg.status]))
    }
    const all = scored.legs.flatMap((l) => l.points)
    if (all.length > 0) {
      map.fitBounds(L.latLngBounds(all), { padding: [60, 60], maxZoom: 16 })
    }
  }, [scored])

  return (
    <div
      ref={containerRef}
      className="h-full w-full bg-zinc-950"
      style={{ cursor: drawing ? "crosshair" : undefined }}
    />
  )
}

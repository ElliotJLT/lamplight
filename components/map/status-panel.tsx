"use client"

import type { MapStatus } from "./lighting-map"

const LEGEND = [
  { label: "Lit", className: "bg-amber-400" },
  { label: "Unlit", className: "bg-rose-500" },
  { label: "No data", className: "bg-slate-600" },
] as const

export function StatusPanel({ status }: { status: MapStatus }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/90 p-3 text-sm text-zinc-300 shadow-lg backdrop-blur">
      <div className="mb-2 flex items-center gap-4">
        {LEGEND.map((item) => (
          <span key={item.label} className="flex items-center gap-1.5 text-xs">
            <span className={`h-1 w-4 rounded-full ${item.className}`} />
            {item.label}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-200" />
          Lamp
        </span>
      </div>
      <StatusLine status={status} />
    </div>
  )
}

function StatusLine({ status }: { status: MapStatus }) {
  switch (status.kind) {
    case "idle":
      return <p className="text-xs text-zinc-500">Move the map to load data.</p>
    case "zoom-out":
      return (
        <p className="text-xs text-zinc-400">
          Zoom in to load lighting data for this area.
        </p>
      )
    case "loading":
      return <p className="text-xs text-zinc-400">Loading lighting data…</p>
    case "error":
      return (
        <p className="text-xs text-rose-400">
          Couldn&apos;t load data ({status.message}). Try again in a moment —
          Overpass rate-limits heavy use.
        </p>
      )
    case "loaded": {
      const s = status.data.stats
      const pct = Math.round(s.coverage * 100)
      return (
        <div className="space-y-1">
          <p>
            <span className="font-medium text-zinc-100">{pct}%</span> of paths
            in view have lighting data
            <span className="text-zinc-500">
              {" "}
              ({s.taggedWays} of {s.totalWays} ways)
            </span>
          </p>
          <p className="text-xs text-zinc-400">
            <span className="text-amber-300">{s.litKm.toFixed(1)} km lit</span>
            {" · "}
            <span className="text-rose-400">
              {s.unlitKm.toFixed(1)} km unlit
            </span>
            {" · "}
            <span className="text-zinc-500">
              {s.unknownKm.toFixed(1)} km unknown
            </span>
            {" · "}
            {s.lampCount} lamps
          </p>
        </div>
      )
    }
  }
}

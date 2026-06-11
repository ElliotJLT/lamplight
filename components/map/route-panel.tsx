"use client"

import { useRef } from "react"
import { Loader2, PenLine, Undo2, Upload, X } from "lucide-react"
import type { RouteScore } from "@/lib/route-score"

interface RoutePanelProps {
  drawing: boolean
  draftCount: number
  scored: RouteScore | null
  scoring: boolean
  error: string | null
  onUpload: (file: File) => void
  onStartDraw: () => void
  onScoreDraft: () => void
  onUndo: () => void
  onClear: () => void
}

export function RoutePanel(props: RoutePanelProps) {
  const fileRef = useRef<HTMLInputElement>(null)

  if (props.scoring) {
    return (
      <Frame>
        <p className="flex items-center gap-2 text-xs text-zinc-400">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Matching route to lighting data…
        </p>
      </Frame>
    )
  }

  if (props.scored) {
    return (
      <Frame>
        <ScoreCard scored={props.scored} onClear={props.onClear} />
      </Frame>
    )
  }

  if (props.drawing) {
    return (
      <Frame>
        <div className="flex flex-wrap items-center gap-2">
          <p className="flex-1 text-xs text-zinc-400">
            Tap the map to trace a route ({props.draftCount} point
            {props.draftCount === 1 ? "" : "s"})
          </p>
          <button
            onClick={props.onUndo}
            disabled={props.draftCount === 0}
            className="flex items-center gap-1 rounded-md border border-zinc-800 px-2 py-1 text-xs text-zinc-300 hover:text-zinc-100 disabled:opacity-40"
          >
            <Undo2 className="h-3 w-3" /> Undo
          </button>
          <button
            onClick={props.onClear}
            className="flex items-center gap-1 rounded-md border border-zinc-800 px-2 py-1 text-xs text-zinc-300 hover:text-zinc-100"
          >
            <X className="h-3 w-3" /> Cancel
          </button>
          <button
            onClick={props.onScoreDraft}
            disabled={props.draftCount < 2}
            className="rounded-md bg-amber-400 px-3 py-1 text-xs font-semibold text-zinc-950 hover:bg-amber-300 disabled:opacity-40"
          >
            Score route
          </button>
        </div>
        {props.error && <ErrorLine message={props.error} />}
      </Frame>
    )
  }

  return (
    <Frame>
      <div className="flex items-center gap-2">
        <p className="flex-1 text-xs text-zinc-500">
          Will your usual route be lit?
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".gpx,application/gpx+xml"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) props.onUpload(file)
            e.target.value = ""
          }}
        />
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 rounded-md border border-zinc-800 px-2.5 py-1.5 text-xs text-zinc-200 hover:border-amber-400/40 hover:text-amber-200"
        >
          <Upload className="h-3 w-3" /> Upload GPX
        </button>
        <button
          onClick={props.onStartDraw}
          className="flex items-center gap-1.5 rounded-md border border-zinc-800 px-2.5 py-1.5 text-xs text-zinc-200 hover:border-amber-400/40 hover:text-amber-200"
        >
          <PenLine className="h-3 w-3" /> Draw route
        </button>
      </div>
      {props.error && <ErrorLine message={props.error} />}
    </Frame>
  )
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-t border-zinc-800/80 pt-2">{children}</div>
  )
}

function ErrorLine({ message }: { message: string }) {
  return <p className="mt-1.5 text-xs text-rose-400">{message}</p>
}

function ScoreCard({
  scored,
  onClear,
}: {
  scored: RouteScore
  onClear: () => void
}) {
  const confidencePct = Math.round(scored.confidence * 100)
  return (
    <div>
      <div className="flex items-start gap-3">
        <div className="flex-1">
          {scored.score !== null ? (
            <p className="text-zinc-100">
              <span className="text-2xl font-bold text-amber-300">
                {scored.score}
              </span>
              <span className="text-sm text-zinc-400">/100 after-dark score</span>
            </p>
          ) : (
            <p className="text-sm text-zinc-300">
              No lighting data along this route yet
            </p>
          )}
          <p className="mt-1 text-xs text-zinc-400">
            <span className="text-amber-300">
              {scored.litKm.toFixed(1)} km lit
            </span>
            {" · "}
            <span className="text-rose-400">
              {scored.unlitKm.toFixed(1)} km unlit
            </span>
            {" · "}
            <span className="text-slate-400">
              {scored.unknownKm.toFixed(1)} km no data
            </span>
            {scored.offNetworkKm > 0.05 && (
              <>
                {" · "}
                <span className="text-violet-400">
                  {scored.offNetworkKm.toFixed(1)} km off mapped paths
                </span>
              </>
            )}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">
            {confidencePct}% of this {scored.totalKm.toFixed(1)} km route has
            lighting data
          </p>
        </div>
        <button
          onClick={onClear}
          title="Clear route"
          className="rounded-md border border-zinc-800 p-1.5 text-zinc-400 hover:text-zinc-100"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Lightbulb } from "lucide-react"
import { SearchBox } from "@/components/map/search-box"
import { StatusPanel } from "@/components/map/status-panel"
import type { MapStatus } from "@/components/map/lighting-map"

const LightingMap = dynamic(
  () => import("@/components/map/lighting-map").then((m) => m.LightingMap),
  { ssr: false }
)

export default function Home() {
  const [status, setStatus] = useState<MapStatus>({ kind: "idle" })
  const [flyTo, setFlyTo] = useState<
    { lat: number; lon: number; seq: number } | undefined
  >()

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      <LightingMap onStatus={setStatus} flyTo={flyTo} />

      <header className="pointer-events-none absolute inset-x-0 top-0 z-[1000] p-3">
        <div className="pointer-events-auto mx-auto flex max-w-xl flex-col gap-2 rounded-xl border border-zinc-800 bg-zinc-950/90 p-3 shadow-lg backdrop-blur">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-300" />
            <h1 className="text-sm font-semibold tracking-tight text-zinc-100">
              Lamplight
            </h1>
            <p className="hidden text-xs text-zinc-500 sm:block">
              — see which streets are lit before you run in the dark
            </p>
          </div>
          <SearchBox
            onSelect={(lat, lon) =>
              setFlyTo((prev) => ({ lat, lon, seq: (prev?.seq ?? 0) + 1 }))
            }
          />
        </div>
      </header>

      <footer className="pointer-events-none absolute inset-x-0 bottom-0 z-[1000] p-3 pb-6">
        <div className="pointer-events-auto mx-auto max-w-xl">
          <StatusPanel status={status} />
        </div>
      </footer>
    </div>
  )
}

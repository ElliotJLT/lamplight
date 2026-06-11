import type { Metadata } from "next"
import { MapApp } from "@/components/map/map-app"

export const metadata: Metadata = {
  title: "Map — Lamplight",
}

export default function MapPage() {
  return <MapApp className="h-dvh" />
}

"use client"

import { useState } from "react"
import { Search, LocateFixed, Loader2 } from "lucide-react"
import { searchPlace } from "@/lib/geocode"

interface SearchBoxProps {
  onSelect: (lat: number, lon: number) => void
}

export function SearchBox({ onSelect }: SearchBoxProps) {
  const [query, setQuery] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || busy) return
    setBusy(true)
    setError(null)
    try {
      const results = await searchPlace(query)
      if (results.length === 0) {
        setError("No results found")
      } else {
        onSelect(results[0].lat, results[0].lon)
      }
    } catch {
      setError("Search failed")
    } finally {
      setBusy(false)
    }
  }

  const locate = () => {
    if (!navigator.geolocation) return
    setBusy(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBusy(false)
        onSelect(pos.coords.latitude, pos.coords.longitude)
      },
      () => {
        setBusy(false)
        setError("Could not get your location")
      }
    )
  }

  return (
    <div className="w-full">
      <form onSubmit={submit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setError(null)
            }}
            placeholder="Search a town or city…"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/90 py-2 pl-9 pr-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-amber-400/50 focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={locate}
          title="Use my location"
          className="rounded-lg border border-zinc-800 bg-zinc-900/90 p-2 text-zinc-400 hover:text-amber-300"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LocateFixed className="h-4 w-4" />
          )}
        </button>
      </form>
      {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
    </div>
  )
}

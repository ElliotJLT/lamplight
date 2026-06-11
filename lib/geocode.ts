// Place search via Nominatim (OpenStreetMap's geocoder).

export interface GeocodeResult {
  displayName: string
  lat: number
  lon: number
}

export async function searchPlace(query: string): Promise<GeocodeResult[]> {
  const url =
    "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=" +
    encodeURIComponent(query)
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  })
  if (!res.ok) throw new Error(`Nominatim returned ${res.status}`)
  const json: { display_name: string; lat: string; lon: string }[] =
    await res.json()
  return json.map((r) => ({
    displayName: r.display_name,
    lat: parseFloat(r.lat),
    lon: parseFloat(r.lon),
  }))
}

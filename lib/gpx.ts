// Minimal GPX parser: extracts track/route points from a GPX file.

const MAX_POINTS = 4000

export function parseGpx(xml: string): [number, number][] {
  const doc = new DOMParser().parseFromString(xml, "application/xml")
  if (doc.querySelector("parsererror")) {
    throw new Error("Not a valid GPX file")
  }
  const nodes = Array.from(doc.querySelectorAll("trkpt, rtept"))
  const points: [number, number][] = []
  for (const node of nodes) {
    const lat = parseFloat(node.getAttribute("lat") ?? "")
    const lon = parseFloat(node.getAttribute("lon") ?? "")
    if (Number.isFinite(lat) && Number.isFinite(lon)) points.push([lat, lon])
  }
  if (points.length < 2) {
    throw new Error("No track points found in this GPX file")
  }
  if (points.length > MAX_POINTS) {
    const step = Math.ceil(points.length / MAX_POINTS)
    const thinned = points.filter((_, i) => i % step === 0)
    if (thinned[thinned.length - 1] !== points[points.length - 1]) {
      thinned.push(points[points.length - 1])
    }
    return thinned
  }
  return points
}

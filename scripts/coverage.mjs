#!/usr/bin/env node
// Benchmarks OSM `lit` tag coverage in the central ~3km of major running
// cities, via Overpass count queries. Produces a markdown table.
//
// Usage:
//   node scripts/coverage.mjs            # 21 international running cities
//   node scripts/coverage.mjs --london   # all 33 London boroughs (case study)
//
// Be a good citizen: this runs ~3 light count-queries per area with a
// pause between areas. Don't run it in a loop.

const HIGHWAY_FILTER =
  "^(residential|unclassified|tertiary|tertiary_link|secondary|secondary_link|" +
  "primary|primary_link|living_street|service|footway|path|cycleway|track|" +
  "pedestrian|steps|bridleway)$"

const OVERPASS = "https://overpass-api.de/api/interpreter"
const PAUSE_MS = 2000

// [name, south, west, north, east] — roughly 3km boxes on city centres.
const CITIES = [
  ["London", 51.495, -0.135, 51.525, -0.09],
  ["Manchester", 53.465, -2.27, 53.495, -2.215],
  ["Birmingham", 52.465, -1.925, 52.495, -1.87],
  ["Edinburgh", 55.935, -3.225, 55.965, -3.17],
  ["Bristol", 51.44, -2.625, 51.47, -2.57],
  ["Dublin", 53.33, -6.29, 53.36, -6.235],
  ["Berlin", 52.505, 13.36, 52.535, 13.45],
  ["Munich", 48.12, 11.545, 48.15, 11.6],
  ["Paris", 48.84, 2.32, 48.87, 2.375],
  ["Amsterdam", 52.355, 4.875, 52.385, 4.93],
  ["Copenhagen", 55.665, 12.545, 55.695, 12.6],
  ["Stockholm", 59.32, 18.04, 59.35, 18.095],
  ["Oslo", 59.905, 10.715, 59.935, 10.77],
  ["Helsinki", 60.155, 24.92, 60.185, 24.975],
  ["New York", 40.73, -74.01, 40.76, -73.97],
  ["San Francisco", 37.76, -122.45, 37.79, -122.405],
  ["Chicago", 41.87, -87.66, 41.9, -87.615],
  ["Boston", 42.34, -71.1, 42.37, -71.055],
  ["Toronto", 43.64, -79.41, 43.67, -79.365],
  ["Sydney", -33.885, 151.185, -33.855, 151.23],
  ["Melbourne", -37.83, 144.94, -37.8, 144.985],
]

// [name, centre lat, centre lon] — ~3km box around each borough's centre.
// Boroughs aren't rectangles; this benchmarks the runnable heart of each.
const LONDON_BOROUGHS = [
  ["City of London", 51.515, -0.092],
  ["Westminster", 51.497, -0.137],
  ["Camden", 51.545, -0.16],
  ["Islington", 51.547, -0.105],
  ["Hackney", 51.55, -0.06],
  ["Tower Hamlets", 51.52, -0.035],
  ["Southwark", 51.47, -0.08],
  ["Lambeth", 51.46, -0.115],
  ["Wandsworth", 51.45, -0.19],
  ["Hammersmith & Fulham", 51.495, -0.22],
  ["Kensington & Chelsea", 51.5, -0.19],
  ["Brent", 51.56, -0.27],
  ["Ealing", 51.52, -0.31],
  ["Hounslow", 51.46, -0.36],
  ["Richmond upon Thames", 51.44, -0.3],
  ["Kingston upon Thames", 51.41, -0.3],
  ["Merton", 51.41, -0.2],
  ["Sutton", 51.36, -0.19],
  ["Croydon", 51.37, -0.1],
  ["Bromley", 51.4, 0.02],
  ["Lewisham", 51.45, -0.02],
  ["Greenwich", 51.48, 0.02],
  ["Bexley", 51.45, 0.14],
  ["Newham", 51.53, 0.03],
  ["Waltham Forest", 51.59, -0.01],
  ["Redbridge", 51.57, 0.07],
  ["Barking & Dagenham", 51.54, 0.13],
  ["Havering", 51.57, 0.18],
  ["Enfield", 51.65, -0.08],
  ["Barnet", 51.62, -0.21],
  ["Haringey", 51.59, -0.11],
  ["Harrow", 51.58, -0.33],
  ["Hillingdon", 51.53, -0.45],
].map(([name, lat, lon]) => [name, lat - 0.013, lon - 0.021, lat + 0.013, lon + 0.021])

const AREAS = process.argv.includes("--london") ? LONDON_BOROUGHS : CITIES

async function count(query) {
  const res = await fetch(OVERPASS, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "data=" + encodeURIComponent(`[out:json][timeout:60];${query}out count;`),
  })
  if (!res.ok) throw new Error(`Overpass returned ${res.status}`)
  const json = await res.json()
  return parseInt(json.elements?.[0]?.tags?.total ?? "0", 10)
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const rows = []
for (const [name, s, w, n, e] of AREAS) {
  const bbox = `${s},${w},${n},${e}`
  try {
    const total = await count(`way["highway"~"${HIGHWAY_FILTER}"](${bbox});`)
    await sleep(PAUSE_MS)
    const tagged = await count(
      `way["highway"~"${HIGHWAY_FILTER}"]["lit"](${bbox});`
    )
    await sleep(PAUSE_MS)
    const lamps = await count(`node["highway"="street_lamp"](${bbox});`)
    const pct = total > 0 ? Math.round((tagged / total) * 100) : 0
    const verdict = pct >= 70 ? "✅ strong" : pct >= 40 ? "🟡 partial" : "🔴 sparse"
    rows.push([name, total, tagged, `${pct}%`, lamps, verdict])
    console.error(`${name}: ${pct}% (${tagged}/${total} ways, ${lamps} lamps)`)
  } catch (err) {
    rows.push([name, "—", "—", "error", "—", `⚠️ ${err.message}`])
    console.error(`${name}: failed — ${err.message}`)
  }
  await sleep(PAUSE_MS)
}

console.log("\n| City | Ways | Tagged `lit` | Coverage | Lamps | Verdict |")
console.log("|---|---|---|---|---|---|")
for (const r of rows) console.log(`| ${r.join(" | ")} |`)

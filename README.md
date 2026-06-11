# 💡 Lamplight

**See which streets are lit before you run in the dark.**

A one-day product exploration, open-sourced and parked. The live map, route scorer and data pipeline all work — and the honest market read is at the bottom.

**Live:** https://elliotjlt.github.io/lamplight/

## The idea

For half the year most runs happen in the dark, and "is this route lit?" decides whether a lot of people — especially women — run at all. No mainstream running app can answer it, yet the data mostly exists: OpenStreetMap's `lit` tags, plus lamp-by-lamp council open data that nobody had stitched together.

## What got built

- **Lighting map** — lit / unlit / *unknown* streets worldwide, live from OSM. Unknown is shown honestly, never guessed.
- **Route scoring** — upload a GPX or draw a route, get a 0–100 after-dark score with a confidence figure. Missing data lowers confidence, never inflates the score.
- **Data pipeline** — council lamp inventories → one licence-clean open dataset ([DATA.md](./DATA.md)). Two London boroughs in so far (~30k lamps), refreshed by CI ([LONDON.md](./LONDON.md)), with OSM `lit` proposals as the contribution flywheel.
- The partner thesis and integration surfaces: [PITCH.md](./PITCH.md) · [INTEGRATIONS.md](./INTEGRATIONS.md)

## Why it's parked

The build works; the market read says side project, not company. Three teams have found this idea before (a niche routing tool, a maps giant that never shipped, an OS-accelerator startup) and none broke out — and routing people "safely" is a liability surface mainstream apps deliberately avoid. Full landscape: [COMPETITIVE.md](./COMPETITIVE.md).

Knowing that after one day cost a day. It keeps itself alive: static site, weekly data cron, no servers, no keys.

## Run it

```bash
npm install && npm run dev
```

Next.js 14 (static export) · TypeScript · Leaflet · Overpass · MIT. Map data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors (ODbL), basemap © [CARTO](https://carto.com/attributions), lamp data © the councils credited in [`data/lamps/index.json`](./data/lamps/index.json).

# 💡 Lamplight

**See which streets are lit before you run in the dark.**

Lamplight is an open street-lighting map for night runners. It renders street-lighting data from OpenStreetMap on a dark map, and scores any route — uploaded as GPX or drawn by hand — from 0–100 for how lit it will be after dark.

**Live site:** https://elliotjlt.github.io/lamplight/ (deployed from this repo via GitHub Pages)

## What it does

- **Lighting map** — pan anywhere in the world; streets render **amber (lit)**, **rose (unlit)** or **dashed grey (no data yet)**, with individual lamp posts at high zoom. Data loads live for the area in view.
- **Route scoring** — upload a GPX or trace a route on the map. `lib/route-score.ts` snap-matches it to the lit-street network (~20m sampling, 35m tolerance) and returns a 0–100 after-dark score, a data-confidence figure, and the route split into lit/unlit/unknown legs.
- **Coverage honesty** — the score is computed only over distance that has data: missing data lowers *confidence*, it never inflates the *score*. Untagged streets are shown as unknown, never assumed lit.

## Why

For half the year at northern latitudes, most runs by working adults happen before sunrise or after sunset. Route choice becomes a lighting question — especially for women — and the apps people actually plan runs with can't answer it. The data to answer it already exists in the open; Lamplight makes it visible, scoreable, and easy for any route-planning product to adopt.

## Do we have the data? Is this UK-only?

**Not UK-only.** Everything renders from OpenStreetMap, which is worldwide: the [`lit` tag](https://wiki.openstreetmap.org/wiki/Key:lit) on ways and [`highway=street_lamp`](https://wiki.openstreetmap.org/wiki/Tag:highway=street_lamp) nodes. Coverage varies city by city because it depends on volunteer surveying — typically strong in northern-European cities, patchier elsewhere. Run `node scripts/coverage.mjs` to benchmark `lit` coverage across 21 running cities and print a markdown table.

Where coverage is thin, the plan is not a private database. Lamp-by-lamp records exist beyond OSM — many local councils publish theirs as open data, and a national-scale GB street-lights dataset exists under a public-sector licence (a partnership conversation, not a free download). The roadmap's import pipeline converts compatibly-licensed open datasets into OSM tagging, so every OSM-based map and app improves at once.

## London first

The strategy is to nail one city as a case study before expanding: **[LONDON.md](./LONDON.md)** — a per-borough OSM lighting-coverage benchmark (auto-refreshed weekly by the `london-data` GitHub Action), borough open-data ingestion targets, and the iconic routes we score for the pitch.

## Data pipeline

The moat isn't the map — it's the unglamorous work of turning hundreds of inconsistent council lamp datasets into one canonical, licence-clean layer and feeding it back into OSM. `scripts/ingest.mjs` normalizes council open data (CSV/GeoJSON/ArcGIS, BNG→WGS84, Claude-assisted schema mapping for messy files) into `data/lamps/`, and `scripts/conflate.mjs` turns ingested lamps into human-reviewable `lit=yes` proposals for OSM. Full docs, licensing rules and the repo-size answer: [DATA.md](./DATA.md).

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 — landing page with the embedded live map; the full-screen app is at `/map`.

## For route-planning products

The scorer is a small, dependency-free TypeScript module designed to be lifted into any routing or fitness product, with "prefer lit streets" routing weights and a pre-rendered tile layer on the roadmap. Integration surfaces and data-licensing notes: [INTEGRATIONS.md](./INTEGRATIONS.md). The partner one-pager: [PITCH.md](./PITCH.md).

## Roadmap

1. ~~Route scoring~~ — ✅ shipped (GPX upload, draw-on-map, embeddable scorer)
2. ~~Public site~~ — ✅ GitHub Pages deploy from this repo
3. **Publish the coverage benchmark** — run `scripts/coverage.mjs`, commit the table
4. ~~Import pipeline~~ — ✅ v0 shipped: `ingest.mjs` (council data → canonical lamp dataset) + `conflate.mjs` (lamps → OSM `lit` proposals); next is running it across councils and the first community-reviewed import
5. **Pre-rendered vector tiles** — a lighting layer any app can add in one line, without hammering Overpass
6. **Reference routing profiles** — "prefer lit streets" weights for the major open routing engines

## Tech

Next.js 14 (static export) · TypeScript · Tailwind CSS · Leaflet · Overpass API · Nominatim

## License & attribution

Code MIT. Map data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors (ODbL). Basemap © [CARTO](https://carto.com/attributions). Please be gentle with public OSM infrastructure — requests are debounced and bounded by design.

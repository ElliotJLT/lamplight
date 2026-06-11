# Lamplight - Project Context

## About This Project
Lamplight is an open street-lighting map for running after dark. It renders OpenStreetMap `lit` data (lit/unlit/untagged ways and street lamp nodes) on a dark map so runners can plan safe night routes. The long-term goal is an embeddable "lighting layer" (tiles + routing weights + route scores) that running apps like Strava and Komoot can integrate — see PITCH.md.

This repo previously contained "Plod", a personal running PWA. That product was removed in June 2026; its history is in git.

## Architecture
- Pure client-side Next.js 14 (App Router) + TypeScript — no backend, no auth, no env vars
- `lib/overpass.ts` — Overpass API client: fetches highway ways + street lamps for a bbox, classifies `lit` tags, computes coverage stats
- `lib/geocode.ts` — Nominatim place search
- `lib/route-score.ts` — embeddable route scorer: snap-matches a polyline to lit ways (grid index, ~20m samples, 35m tolerance), returns 0-100 score + confidence + colored legs
- `lib/gpx.ts` — minimal GPX track/route parser
- `components/map/lighting-map.tsx` — Leaflet map (CARTO dark basemap), debounced viewport fetching, way/lamp/route rendering, draw mode
- `components/map/status-panel.tsx` — legend + coverage stats
- `components/map/route-panel.tsx` — GPX upload / draw controls + score card
- `app/page.tsx` — single full-screen map page, owns route state
- `scripts/coverage.mjs` — node CLI benchmarking `lit` coverage across 21 cities
- `scripts/ingest.mjs` — council open data → `data/lamps/<id>.csv.gz` + index.json (heuristic column mapping, claude-sonnet-4-6 fallback for messy schemas, OSGB36→WGS84 conversion); see DATA.md
- `scripts/conflate.mjs` — ingested lamps × Overpass untagged ways → human-reviewable `lit=yes` proposals (never auto-edits OSM)
- `INTEGRATIONS.md` / `PITCH.md` — partner-facing docs

## Key Behaviours
- Data only loads at zoom >= 14 (Overpass payload limits); lamps render at zoom >= 16
- Way colors: lit = amber, unlit = rose, no `lit` tag = dashed grey ("no data" is shown honestly, never assumed)
- Overpass requests are debounced (500ms) and aborted on map movement; falls back to a second Overpass mirror

## Code Style
- TypeScript strict mode, named exports, ES modules
- Functional components with hooks; keep components small
- Dark theme only — the product is for planning night runs

## Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

## Important Rules
1. Be honest about data coverage — never render untagged ways as if they were lit or unlit; the route score is computed only over tagged distance (missing data lowers `confidence`, never inflates `score`)
2. Be a good citizen of OSM infrastructure: debounce/abort Overpass calls, keep queries bounded, attribute OSM/CARTO
3. Mobile-first (375px minimum); the primary use case is a phone at the front door before a run
4. No accounts, no tracking, no API keys — keep it static and open

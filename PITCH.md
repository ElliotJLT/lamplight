# Lamplight — the lighting layer your routing engine is missing

*A one-pager for running, walking and cycling apps.*

## The problem your users have

From October to March, the majority of runs by working adults happen in the dark. Ask your users — particularly women — what stops them running in winter, and the answer is rarely fitness or motivation. It's *"I don't know which routes are lit."*

Today your app routes by distance, elevation, surface and popularity. None of those answer the question people actually ask at 6pm in December.

## The product

Lamplight is an **open street-lighting layer**: which streets and paths are lit at night, as data your product can consume.

Three integration surfaces, in order of effort:

1. **Tile layer** — a pre-rendered lit/unlit overlay. One line of code, instant "night mode" map view.
2. **Routing weight** — a per-edge lighting attribute for your routing engine, enabling a "prefer lit streets" toggle (Valhalla/OSRM/GraphHopper-compatible profiles).
3. **Route score** — a 0–100 "after-dark" score for any polyline, for route cards and recommendations.

## Why open data, and why now

- **The data exists.** OpenStreetMap already carries `lit=yes/no` on millions of ways, with strong coverage in many European cities. Ordnance Survey has captured **6.5M street lights across Great Britain** from aerial imagery; dozens of councils publish lamp locations as open data. Nobody has fused these into a usable product layer.
- **The demand is validated.** Google has been testing a Maps "lighting layer" since 2019 — they see the demand, but they haven't shipped, and they will never expose it as data *you* can build routing on. Trail Router's "avoid unlit streets" option proves the feature works; it just lives in a niche tool.
- **Open beats proprietary here.** Lighting is municipal infrastructure data. It belongs in the commons (OSM), maintained once, used by everyone — the same playbook that made OSM the default basemap for every fitness app. Improvements Lamplight makes flow back into OSM; your existing OSM-based stack picks them up for free.

## Why a partner, not a competitor

Lamplight is not a running app. There is no social graph, no activity tracking, no subscription. It's infrastructure: a demo map, an import pipeline pushing council/OS lamp data into OSM, and (next) tiles + APIs. We want it inside Strava, Komoot, Garmin, Runna and parkrun route pages — not next to them.

**The ask:** a pilot. Pick one city. We supply the lighting layer; you ship a "run in the light" toggle to a test cohort and measure winter retention. If lit-route confidence moves the needle on dark-month activity — your biggest seasonal churn window — we scale it together.

## Status

- ✅ Working prototype: live worldwide map of lit/unlit ways + lamp positions from OSM, with per-viewport coverage stats
- 🔜 Coverage benchmark across top running cities
- 🔜 Council/OS data → OSM import pipeline (the data flywheel)
- 🔜 Vector tiles + route scoring API

MIT licensed. Data ODbL via OpenStreetMap.

*Contact: Elliot Little — elliotjlittle@gmail.com*

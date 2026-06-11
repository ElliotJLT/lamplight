# Competitive landscape

Internal scan, June 2026. Names are used freely here; public-facing docs
(README, PITCH, site) stay generic.

## Who else is doing "lit routes"?

| Player | What they have | Data | Why it isn't Lamplight |
|---|---|---|---|
| **Google Maps** | "Lighting layer" tested since ~2019, never shipped widely | Proprietary | Validates demand. Will never expose lighting as data others can route on; fitness apps can't build on it |
| **Trail Router** | "Avoid unlit streets" routing option | OSM `lit` | Closest existing feature. Buried in a niche enthusiast tool; not embeddable by other apps; no coverage honesty UI |
| **SafeWalkMaps / Walkable / NightLight (iOS)** | Consumer walking-safety apps, "safety scores" blending lighting with crime data | Mixed/closed, US-centric | Walking + personal-safety positioning, closed data, city-by-city rollout. Crime-score framing is a liability minefield fitness brands avoid |
| **NightLight (CHI 2025 paper)** | Phone-sensor ambient-light mapping research | Crowdsensed | Academic prototype. Validates that light data changes ~70% of route choices. Possible future data source, not a competitor |
| **OSMStreetLight / OsmAnd** | OSM-ecosystem renderers showing lamps / lit ways | OSM | Mapper tools, not runner products; no scoring, no integration surface |
| **Ordnance Survey** | 6.5M street lights, GB-wide, aerial-derived | PSGA (public sector licence, **not open**) | A data supplier / partner prospect, not a competitor. Proves national-scale capture is feasible |

## The gap Lamplight sits in

Nobody offers an **open, embeddable lighting layer for fitness/routing
products**: honest about coverage, license-clean (ODbL), with a scorer a
partner can lift in a sprint. Consumer safety apps compete with running
apps for the end user; Lamplight supplies them instead.

## Threats

1. **Google ships their layer** — mitigated: it would still be closed; the
   pitch to running apps (data they can route on) survives, and demand
   awareness rises.
2. **OSM coverage gaps** make the demo underwhelming in target cities —
   mitigated by the import pipeline (council open data → OSM) being the
   core roadmap item, and by the coverage benchmark setting expectations
   honestly.
3. **A running app builds it in-house from OSM directly** — real risk;
   the moat is doing the unglamorous data work (classification table,
   imports, tiles) that no single app wants to own. Speed matters.

# Case study: London

London first. Biggest runner market in Europe, dark commutes from October
to March, 33 boroughs that work as a repeatable unit — nail London, then
expand borough-by-borough logic to any city if partners bite.

## Method

1. **Benchmark** — per-borough OSM `lit` coverage (the table below is
   generated automatically by the `london-data` GitHub Action, which runs
   `scripts/coverage.mjs --london` against Overpass and commits the
   result).
2. **Ingest** — borough open-data lamp inventories via
   `scripts/ingest.mjs` into `data/lamps/`.
3. **Conflate** — `scripts/conflate.mjs` turns ingested lamps into
   human-reviewable `lit=yes` proposals for the boroughs where OSM is
   weakest (highest-value contributions first).
4. **Prove it** — score iconic London routes and publish before/after
   coverage for the boroughs we improve.

## Borough lighting coverage in OSM

<!-- coverage:start -->

*Generated 2026-08-03 from live OSM data via Overpass.*

| City | Ways | Tagged `lit` | Coverage | Lamps | Verdict |
|---|---|---|---|---|---|
| City of London | 21217 | 7306 | 34% | 425 | 🔴 sparse |
| Westminster | 12448 | 4366 | 35% | 360 | 🔴 sparse |
| Camden | — | — | error | — | ⚠️ Overpass returned 504 |
| Islington | — | — | error | — | ⚠️ Overpass returned 504 |
| Hackney | — | — | error | — | ⚠️ Overpass returned 504 |
| Tower Hamlets | 9656 | 4461 | 46% | 369 | 🟡 partial |
| Southwark | — | — | error | — | ⚠️ Overpass returned 502 |
| Lambeth | 5363 | 1071 | 20% | 7 | 🔴 sparse |
| Wandsworth | 4453 | 906 | 20% | 8 | 🔴 sparse |
| Hammersmith & Fulham | — | — | error | — | ⚠️ Overpass returned 504 |
| Kensington & Chelsea | 5788 | 2518 | 44% | 14 | 🟡 partial |
| Brent | 2703 | 637 | 24% | 168 | 🔴 sparse |
| Ealing | 2943 | 781 | 27% | 83 | 🔴 sparse |
| Hounslow | — | — | error | — | ⚠️ Overpass returned 504 |
| Richmond upon Thames | 1784 | 337 | 19% | 0 | 🔴 sparse |
| Kingston upon Thames | — | — | error | — | ⚠️ Overpass returned 504 |
| Merton | 4252 | 1438 | 34% | 52 | 🔴 sparse |
| Sutton | — | — | error | — | ⚠️ Overpass returned 504 |
| Croydon | 3612 | 1013 | 28% | 69 | 🔴 sparse |
| Bromley | 2139 | 547 | 26% | 5 | 🔴 sparse |
| Lewisham | — | — | error | — | ⚠️ Overpass returned 504 |
| Greenwich | — | — | error | — | ⚠️ Overpass returned 504 |
| Bexley | 3115 | 399 | 13% | 83 | 🔴 sparse |
| Newham | 5048 | 2234 | 44% | 86 | 🟡 partial |
| Waltham Forest | 4535 | 1216 | 27% | 65 | 🔴 sparse |
| Redbridge | — | — | error | — | ⚠️ fetch failed |
| Barking & Dagenham | 2227 | 855 | 38% | 5 | 🔴 sparse |
| Havering | — | — | error | — | ⚠️ Overpass returned 504 |
| Enfield | — | — | error | — | ⚠️ Overpass returned 502 |
| Barnet | — | — | error | — | ⚠️ Overpass returned 504 |
| Haringey | 5309 | 1242 | 23% | 192 | 🔴 sparse |
| Harrow | 2384 | 1348 | 57% | 30 | 🟡 partial |
| Hillingdon | — | — | error | — | ⚠️ Overpass returned 504 |

<!-- coverage:end -->

Reading the table: **Verdict** reflects how much of each borough's
runnable streets carry any `lit` tag in OSM. 🔴 boroughs with an open
lamp dataset are the highest-value ingestion targets.

## Borough open-data sources

| Borough | Dataset | Status |
|---|---|---|
| Barnet | [Street lighting inventory](https://open.barnet.gov.uk/dataset/e7kq2/street-lighting-inventory) | ✅ **Ingested** — 19,898 lamps (`data/lamps/barnet.csv.gz`, 2020-07 inventory, filtered to `SL` asset types) |
| Camden | [Camden open data portal](https://opendata.camden.gov.uk) (Socrata) | ✅ **Ingested** — 10,376 lamps (`data/lamps/camden.csv.gz`, auto-fetched by CI) |
| Lambeth | Lambeth open mapping data portal | Known to publish street lighting; needs URL |
| All boroughs | [London Datastore](https://data.london.gov.uk/search?q=street%20lighting) + [data.gov.uk](https://www.data.gov.uk/search?q=street+lighting+london) | Search for the rest |

Note: TfL manages lighting on red routes; boroughs manage the rest. A
complete London layer eventually needs both.

## Routes to score for the pitch

Before/after demo candidates (GPX → after-dark score in the app):

- Thames Bridges loop (Westminster ↔ Tower Bridge) — the postcard
- Regent's Park Outer Circle — classic winter training loop
- Victoria Park 5k — east London's running hub
- Hampstead Heath — famously unlit; the honest "score: low, confidence: high" example
- A south London commuter run crossing Clapham/Tooting commons

The pitch artefact: "X% of [borough]'s streets had no lighting data;
after ingesting the council's lamp inventory and community-reviewed OSM
tagging, runners can now score routes there with Y% confidence."

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

*Generated 2026-09-07 from live OSM data via Overpass.*

| City | Ways | Tagged `lit` | Coverage | Lamps | Verdict |
|---|---|---|---|---|---|
| City of London | 19377 | 7836 | 40% | 425 | 🟡 partial |
| Westminster | 12415 | 4705 | 38% | 360 | 🔴 sparse |
| Camden | 5918 | 1973 | 33% | 90 | 🔴 sparse |
| Islington | 6803 | 3824 | 56% | 416 | 🟡 partial |
| Hackney | 7656 | 5189 | 68% | 306 | 🟡 partial |
| Tower Hamlets | — | — | error | — | ⚠️ Overpass returned 504 |
| Southwark | — | — | error | — | ⚠️ Overpass returned 504 |
| Lambeth | 5356 | 1150 | 21% | 7 | 🔴 sparse |
| Wandsworth | — | — | error | — | ⚠️ Overpass returned 504 |
| Hammersmith & Fulham | 6075 | 2444 | 40% | 3 | 🟡 partial |
| Kensington & Chelsea | 5786 | 2543 | 44% | 14 | 🟡 partial |
| Brent | 2720 | 633 | 23% | 168 | 🔴 sparse |
| Ealing | 2942 | 809 | 27% | 83 | 🔴 sparse |
| Hounslow | — | — | error | — | ⚠️ Overpass returned 504 |
| Richmond upon Thames | — | — | error | — | ⚠️ Overpass returned 504 |
| Kingston upon Thames | 3832 | 984 | 26% | 8 | 🔴 sparse |
| Merton | 4251 | 1420 | 33% | 52 | 🔴 sparse |
| Sutton | 2738 | 339 | 12% | 1 | 🔴 sparse |
| Croydon | 3606 | 998 | 28% | 74 | 🔴 sparse |
| Bromley | 2144 | 547 | 26% | 5 | 🔴 sparse |
| Lewisham | 3001 | 920 | 31% | 100 | 🔴 sparse |
| Greenwich | 7062 | 2488 | 35% | 440 | 🔴 sparse |
| Bexley | 3135 | 399 | 13% | 83 | 🔴 sparse |
| Newham | 4944 | 2234 | 45% | 86 | 🟡 partial |
| Waltham Forest | 4467 | 1227 | 27% | 65 | 🔴 sparse |
| Redbridge | — | — | error | — | ⚠️ Overpass returned 504 |
| Barking & Dagenham | — | — | error | — | ⚠️ Overpass returned 504 |
| Havering | 2393 | 690 | 29% | 6 | 🔴 sparse |
| Enfield | — | — | error | — | ⚠️ Overpass returned 504 |
| Barnet | 892 | 145 | 16% | 0 | 🔴 sparse |
| Haringey | 5316 | 1249 | 23% | 208 | 🔴 sparse |
| Harrow | 2364 | 1347 | 57% | 30 | 🟡 partial |
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

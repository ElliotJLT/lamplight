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

*Generated 2026-08-17 from live OSM data via Overpass.*

| City | Ways | Tagged `lit` | Coverage | Lamps | Verdict |
|---|---|---|---|---|---|
| City of London | 21210 | 7418 | 35% | 419 | 🔴 sparse |
| Westminster | — | — | error | — | ⚠️ Overpass returned 504 |
| Camden | — | — | error | — | ⚠️ Overpass returned 504 |
| Islington | 6840 | 3878 | 57% | 260 | 🟡 partial |
| Hackney | 7635 | 4664 | 61% | 306 | 🟡 partial |
| Tower Hamlets | 9667 | 4519 | 47% | 369 | 🟡 partial |
| Southwark | 4676 | 861 | 18% | 1 | 🔴 sparse |
| Lambeth | — | — | error | — | ⚠️ Overpass returned 504 |
| Wandsworth | 4537 | 931 | 21% | 8 | 🔴 sparse |
| Hammersmith & Fulham | 5874 | 2372 | 40% | 3 | 🟡 partial |
| Kensington & Chelsea | 5800 | 2528 | 44% | 14 | 🟡 partial |
| Brent | 2703 | 637 | 24% | 168 | 🔴 sparse |
| Ealing | — | — | error | — | ⚠️ Overpass returned 504 |
| Hounslow | 2508 | 567 | 23% | 40 | 🔴 sparse |
| Richmond upon Thames | 1798 | 331 | 18% | 0 | 🔴 sparse |
| Kingston upon Thames | 3845 | 972 | 25% | 8 | 🔴 sparse |
| Merton | 4252 | 1438 | 34% | 52 | 🔴 sparse |
| Sutton | 2584 | 327 | 13% | 1 | 🔴 sparse |
| Croydon | — | — | error | — | ⚠️ Overpass returned 504 |
| Bromley | 2143 | 547 | 26% | 5 | 🔴 sparse |
| Lewisham | 2939 | 921 | 31% | 100 | 🔴 sparse |
| Greenwich | 6844 | 2487 | 36% | 456 | 🔴 sparse |
| Bexley | 3204 | 399 | 12% | 83 | 🔴 sparse |
| Newham | 5061 | 2234 | 44% | 86 | 🟡 partial |
| Waltham Forest | — | — | error | — | ⚠️ Overpass returned 504 |
| Redbridge | — | — | error | — | ⚠️ Overpass returned 504 |
| Barking & Dagenham | 2229 | 855 | 38% | 5 | 🔴 sparse |
| Havering | 2473 | 605 | 24% | 6 | 🔴 sparse |
| Enfield | 2737 | 1105 | 40% | 123 | 🟡 partial |
| Barnet | — | — | error | — | ⚠️ Overpass returned 504 |
| Haringey | 5314 | 1231 | 23% | 192 | 🔴 sparse |
| Harrow | 2364 | 1341 | 57% | 30 | 🟡 partial |
| Hillingdon | 1748 | 263 | 15% | 0 | 🔴 sparse |

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

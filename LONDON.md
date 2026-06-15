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

*Generated 2026-06-15 from live OSM data via Overpass.*

| City | Ways | Tagged `lit` | Coverage | Lamps | Verdict |
|---|---|---|---|---|---|
| City of London | 21141 | 7377 | 35% | 421 | 🔴 sparse |
| Westminster | — | — | error | — | ⚠️ Overpass returned 504 |
| Camden | 5877 | 1969 | 34% | 90 | 🔴 sparse |
| Islington | 6688 | 3829 | 57% | 145 | 🟡 partial |
| Hackney | 7529 | 4662 | 62% | 306 | 🟡 partial |
| Tower Hamlets | 9514 | 4405 | 46% | 369 | 🟡 partial |
| Southwark | 4608 | 861 | 19% | 1 | 🔴 sparse |
| Lambeth | 5371 | 1015 | 19% | 7 | 🔴 sparse |
| Wandsworth | 4455 | 906 | 20% | 8 | 🔴 sparse |
| Hammersmith & Fulham | 5833 | 2364 | 41% | 3 | 🟡 partial |
| Kensington & Chelsea | 5779 | 2527 | 44% | 14 | 🟡 partial |
| Brent | 2642 | 633 | 24% | 168 | 🔴 sparse |
| Ealing | 2931 | 810 | 28% | 83 | 🔴 sparse |
| Hounslow | 2448 | 551 | 23% | 40 | 🔴 sparse |
| Richmond upon Thames | 1784 | 331 | 19% | 0 | 🔴 sparse |
| Kingston upon Thames | 3713 | 931 | 25% | 8 | 🔴 sparse |
| Merton | 4247 | 1420 | 33% | 52 | 🔴 sparse |
| Sutton | 2641 | 329 | 12% | 1 | 🔴 sparse |
| Croydon | — | — | error | — | ⚠️ Overpass returned 504 |
| Bromley | 2137 | 547 | 26% | 5 | 🔴 sparse |
| Lewisham | 2941 | 931 | 32% | 64 | 🔴 sparse |
| Greenwich | 6850 | 2460 | 36% | 441 | 🔴 sparse |
| Bexley | 3113 | 399 | 13% | 83 | 🔴 sparse |
| Newham | 5041 | 2234 | 44% | 86 | 🟡 partial |
| Waltham Forest | — | — | error | — | ⚠️ Overpass returned 504 |
| Redbridge | 2688 | 650 | 24% | 193 | 🔴 sparse |
| Barking & Dagenham | 2226 | 855 | 38% | 5 | 🔴 sparse |
| Havering | 2473 | 571 | 23% | 6 | 🔴 sparse |
| Enfield | 2737 | 1105 | 40% | 123 | 🟡 partial |
| Barnet | 892 | 145 | 16% | 0 | 🔴 sparse |
| Haringey | 5224 | 1231 | 24% | 192 | 🔴 sparse |
| Harrow | 2374 | 1343 | 57% | 30 | 🟡 partial |
| Hillingdon | 1696 | 233 | 14% | 0 | 🔴 sparse |

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

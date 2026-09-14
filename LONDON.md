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

*Generated 2026-09-14 from live OSM data via Overpass.*

| City | Ways | Tagged `lit` | Coverage | Lamps | Verdict |
|---|---|---|---|---|---|
| City of London | — | — | error | — | ⚠️ Overpass returned 504 |
| Westminster | 12203 | 4440 | 36% | 360 | 🔴 sparse |
| Camden | — | — | error | — | ⚠️ Overpass returned 504 |
| Islington | 6792 | 3878 | 57% | 145 | 🟡 partial |
| Hackney | 7478 | 4639 | 62% | 430 | 🟡 partial |
| Tower Hamlets | 9322 | 4458 | 48% | 369 | 🟡 partial |
| Southwark | 4679 | 885 | 19% | 1 | 🔴 sparse |
| Lambeth | — | — | error | — | ⚠️ Overpass returned 504 |
| Wandsworth | — | — | error | — | ⚠️ Overpass returned 504 |
| Hammersmith & Fulham | — | — | error | — | ⚠️ Overpass returned 504 |
| Kensington & Chelsea | 5788 | 2542 | 44% | 14 | 🟡 partial |
| Brent | — | — | error | — | ⚠️ Overpass returned 504 |
| Ealing | — | — | error | — | ⚠️ Overpass returned 504 |
| Hounslow | 2524 | 566 | 22% | 40 | 🔴 sparse |
| Richmond upon Thames | 1784 | 337 | 19% | 0 | 🔴 sparse |
| Kingston upon Thames | — | — | error | — | ⚠️ Overpass returned 504 |
| Merton | 4251 | 1438 | 34% | 52 | 🔴 sparse |
| Sutton | 2738 | 339 | 12% | 1 | 🔴 sparse |
| Croydon | 3613 | 998 | 28% | 74 | 🔴 sparse |
| Bromley | — | — | error | — | ⚠️ Overpass returned 504 |
| Lewisham | 3001 | 919 | 31% | 100 | 🔴 sparse |
| Greenwich | 7065 | 2459 | 35% | 456 | 🔴 sparse |
| Bexley | — | — | error | — | ⚠️ Overpass returned 504 |
| Newham | 5038 | 2325 | 46% | 86 | 🟡 partial |
| Waltham Forest | — | — | error | — | ⚠️ Overpass returned 504 |
| Redbridge | 2661 | 650 | 24% | 193 | 🔴 sparse |
| Barking & Dagenham | — | — | error | — | ⚠️ Overpass returned 504 |
| Havering | 2479 | 699 | 28% | 6 | 🔴 sparse |
| Enfield | 2737 | 1107 | 40% | 123 | 🟡 partial |
| Barnet | 892 | 145 | 16% | 0 | 🔴 sparse |
| Haringey | 5315 | 1231 | 23% | 208 | 🔴 sparse |
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

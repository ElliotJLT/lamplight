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

*Generated 2026-07-20 from live OSM data via Overpass.*

| City | Ways | Tagged `lit` | Coverage | Lamps | Verdict |
|---|---|---|---|---|---|
| City of London | 21197 | 7419 | 35% | 425 | 🔴 sparse |
| Westminster | — | — | error | — | ⚠️ fetch failed |
| Camden | 5889 | 1973 | 34% | 90 | 🔴 sparse |
| Islington | 6780 | 3857 | 57% | 145 | 🟡 partial |
| Hackney | 7601 | 4663 | 61% | 306 | 🟡 partial |
| Tower Hamlets | 9633 | 4401 | 46% | 369 | 🟡 partial |
| Southwark | — | — | error | — | ⚠️ fetch failed |
| Lambeth | 5389 | 1015 | 19% | 7 | 🔴 sparse |
| Wandsworth | 4453 | 906 | 20% | 8 | 🔴 sparse |
| Hammersmith & Fulham | — | — | error | — | ⚠️ fetch failed |
| Kensington & Chelsea | 5802 | 2518 | 43% | 14 | 🟡 partial |
| Brent | 2675 | 633 | 24% | 168 | 🔴 sparse |
| Ealing | — | — | error | — | ⚠️ fetch failed |
| Hounslow | — | — | error | — | ⚠️ Overpass returned 504 |
| Richmond upon Thames | 1793 | 332 | 19% | 0 | 🔴 sparse |
| Kingston upon Thames | 3740 | 971 | 26% | 8 | 🔴 sparse |
| Merton | — | — | error | — | ⚠️ fetch failed |
| Sutton | — | — | error | — | ⚠️ fetch failed |
| Croydon | — | — | error | — | ⚠️ fetch failed |
| Bromley | 2139 | 547 | 26% | 5 | 🔴 sparse |
| Lewisham | — | — | error | — | ⚠️ Overpass returned 504 |
| Greenwich | — | — | error | — | ⚠️ Overpass returned 504 |
| Bexley | 3131 | 399 | 13% | 83 | 🔴 sparse |
| Newham | 5055 | 2234 | 44% | 86 | 🟡 partial |
| Waltham Forest | — | — | error | — | ⚠️ fetch failed |
| Redbridge | — | — | error | — | ⚠️ fetch failed |
| Barking & Dagenham | — | — | error | — | ⚠️ Overpass returned 504 |
| Havering | 2479 | 603 | 24% | 6 | 🔴 sparse |
| Enfield | 2737 | 1105 | 40% | 123 | 🟡 partial |
| Barnet | 891 | 145 | 16% | 0 | 🔴 sparse |
| Haringey | 5224 | 1229 | 24% | 192 | 🔴 sparse |
| Harrow | 2365 | 1343 | 57% | 30 | 🟡 partial |
| Hillingdon | 1744 | 263 | 15% | 0 | 🔴 sparse |

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

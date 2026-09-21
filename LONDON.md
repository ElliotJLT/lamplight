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

*Generated 2026-09-21 from live OSM data via Overpass.*

| City | Ways | Tagged `lit` | Coverage | Lamps | Verdict |
|---|---|---|---|---|---|
| City of London | 21202 | 7422 | 35% | 419 | 🔴 sparse |
| Westminster | 11115 | 4366 | 39% | 360 | 🔴 sparse |
| Camden | 5919 | 1985 | 34% | 90 | 🔴 sparse |
| Islington | 6787 | 3938 | 58% | 145 | 🟡 partial |
| Hackney | 7676 | 5220 | 68% | 430 | 🟡 partial |
| Tower Hamlets | 9632 | 4767 | 49% | 370 | 🟡 partial |
| Southwark | — | — | error | — | ⚠️ Overpass returned 504 |
| Lambeth | — | — | error | — | ⚠️ fetch failed |
| Wandsworth | 4550 | 937 | 21% | 8 | 🔴 sparse |
| Hammersmith & Fulham | 6141 | 2537 | 41% | 3 | 🟡 partial |
| Kensington & Chelsea | — | — | error | — | ⚠️ Overpass returned 504 |
| Brent | — | — | error | — | ⚠️ Overpass returned 504 |
| Ealing | 2923 | 828 | 28% | 83 | 🔴 sparse |
| Hounslow | 2524 | 582 | 23% | 40 | 🔴 sparse |
| Richmond upon Thames | 1798 | 337 | 19% | 0 | 🔴 sparse |
| Kingston upon Thames | — | — | error | — | ⚠️ Overpass returned 504 |
| Merton | 4256 | 1439 | 34% | 52 | 🔴 sparse |
| Sutton | — | — | error | — | ⚠️ Overpass returned 504 |
| Croydon | — | — | error | — | ⚠️ Overpass returned 504 |
| Bromley | 2137 | 549 | 26% | 5 | 🔴 sparse |
| Lewisham | — | — | error | — | ⚠️ Overpass returned 504 |
| Greenwich | — | — | error | — | ⚠️ Overpass returned 504 |
| Bexley | 3206 | 399 | 12% | 83 | 🔴 sparse |
| Newham | 5055 | 2325 | 46% | 86 | 🟡 partial |
| Waltham Forest | — | — | error | — | ⚠️ Overpass returned 504 |
| Redbridge | 2688 | 648 | 24% | 193 | 🔴 sparse |
| Barking & Dagenham | — | — | error | — | ⚠️ Overpass returned 504 |
| Havering | — | — | error | — | ⚠️ Overpass returned 504 |
| Enfield | 2737 | 1105 | 40% | 123 | 🟡 partial |
| Barnet | — | — | error | — | ⚠️ Overpass returned 504 |
| Haringey | 5313 | 1253 | 24% | 192 | 🔴 sparse |
| Harrow | — | — | error | — | ⚠️ Overpass returned 504 |
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

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

*Generated 2026-11-09 from live OSM data via Overpass.*

| City | Ways | Tagged `lit` | Coverage | Lamps | Verdict |
|---|---|---|---|---|---|
| City of London | — | — | error | — | ⚠️ Overpass returned 502 |
| Westminster | — | — | error | — | ⚠️ fetch failed |
| Camden | — | — | error | — | ⚠️ Overpass returned 504 |
| Islington | 6687 | 4020 | 60% | 416 | 🟡 partial |
| Hackney | 7713 | 5159 | 67% | 430 | 🟡 partial |
| Tower Hamlets | 9382 | 4795 | 51% | 370 | 🟡 partial |
| Southwark | 4648 | 923 | 20% | 1 | 🔴 sparse |
| Lambeth | — | — | error | — | ⚠️ fetch failed |
| Wandsworth | 4569 | 950 | 21% | 8 | 🔴 sparse |
| Hammersmith & Fulham | — | — | error | — | ⚠️ Overpass returned 504 |
| Kensington & Chelsea | — | — | error | — | ⚠️ Overpass returned 502 |
| Brent | — | — | error | — | ⚠️ Overpass returned 504 |
| Ealing | — | — | error | — | ⚠️ Overpass returned 504 |
| Hounslow | — | — | error | — | ⚠️ Overpass returned 504 |
| Richmond upon Thames | — | — | error | — | ⚠️ fetch failed |
| Kingston upon Thames | — | — | error | — | ⚠️ fetch failed |
| Merton | 4267 | 1463 | 34% | 52 | 🔴 sparse |
| Sutton | — | — | error | — | ⚠️ Overpass returned 504 |
| Croydon | 3621 | 998 | 28% | 74 | 🔴 sparse |
| Bromley | — | — | error | — | ⚠️ Overpass returned 504 |
| Lewisham | — | — | error | — | ⚠️ fetch failed |
| Greenwich | 7108 | 2513 | 35% | 476 | 🔴 sparse |
| Bexley | 3135 | 404 | 13% | 83 | 🔴 sparse |
| Newham | 4990 | 2357 | 47% | 86 | 🟡 partial |
| Waltham Forest | 4582 | 1253 | 27% | 65 | 🔴 sparse |
| Redbridge | — | — | error | — | ⚠️ Overpass returned 504 |
| Barking & Dagenham | 2317 | 883 | 38% | 5 | 🔴 sparse |
| Havering | — | — | error | — | ⚠️ Overpass returned 504 |
| Enfield | — | — | error | — | ⚠️ fetch failed |
| Barnet | 890 | 145 | 16% | 0 | 🔴 sparse |
| Haringey | — | — | error | — | ⚠️ Overpass returned 504 |
| Harrow | — | — | error | — | ⚠️ fetch failed |
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

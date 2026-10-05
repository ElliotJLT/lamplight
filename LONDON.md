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

*Generated 2026-10-05 from live OSM data via Overpass.*

| City | Ways | Tagged `lit` | Coverage | Lamps | Verdict |
|---|---|---|---|---|---|
| City of London | 20667 | 8490 | 41% | 425 | 🟡 partial |
| Westminster | 10146 | 4958 | 49% | 362 | 🟡 partial |
| Camden | — | — | error | — | ⚠️ Overpass returned 504 |
| Islington | 6687 | 3945 | 59% | 416 | 🟡 partial |
| Hackney | 7704 | 5265 | 68% | 306 | 🟡 partial |
| Tower Hamlets | 9511 | 4391 | 46% | 370 | 🟡 partial |
| Southwark | — | — | error | — | ⚠️ Overpass returned 502 |
| Lambeth | — | — | error | — | ⚠️ Overpass returned 502 |
| Wandsworth | — | — | error | — | ⚠️ fetch failed |
| Hammersmith & Fulham | — | — | error | — | ⚠️ Overpass returned 504 |
| Kensington & Chelsea | — | — | error | — | ⚠️ Overpass returned 504 |
| Brent | — | — | error | — | ⚠️ fetch failed |
| Ealing | — | — | error | — | ⚠️ fetch failed |
| Hounslow | 2524 | 582 | 23% | 40 | 🔴 sparse |
| Richmond upon Thames | — | — | error | — | ⚠️ Overpass returned 504 |
| Kingston upon Thames | — | — | error | — | ⚠️ fetch failed |
| Merton | — | — | error | — | ⚠️ Overpass returned 504 |
| Sutton | 2632 | 340 | 13% | 1 | 🔴 sparse |
| Croydon | — | — | error | — | ⚠️ Overpass returned 504 |
| Bromley | 2139 | 550 | 26% | 5 | 🔴 sparse |
| Lewisham | 3001 | 920 | 31% | 100 | 🔴 sparse |
| Greenwich | 7097 | 2513 | 35% | 440 | 🔴 sparse |
| Bexley | 3239 | 404 | 12% | 83 | 🔴 sparse |
| Newham | 4966 | 2235 | 45% | 86 | 🟡 partial |
| Waltham Forest | 4556 | 1228 | 27% | 65 | 🔴 sparse |
| Redbridge | 2670 | 702 | 26% | 193 | 🔴 sparse |
| Barking & Dagenham | — | — | error | — | ⚠️ fetch failed |
| Havering | 2473 | 699 | 28% | 6 | 🔴 sparse |
| Enfield | 2737 | 1105 | 40% | 123 | 🟡 partial |
| Barnet | — | — | error | — | ⚠️ Overpass returned 502 |
| Haringey | — | — | error | — | ⚠️ fetch failed |
| Harrow | 2527 | 1348 | 53% | 30 | 🟡 partial |
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

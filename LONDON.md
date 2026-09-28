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

*Generated 2026-09-28 from live OSM data via Overpass.*

| City | Ways | Tagged `lit` | Coverage | Lamps | Verdict |
|---|---|---|---|---|---|
| City of London | 21202 | 7402 | 35% | 419 | 🔴 sparse |
| Westminster | 10314 | 4440 | 43% | 360 | 🟡 partial |
| Camden | — | — | error | — | ⚠️ Overpass returned 504 |
| Islington | 6661 | 3824 | 57% | 416 | 🟡 partial |
| Hackney | — | — | error | — | ⚠️ Overpass returned 504 |
| Tower Hamlets | — | — | error | — | ⚠️ Overpass returned 504 |
| Southwark | — | — | error | — | ⚠️ Overpass returned 504 |
| Lambeth | 5481 | 1154 | 21% | 7 | 🔴 sparse |
| Wandsworth | — | — | error | — | ⚠️ fetch failed |
| Hammersmith & Fulham | 6160 | 2364 | 38% | 6 | 🔴 sparse |
| Kensington & Chelsea | 5823 | 2517 | 43% | 14 | 🟡 partial |
| Brent | 2725 | 757 | 28% | 168 | 🔴 sparse |
| Ealing | 2974 | 781 | 26% | 83 | 🔴 sparse |
| Hounslow | 2502 | 551 | 22% | 40 | 🔴 sparse |
| Richmond upon Thames | — | — | error | — | ⚠️ Overpass returned 504 |
| Kingston upon Thames | — | — | error | — | ⚠️ Overpass returned 504 |
| Merton | 4253 | 1420 | 33% | 52 | 🔴 sparse |
| Sutton | 2632 | 327 | 12% | 1 | 🔴 sparse |
| Croydon | 3615 | 998 | 28% | 74 | 🔴 sparse |
| Bromley | — | — | error | — | ⚠️ Overpass returned 504 |
| Lewisham | — | — | error | — | ⚠️ fetch failed |
| Greenwich | — | — | error | — | ⚠️ Overpass returned 504 |
| Bexley | 3110 | 404 | 13% | 83 | 🔴 sparse |
| Newham | 4959 | 2325 | 47% | 86 | 🟡 partial |
| Waltham Forest | 4535 | 1197 | 26% | 65 | 🔴 sparse |
| Redbridge | 2670 | 975 | 37% | 193 | 🔴 sparse |
| Barking & Dagenham | — | — | error | — | ⚠️ fetch failed |
| Havering | — | — | error | — | ⚠️ Overpass returned 504 |
| Enfield | — | — | error | — | ⚠️ Overpass returned 504 |
| Barnet | 892 | 145 | 16% | 0 | 🔴 sparse |
| Haringey | 5294 | 1231 | 23% | 192 | 🔴 sparse |
| Harrow | 2525 | 1350 | 53% | 30 | 🟡 partial |
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

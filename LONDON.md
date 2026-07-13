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

*Generated 2026-07-13 from live OSM data via Overpass.*

| City | Ways | Tagged `lit` | Coverage | Lamps | Verdict |
|---|---|---|---|---|---|
| City of London | 21176 | 7397 | 35% | 421 | 🔴 sparse |
| Westminster | 12421 | 4421 | 36% | 360 | 🔴 sparse |
| Camden | 5887 | 1973 | 34% | 90 | 🔴 sparse |
| Islington | — | — | error | — | ⚠️ fetch failed |
| Hackney | 7497 | 4844 | 65% | 306 | 🟡 partial |
| Tower Hamlets | — | — | error | — | ⚠️ Overpass returned 504 |
| Southwark | 4646 | 861 | 19% | 1 | 🔴 sparse |
| Lambeth | 5371 | 1015 | 19% | 7 | 🔴 sparse |
| Wandsworth | 4481 | 906 | 20% | 8 | 🔴 sparse |
| Hammersmith & Fulham | 5836 | 2367 | 41% | 3 | 🟡 partial |
| Kensington & Chelsea | 5802 | 2518 | 43% | 14 | 🟡 partial |
| Brent | — | — | error | — | ⚠️ Overpass returned 504 |
| Ealing | 2938 | 810 | 28% | 83 | 🔴 sparse |
| Hounslow | — | — | error | — | ⚠️ Overpass returned 504 |
| Richmond upon Thames | — | — | error | — | ⚠️ fetch failed |
| Kingston upon Thames | 3686 | 971 | 26% | 8 | 🔴 sparse |
| Merton | 4247 | 1438 | 34% | 52 | 🔴 sparse |
| Sutton | 2641 | 330 | 12% | 1 | 🔴 sparse |
| Croydon | 3612 | 1013 | 28% | 74 | 🔴 sparse |
| Bromley | 2137 | 547 | 26% | 5 | 🔴 sparse |
| Lewisham | — | — | error | — | ⚠️ Overpass returned 504 |
| Greenwich | 6850 | 2487 | 36% | 440 | 🔴 sparse |
| Bexley | 3119 | 399 | 13% | 83 | 🔴 sparse |
| Newham | 5041 | 2234 | 44% | 86 | 🟡 partial |
| Waltham Forest | — | — | error | — | ⚠️ fetch failed |
| Redbridge | 2725 | 702 | 26% | 193 | 🔴 sparse |
| Barking & Dagenham | — | — | error | — | ⚠️ fetch failed |
| Havering | — | — | error | — | ⚠️ fetch failed |
| Enfield | 2737 | 1105 | 40% | 123 | 🟡 partial |
| Barnet | 892 | 145 | 16% | 0 | 🔴 sparse |
| Haringey | 5295 | 1228 | 23% | 192 | 🔴 sparse |
| Harrow | 2383 | 1343 | 56% | 30 | 🟡 partial |
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

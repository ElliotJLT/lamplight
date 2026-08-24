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

*Generated 2026-08-24 from live OSM data via Overpass.*

| City | Ways | Tagged `lit` | Coverage | Lamps | Verdict |
|---|---|---|---|---|---|
| City of London | 21223 | 7425 | 35% | 425 | 🔴 sparse |
| Westminster | — | — | error | — | ⚠️ Overpass returned 500 |
| Camden | — | — | error | — | ⚠️ Overpass returned 500 |
| Islington | 6840 | 3883 | 57% | 260 | 🟡 partial |
| Hackney | — | — | error | — | ⚠️ Overpass returned 500 |
| Tower Hamlets | — | — | error | — | ⚠️ Overpass returned 500 |
| Southwark | — | — | error | — | ⚠️ Overpass returned 502 |
| Lambeth | 5444 | 1144 | 21% | 7 | 🔴 sparse |
| Wandsworth | — | — | error | — | ⚠️ Overpass returned 502 |
| Hammersmith & Fulham | 5976 | 2369 | 40% | 3 | 🟡 partial |
| Kensington & Chelsea | — | — | error | — | ⚠️ Overpass returned 500 |
| Brent | 2709 | 730 | 27% | 168 | 🔴 sparse |
| Ealing | — | — | error | — | ⚠️ fetch failed |
| Hounslow | 2508 | 567 | 23% | 40 | 🔴 sparse |
| Richmond upon Thames | 1798 | 337 | 19% | 0 | 🔴 sparse |
| Kingston upon Thames | 3809 | 986 | 26% | 8 | 🔴 sparse |
| Merton | — | — | error | — | ⚠️ Overpass returned 502 |
| Sutton | 2738 | 339 | 12% | 1 | 🔴 sparse |
| Croydon | — | — | error | — | ⚠️ Overpass returned 500 |
| Bromley | 2143 | 547 | 26% | 5 | 🔴 sparse |
| Lewisham | 3003 | 921 | 31% | 100 | 🔴 sparse |
| Greenwich | 7034 | 2479 | 35% | 456 | 🔴 sparse |
| Bexley | — | — | error | — | ⚠️ terminated |
| Newham | — | — | error | — | ⚠️ Overpass returned 500 |
| Waltham Forest | — | — | error | — | ⚠️ Overpass returned 500 |
| Redbridge | 2657 | 971 | 37% | 193 | 🔴 sparse |
| Barking & Dagenham | — | — | error | — | ⚠️ Overpass returned 500 |
| Havering | — | — | error | — | ⚠️ Overpass returned 500 |
| Enfield | — | — | error | — | ⚠️ Overpass returned 500 |
| Barnet | — | — | error | — | ⚠️ Overpass returned 500 |
| Haringey | — | — | error | — | ⚠️ Overpass returned 502 |
| Harrow | — | — | error | — | ⚠️ Overpass returned 500 |
| Hillingdon | — | — | error | — | ⚠️ Overpass returned 500 |

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

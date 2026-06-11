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

*Generated 2026-06-11 from live OSM data via Overpass.*

| City | Ways | Tagged `lit` | Coverage | Lamps | Verdict |
|---|---|---|---|---|---|
| City of London | — | — | error | — | ⚠️ Overpass returned 406 |
| Westminster | — | — | error | — | ⚠️ Overpass returned 406 |
| Camden | — | — | error | — | ⚠️ Overpass returned 406 |
| Islington | — | — | error | — | ⚠️ Overpass returned 406 |
| Hackney | — | — | error | — | ⚠️ Overpass returned 406 |
| Tower Hamlets | — | — | error | — | ⚠️ Overpass returned 406 |
| Southwark | — | — | error | — | ⚠️ Overpass returned 406 |
| Lambeth | — | — | error | — | ⚠️ Overpass returned 406 |
| Wandsworth | — | — | error | — | ⚠️ Overpass returned 406 |
| Hammersmith & Fulham | — | — | error | — | ⚠️ Overpass returned 406 |
| Kensington & Chelsea | — | — | error | — | ⚠️ Overpass returned 406 |
| Brent | — | — | error | — | ⚠️ Overpass returned 406 |
| Ealing | — | — | error | — | ⚠️ Overpass returned 406 |
| Hounslow | — | — | error | — | ⚠️ Overpass returned 406 |
| Richmond upon Thames | — | — | error | — | ⚠️ Overpass returned 406 |
| Kingston upon Thames | — | — | error | — | ⚠️ Overpass returned 406 |
| Merton | — | — | error | — | ⚠️ Overpass returned 406 |
| Sutton | — | — | error | — | ⚠️ Overpass returned 406 |
| Croydon | — | — | error | — | ⚠️ Overpass returned 406 |
| Bromley | — | — | error | — | ⚠️ Overpass returned 406 |
| Lewisham | — | — | error | — | ⚠️ Overpass returned 406 |
| Greenwich | — | — | error | — | ⚠️ Overpass returned 406 |
| Bexley | — | — | error | — | ⚠️ Overpass returned 406 |
| Newham | — | — | error | — | ⚠️ Overpass returned 406 |
| Waltham Forest | — | — | error | — | ⚠️ Overpass returned 406 |
| Redbridge | — | — | error | — | ⚠️ Overpass returned 406 |
| Barking & Dagenham | — | — | error | — | ⚠️ Overpass returned 406 |
| Havering | — | — | error | — | ⚠️ Overpass returned 406 |
| Enfield | — | — | error | — | ⚠️ Overpass returned 406 |
| Barnet | — | — | error | — | ⚠️ Overpass returned 406 |
| Haringey | — | — | error | — | ⚠️ Overpass returned 406 |
| Harrow | — | — | error | — | ⚠️ Overpass returned 406 |
| Hillingdon | — | — | error | — | ⚠️ Overpass returned 406 |

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

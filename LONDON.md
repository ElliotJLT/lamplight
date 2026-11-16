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

*Generated 2026-11-16 from live OSM data via Overpass.*

| City | Ways | Tagged `lit` | Coverage | Lamps | Verdict |
|---|---|---|---|---|---|
| City of London | 16646 | 7363 | 44% | 425 | 🟡 partial |
| Westminster | — | — | error | — | ⚠️ fetch failed |
| Camden | 5940 | 2039 | 34% | 90 | 🔴 sparse |
| Islington | — | — | error | — | ⚠️ fetch failed |
| Hackney | — | — | error | — | ⚠️ fetch failed |
| Tower Hamlets | — | — | error | — | ⚠️ fetch failed |
| Southwark | — | — | error | — | ⚠️ fetch failed |
| Lambeth | — | — | error | — | ⚠️ Overpass returned 504 |
| Wandsworth | 4569 | 950 | 21% | 8 | 🔴 sparse |
| Hammersmith & Fulham | 6201 | 2601 | 42% | 3 | 🟡 partial |
| Kensington & Chelsea | — | — | error | — | ⚠️ fetch failed |
| Brent | — | — | error | — | ⚠️ fetch failed |
| Ealing | — | — | error | — | ⚠️ Overpass returned 502 |
| Hounslow | — | — | error | — | ⚠️ fetch failed |
| Richmond upon Thames | — | — | error | — | ⚠️ Overpass returned 502 |
| Kingston upon Thames | — | — | error | — | ⚠️ Overpass returned 502 |
| Merton | 4253 | 1463 | 34% | 52 | 🔴 sparse |
| Sutton | — | — | error | — | ⚠️ fetch failed |
| Croydon | — | — | error | — | ⚠️ fetch failed |
| Bromley | — | — | error | — | ⚠️ fetch failed |
| Lewisham | — | — | error | — | ⚠️ Overpass returned 504 |
| Greenwich | — | — | error | — | ⚠️ Overpass returned 502 |
| Bexley | 3250 | 399 | 12% | 83 | 🔴 sparse |
| Newham | — | — | error | — | ⚠️ Overpass returned 502 |
| Waltham Forest | — | — | error | — | ⚠️ fetch failed |
| Redbridge | 2670 | 975 | 37% | 193 | 🔴 sparse |
| Barking & Dagenham | 2317 | 883 | 38% | 5 | 🔴 sparse |
| Havering | — | — | error | — | ⚠️ fetch failed |
| Enfield | — | — | error | — | ⚠️ fetch failed |
| Barnet | 890 | 145 | 16% | 0 | 🔴 sparse |
| Haringey | — | — | error | — | ⚠️ fetch failed |
| Harrow | — | — | error | — | ⚠️ Overpass returned 502 |
| Hillingdon | — | — | error | — | ⚠️ fetch failed |

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

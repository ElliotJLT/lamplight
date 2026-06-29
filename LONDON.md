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

*Generated 2026-06-29 from live OSM data via Overpass.*

| City | Ways | Tagged `lit` | Coverage | Lamps | Verdict |
|---|---|---|---|---|---|
| City of London | 21150 | 7382 | 35% | 421 | 🔴 sparse |
| Westminster | 12417 | 4421 | 36% | 360 | 🔴 sparse |
| Camden | 5877 | 1970 | 34% | 90 | 🔴 sparse |
| Islington | 6687 | 3829 | 57% | 145 | 🟡 partial |
| Hackney | 7561 | 4788 | 63% | 306 | 🟡 partial |
| Tower Hamlets | 9555 | 4453 | 47% | 369 | 🟡 partial |
| Southwark | 4609 | 861 | 19% | 1 | 🔴 sparse |
| Lambeth | 5380 | 1015 | 19% | 7 | 🔴 sparse |
| Wandsworth | — | — | error | — | ⚠️ Overpass returned 504 |
| Hammersmith & Fulham | 5833 | 2365 | 41% | 3 | 🟡 partial |
| Kensington & Chelsea | 5798 | 2527 | 44% | 14 | 🟡 partial |
| Brent | 2649 | 637 | 24% | 168 | 🔴 sparse |
| Ealing | 2938 | 810 | 28% | 83 | 🔴 sparse |
| Hounslow | 2483 | 551 | 22% | 40 | 🔴 sparse |
| Richmond upon Thames | 1791 | 332 | 19% | 0 | 🔴 sparse |
| Kingston upon Thames | 3707 | 931 | 25% | 8 | 🔴 sparse |
| Merton | 4250 | 1432 | 34% | 52 | 🔴 sparse |
| Sutton | 2687 | 329 | 12% | 1 | 🔴 sparse |
| Croydon | 3604 | 1013 | 28% | 69 | 🔴 sparse |
| Bromley | 2137 | 547 | 26% | 5 | 🔴 sparse |
| Lewisham | 2941 | 920 | 31% | 64 | 🔴 sparse |
| Greenwich | 7002 | 2487 | 36% | 440 | 🔴 sparse |
| Bexley | 3115 | 399 | 13% | 83 | 🔴 sparse |
| Newham | 5046 | 2234 | 44% | 86 | 🟡 partial |
| Waltham Forest | 4469 | 1197 | 27% | 65 | 🔴 sparse |
| Redbridge | 2725 | 702 | 26% | 193 | 🔴 sparse |
| Barking & Dagenham | 2226 | 855 | 38% | 5 | 🔴 sparse |
| Havering | 2462 | 603 | 24% | 6 | 🔴 sparse |
| Enfield | 2737 | 1105 | 40% | 123 | 🟡 partial |
| Barnet | — | — | error | — | ⚠️ Overpass returned 504 |
| Haringey | 5225 | 1228 | 24% | 192 | 🔴 sparse |
| Harrow | 2379 | 1343 | 56% | 30 | 🟡 partial |
| Hillingdon | 1743 | 263 | 15% | 0 | 🔴 sparse |

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

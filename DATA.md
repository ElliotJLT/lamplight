# Lamplight data pipeline

## The moat question, answered honestly

Nothing stops anyone from copying the map or the scorer — they're MIT, and
the rendering idea is obvious once seen. The defensible asset is the
**data work nobody wants to do**:

1. **Ingestion** — hundreds of councils publish lamp records in
   incompatible formats (CSV with eastings/northings, GeoJSON, ArcGIS
   endpoints, broken portals). `scripts/ingest.mjs` normalizes them into
   one canonical, licence-tracked dataset, with Claude
   (`claude-sonnet-4-6`) handling the schema archaeology that makes this
   tedious for humans.
2. **Conflation** — `scripts/conflate.mjs` matches lamp records against
   OSM ways that have no `lit` tag and emits evidence-backed tagging
   proposals. This is the flywheel: each council ingested improves the
   *shared* map every OSM-based app reads.
3. **Freshness + trust** — being the maintained, attributed, licence-clean
   source of the lighting layer is a position (like being the maintainer
   of a critical OSM layer), not a file someone can copy once.

A running app could replicate all of this. The bet is that none of them
wants to own UK council data wrangling — they want to consume a layer.
Speed and OSM-community credibility are the real defence.

## Pipeline

```bash
# probe registry URLs (data/sources.json)
node scripts/ingest.mjs --check

# ingest everything in the registry
node scripts/ingest.mjs

# ingest one source, or a manually downloaded file
node scripts/ingest.mjs --source bristol
node scripts/ingest.mjs --file ~/Downloads/lamps.csv --id leeds \
  --name "Leeds City Council" --licence OGL-UK-3.0 --attribution "Leeds City Council"

# propose lit=yes tags for OSM ways covered by ingested lamps
node scripts/conflate.mjs --lamps data/lamps/bristol.csv.gz \
  --bbox 51.44,-2.63,51.47,-2.57 --out bristol-proposals.geojson
```

**Coordinate handling:** WGS84 lat/lon pass through; British National Grid
eastings/northings are converted locally (inverse transverse Mercator on
Airy 1830 + Helmert shift, ~5m accuracy — verified against the OS worked
example). Column detection is heuristic first; when a council's schema is
too strange, the script sends the header + 5 sample rows to
`claude-sonnet-4-6` (requires `ANTHROPIC_API_KEY`) and asks only for
column names and CRS — coordinates always come from the source data, and
the model's answer is range-checked before use.

**Output schema:** one `data/lamps/<source>.csv.gz` per source
(`lat,lon`, 6dp, deduped at ~1m), plus `data/lamps/index.json` recording
count, licence, attribution, source URL and fetch date for each.

## Licensing rules

- **Ingest only open data**: OGL-UK-3.0, CC-BY, ODbL-compatible. Record
  the licence and attribution in the registry — `index.json` is the
  attribution manifest.
- **Never ingest** PSGA / OS NGD / premium datasets. The GB national
  street-lights layer is public-sector licensed; that's a partnership
  conversation, not a download.
- **OSM contributions follow the
  [Import Guidelines](https://wiki.openstreetmap.org/wiki/Import/Guidelines)**:
  conflate.mjs outputs are *proposals* for human review (JOSM /
  MapRoulette), never mechanical edits. OGL data can be added to OSM with
  attribution; document each source on the wiki before importing.

## Can the data live in the repo?

Yes, comfortably, for now. A council is typically 10–60k lamps → roughly
0.2–1 MB gzipped each; twenty councils is ~10–20 MB. GitHub is fine up to
~50 MB of data files. The full-GB endgame (~7M lamps, plus derived tiles)
is ~100 MB+ — at that point the per-source files move to GitHub Releases
(or the tile pipeline) and the repo keeps only `index.json` and the
scripts. Don't commit anything you can't attribute and licence in
`index.json`.

`data/fixtures/` contains synthetic test data only — never render it as
real lamps.

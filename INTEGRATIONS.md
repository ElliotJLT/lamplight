# Integrating Lamplight

This doc is for engineers at routing/fitness products evaluating the
lighting layer. Three integration surfaces, in increasing order of depth.

## 1. Route scoring — available today

Everything needed to score a route against street lighting ships in this
repo as two dependency-free TypeScript modules:

- [`lib/overpass.ts`](./lib/overpass.ts) — fetches and classifies OSM lighting data for a bbox
- [`lib/route-score.ts`](./lib/route-score.ts) — matches a polyline to the lit-way network and scores it

```ts
import { fetchLighting } from "./lib/overpass"
import { routeBbox, scoreRoute } from "./lib/route-score"

const points: [number, number][] = [...]   // your route polyline, [lat, lon]
const { ways } = await fetchLighting(routeBbox(points))
const result = scoreRoute(points, ways)

result.score        // 0-100: lit share of the route distance that has data
result.confidence   // 0-1: share of route distance that has lighting data at all
result.litKm        // plus unlitKm / unknownKm / offNetworkKm
result.legs         // the route split into lit/unlit/unknown segments for rendering
```

Semantics you can rely on:

- **`score` is never inflated by missing data.** It is computed only over
  the tagged portion of the route. A route with no data returns
  `score: null`, not 100.
- **`confidence` is the trust signal.** Show the score prominently when
  confidence is high; show "not enough lighting data here yet" when it
  isn't. Both numbers together prevent the failure mode that kills safety
  features: confidently wrong answers.
- Matching is nearest-mapped-way within 35m at ~20m sampling; distance not
  near any mapped path is reported as `offNetworkKm`.

For production use you'd swap the live Overpass call for your own OSM
extract (you almost certainly already run one for routing) — the scorer
only needs ways with `highway` + `lit` tags.

## 2. Routing weight — "prefer lit streets"

If you run Valhalla, OSRM or GraphHopper, you already ingest the `lit`
tag's source data. Exposing it as a costing option is a profile change,
not an infrastructure change:

- treat `lit=yes|automatic|24/7|sunset-sunrise|…` as lit,
  `lit=no|disused` as unlit, absent as unknown
- apply a user-controlled penalty multiplier to unlit edges and a smaller
  one to unknown edges (never reward unknown — see semantics above)
- expose as a toggle: "Prefer lit streets (after dark)" — ideally
  auto-suggested when local time is after sunset

Planned from Lamplight: published reference profiles for all three
engines, plus a maintained classification table for `lit` values.

## 3. Tile layer — instant "night mode" map

Planned: pre-rendered vector tiles (`lighting` layer, lit class per
feature, zoom 12–16) regenerated from OSM weekly, so consumer apps don't
hammer Overpass. Until then, this repo demonstrates the rendering
approach: amber/rose/dashed-grey on a dark basemap, lamps as points at
high zoom.

## Data licensing

All lighting data derives from OpenStreetMap (© OpenStreetMap
contributors, [ODbL](https://www.openstreetmap.org/copyright)). Scores and
weights computed from it are derivative — attribute OSM in any surface
that shows them, and review ODbL share-alike obligations if you mix the
layer into a proprietary database. Lamplight's own code is MIT.

The data flywheel: Lamplight's import pipeline (roadmap) pushes council
and Ordnance Survey lamp datasets *into* OSM rather than into a private
database — so every integrator's existing OSM-based stack improves with
zero migration.

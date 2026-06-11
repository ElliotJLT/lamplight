# 💡 Lamplight

**An open street-lighting map for running after dark.**

Lamplight shows which streets and paths are lit at night, so runners (and walkers, and cyclists) can plan routes they feel safe on in winter. It's built entirely on open data — OpenStreetMap's `lit` tags and `highway=street_lamp` nodes — and is designed to become an embeddable layer that any running app can adopt.

**Status: working prototype.** Pan the map anywhere in the world and it pulls live lighting data for the area in view — then upload a GPX (or draw a route) to get a 0–100 after-dark score for it.

## Why

Every running app can route you 5k from your front door. None of them can tell you whether you'll be running it in the dark. From October to March in northern latitudes, most runs by working people happen before sunrise or after sunset — and "is this route lit?" is the single biggest factor in whether people (especially women) run at all.

The data to answer that question already exists. It's just fragmented and unused:

- OpenStreetMap has a [`lit=yes/no` tag](https://wiki.openstreetmap.org/wiki/Key:lit) on ways and [individual street lamps](https://wiki.openstreetmap.org/wiki/Tag:highway=street_lamp) — patchy, but good in many cities
- Ordnance Survey has captured [6.5 million street lights across Great Britain](https://www.ordnancesurvey.co.uk/news/new-national-street-lights-data-from-ordnance-survey)
- Dozens of councils publish lamp-column locations as open data
- Google has been [testing a lighting layer](https://www.techradar.com/news/google-maps-may-start-guiding-you-towards-well-lit-routes-instead-of-dark-alleys) for years without shipping it

Lamplight's goal: make street lighting a first-class, open map layer — and make it trivial for any routing product to use it. See [PITCH.md](./PITCH.md) for the partner pitch.

## How it works

- **Map**: Leaflet with CARTO dark basemap (the app assumes you're planning a night run)
- **Data**: live [Overpass API](https://wiki.openstreetmap.org/wiki/Overpass_API) queries for the current viewport — runnable ways classified as **lit** (amber), **unlit** (rose), or **no data** (dashed grey), plus individual lamp nodes at high zoom
- **Route scoring**: upload a GPX or trace a route on the map; `lib/route-score.ts` snap-matches it to the lit-way network (~20m sampling, 35m tolerance) and returns a 0–100 after-dark score, a data-confidence figure, and the route split into lit/unlit/unknown legs for rendering. This is the embeddable capability — see [INTEGRATIONS.md](./INTEGRATIONS.md)
- **Coverage honesty**: the stats panel shows what share of paths in view actually carry lighting data, and the route score is computed only over tagged distance — missing data lowers confidence, never inflates the score. `scripts/coverage.mjs` benchmarks `lit` coverage across 21 running cities

No accounts, no backend, no API keys. The whole thing is a static Next.js app talking to public OSM infrastructure.

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Search for your town or hit the locate button.

## Roadmap

1. ~~**Lamplight score**~~ — ✅ shipped: 0–100 after-dark score per route, GPX upload + draw-on-map, embeddable scorer in `lib/route-score.ts`
2. **Prove coverage** — run `scripts/coverage.mjs` and publish the city benchmark table
3. **Import pipeline** — convert council / OS open data lamp datasets into OSM-ready `lit` tagging proposals (the highest-leverage contribution: improving the shared map, not forking it)
4. **Pre-rendered vector tiles** — a `lighting` tile layer any app can add in one line, instead of hammering Overpass
5. **Routing cost profiles** — published "prefer lit streets" profiles for Valhalla/OSRM/GraphHopper

## Tech

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Leaflet · Overpass API · Nominatim

## License

MIT. Map data © OpenStreetMap contributors ([ODbL](https://www.openstreetmap.org/copyright)). Basemap © CARTO.

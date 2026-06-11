import Link from "next/link"
import {
  Lightbulb,
  MapPin,
  Route,
  Blocks,
  Github,
  ArrowRight,
} from "lucide-react"
import { MapApp } from "@/components/map/map-app"

const REPO_URL = "https://github.com/ElliotJLT/plod"

export default function Landing() {
  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-200">
      {/* Hero */}
      <section className="mx-auto max-w-3xl px-5 pb-10 pt-16 text-center sm:pt-24">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-400">
          <Lightbulb className="h-3.5 w-3.5 text-amber-300" />
          Lamplight — open source, no accounts, no tracking
        </p>
        <h1 className="text-balance text-4xl font-bold tracking-tight text-zinc-50 sm:text-5xl">
          See which streets are lit
          <br />
          <span className="text-amber-300">before you run in the dark.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-pretty text-zinc-400">
          For half the year, most runs happen before sunrise or after sunset —
          and route choice becomes a lighting question. Lamplight maps street
          lighting from open data so you can plan a night run you feel safe on.
        </p>
        <div className="mt-7 flex items-center justify-center gap-3">
          <Link
            href="/map"
            className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-300"
          >
            Open the map <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href={REPO_URL}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-600 hover:text-zinc-100"
          >
            <Github className="h-4 w-4" /> GitHub
          </a>
        </div>
      </section>

      {/* Live map */}
      <section className="mx-auto max-w-5xl px-5">
        <div className="overflow-hidden rounded-2xl border border-zinc-800 shadow-2xl">
          <MapApp className="h-[70vh] min-h-[420px]" />
        </div>
        <p className="mt-3 text-center text-xs text-zinc-500">
          Live data — pan anywhere in the world.{" "}
          <span className="text-amber-300">Amber = lit</span>,{" "}
          <span className="text-rose-400">rose = unlit</span>, dashed grey =
          no data yet. Upload a GPX or draw a route to score it.
        </p>
      </section>

      {/* Rationale */}
      <section className="mx-auto grid max-w-5xl gap-4 px-5 py-14 sm:grid-cols-3">
        <Card
          icon={<MapPin className="h-5 w-5 text-amber-300" />}
          title="The data already existed"
        >
          OpenStreetMap volunteers have tagged the lighting of millions of
          streets and the position of individual lamp posts. It just sat
          unused by the apps runners actually plan with. Lamplight renders it
          plainly — and where there is no data, it says so, rather than
          guessing.
        </Card>
        <Card
          icon={<Route className="h-5 w-5 text-amber-300" />}
          title="Score any route"
        >
          Upload a GPX of your usual loop, or trace one on the map, and get a
          0–100 after-dark score: how much of it is lit, how much isn&apos;t,
          and how much is simply unknown. The score is computed only over
          distance that has data — missing data lowers confidence, never
          inflates the number.
        </Card>
        <Card
          icon={<Blocks className="h-5 w-5 text-amber-300" />}
          title="Built to be embedded"
        >
          Lamplight isn&apos;t trying to be another running app. The scorer is
          a small, dependency-free open-source module, and the roadmap is
          tiles and routing weights any route-planning product can adopt — so
          &quot;prefer lit streets&quot; can become a normal toggle, wherever
          you already plan your runs.
        </Card>
      </section>

      {/* Data Q&A */}
      <section className="border-t border-zinc-900 bg-zinc-900/30">
        <div className="mx-auto max-w-3xl px-5 py-14">
          <h2 className="text-xl font-semibold text-zinc-100">
            Where does the data come from?
          </h2>
          <div className="mt-5 space-y-5 text-sm leading-relaxed text-zinc-400">
            <p>
              Everything you see is OpenStreetMap: ways tagged with{" "}
              <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-xs text-amber-200">
                lit=yes/no
              </code>{" "}
              and individual{" "}
              <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-xs text-amber-200">
                street_lamp
              </code>{" "}
              nodes, fetched live for the area in view. That makes the map
              worldwide from day one — not UK-only — but coverage varies city
              by city, because it depends on what mappers have surveyed.
            </p>
            <p>
              Where coverage is thin, the fix is not a private database.
              Many councils and national mapping agencies hold lamp-by-lamp
              records; the roadmap is an import pipeline that converts those
              open datasets into OpenStreetMap tagging, so every map and app
              built on OSM gets better at once. The repo includes a benchmark
              script that measures lighting coverage across 21 running cities
              — honesty about the gaps is the point.
            </p>
            <p className="text-zinc-500">
              A street shown in dashed grey means &quot;no data yet&quot;,
              never &quot;probably fine&quot;. If you map your own streets,
              you fix it for everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-5 py-8 text-center text-xs text-zinc-600">
          <p>
            Open source under MIT.{" "}
            <a href={REPO_URL} className="text-zinc-400 hover:text-zinc-200">
              Contribute on GitHub
            </a>
            {" · "}
            <Link href="/map" className="text-zinc-400 hover:text-zinc-200">
              Open the map
            </Link>
          </p>
          <p>
            Map data ©{" "}
            <a
              href="https://www.openstreetmap.org/copyright"
              className="hover:text-zinc-400"
            >
              OpenStreetMap
            </a>{" "}
            contributors (ODbL) · Basemap ©{" "}
            <a
              href="https://carto.com/attributions"
              className="hover:text-zinc-400"
            >
              CARTO
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}

function Card({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5">
      <div className="mb-3 flex items-center gap-2.5">
        {icon}
        <h3 className="font-semibold text-zinc-100">{title}</h3>
      </div>
      <p className="text-sm leading-relaxed text-zinc-400">{children}</p>
    </div>
  )
}

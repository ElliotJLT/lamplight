import Link from "next/link"
import { Github, ArrowRight, Mail } from "lucide-react"
import { MapApp } from "@/components/map/map-app"

const REPO_URL = "https://github.com/ElliotJLT/lamplight"
const CONTACT = "mailto:elliotjlittle@gmail.com?subject=Lamplight"

export default function Landing() {
  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-200">
      {/* Hero */}
      <section className="mx-auto max-w-3xl px-5 pb-10 pt-16 text-center sm:pt-24">
        <h1 className="text-balance text-4xl font-bold tracking-tight text-zinc-50 sm:text-5xl">
          Runners choose routes in the dark.
          <br />
          <span className="text-amber-300">The lighting data barely exists.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-pretty text-zinc-400">
          Lamplight maps street lighting from open data and scores any route
          for running after dark — honest about what&apos;s lit, what
          isn&apos;t, and what&apos;s simply unknown.
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
          Live worldwide. <span className="text-amber-300">Amber lit</span> ·{" "}
          <span className="text-rose-400">rose unlit</span> · dashed grey
          unknown. Upload a GPX or draw a route to score it.
        </p>
      </section>

      {/* Why — three short points */}
      <section className="mx-auto grid max-w-5xl gap-4 px-5 py-14 sm:grid-cols-3">
        <Card title="Safety is a data problem">
          From October to March most runs happen in the dark, and &quot;is it
          lit?&quot; decides whether many people — especially women — run at
          all. No mainstream app can answer it.
        </Card>
        <Card title="Honest by design">
          Most streets carry no lighting data anywhere. Lamplight never
          guesses: unknown is shown as unknown, and missing data lowers a
          route&apos;s confidence — it never inflates its score.
        </Card>
        <Card title="Built to embed">
          Open source, open data. The route scorer is a small dependency-free
          module, with tiles and &quot;prefer lit streets&quot; routing
          weights on the roadmap.
        </Card>
      </section>

      {/* Partner CTA */}
      <section className="border-t border-zinc-900 bg-zinc-900/30">
        <div className="mx-auto max-w-3xl px-5 py-14 text-center">
          <h2 className="text-xl font-semibold text-zinc-100">
            Building a running, walking or cycling app?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-zinc-400">
            Your users already make after-dark safety decisions with no data.
            A &quot;run in the light&quot; toggle is one sprint with this
            layer — and winter is your churn season.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <a
              href={CONTACT}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-300"
            >
              <Mail className="h-4 w-4" /> Talk to us
            </a>
            <a
              href={`${REPO_URL}/blob/main/INTEGRATIONS.md`}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-600 hover:text-zinc-100"
            >
              Integration docs
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-5 py-8 text-center text-xs text-zinc-600">
          <p>
            Data: OpenStreetMap <code className="text-zinc-500">lit</code>{" "}
            tags + council open data, worldwide, coverage varies —{" "}
            <a
              href={`${REPO_URL}/blob/main/DATA.md`}
              className="text-zinc-400 hover:text-zinc-200"
            >
              how it works
            </a>
          </p>
          <p>
            MIT ·{" "}
            <a href={REPO_URL} className="text-zinc-400 hover:text-zinc-200">
              GitHub
            </a>{" "}
            · Map data ©{" "}
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
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5">
      <h3 className="mb-2 font-semibold text-amber-200">{title}</h3>
      <p className="text-sm leading-relaxed text-zinc-400">{children}</p>
    </div>
  )
}

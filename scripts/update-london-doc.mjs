#!/usr/bin/env node
// Splices a generated markdown table into LONDON.md between the
// <!-- coverage:start --> / <!-- coverage:end --> markers.
// Usage: node scripts/update-london-doc.mjs <table-file.md>

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..")
const DOC = path.join(ROOT, "LONDON.md")

const tableFile = process.argv[2]
if (!tableFile) {
  console.error("usage: node scripts/update-london-doc.mjs <table-file.md>")
  process.exit(1)
}
const table = fs.readFileSync(tableFile, "utf8").trim()
if (!table.includes("|")) {
  console.error("table file contains no markdown table; refusing to splice")
  process.exit(1)
}

const doc = fs.readFileSync(DOC, "utf8")
const START = "<!-- coverage:start -->"
const END = "<!-- coverage:end -->"
const startI = doc.indexOf(START)
const endI = doc.indexOf(END)
if (startI < 0 || endI < 0) {
  console.error("markers not found in LONDON.md")
  process.exit(1)
}

const stamp = new Date().toISOString().slice(0, 10)
const updated =
  doc.slice(0, startI + START.length) +
  `\n\n*Generated ${stamp} from live OSM data via Overpass.*\n\n${table}\n\n` +
  doc.slice(endI)

fs.writeFileSync(DOC, updated)
console.log(`LONDON.md updated (${stamp})`)

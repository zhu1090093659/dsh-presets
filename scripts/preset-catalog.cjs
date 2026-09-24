#!/usr/bin/env node
/**
 * Validate the community preset catalog: the publishing source for the
 * Presets category of the dsh-market.com Workshop store. `presets/<id>/` is
 * the asset — `preset.yml` carries the display text, `agent.cordis.yml` the
 * composition the host registers — and `presets/catalog.json` is the market
 * metadata (author, version, tags, English copy, rank).
 *
 * The same invariants are enforced by the dsh-web market build when it reads
 * the pinned submodule; running them here as well is what lets a contributor
 * catch a broken submission before the pin moves.
 *
 * Usage:
 *   node scripts/preset-catalog            # validate
 *   node scripts/preset-catalog --check    # same; exits 1 on failure (CI)
 */
'use strict'

const fs = require('node:fs')
const path = require('node:path')

const ROOT = path.resolve(__dirname, '..')
const PRESETS_DIR = path.join(ROOT, 'presets')
const CATALOG_FILE = path.join(PRESETS_DIR, 'catalog.json')

/** Preset ids the harness ships; a community preset may never claim one. */
const RESERVED_IDS = ['minimal', 'ptc', 'standard', 'cordis']
/** Official preset directory rule (mirrors the registry's own preset id rule). */
const ID_RE = /^[a-z0-9][a-z0-9-]*$/
/** Stable category ids rendered as filter pills on the market surfaces. */
const CATEGORIES = ['roleplay']
/** Every catalog entry must credit an author and a version (the Workshop
 * update reminder compares the installed version against this one). */
const REQUIRED = ['id', 'author', 'version']
/** Directories that are never catalog entries. */
const NON_ENTRY_DIRS = new Set(['_template'])

/**
 * Read the display scalars of a preset.yml. This is deliberately a shallow
 * scalar reader, not a YAML parser: a published preset keeps its display text
 * on single-line scalars, which is exactly what this checks.
 */
function parsePresetYml(text) {
  const out = {}
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/\s+#.*$/, '')
    const m = /^(name|description|order):\s*(.+?)\s*$/.exec(line)
    if (!m) continue
    let value = m[2]
    if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
      value = value.slice(1, -1)
    }
    if (m[1] === 'order') {
      const n = Number(value)
      if (Number.isFinite(n)) out.order = n
      continue
    }
    out[m[1]] = value
  }
  return out
}

/**
 * Validate the parsed catalog against the preset directories on disk.
 * @param raw - the parsed presets/catalog.json value.
 * @param presetsDir - the directory holding `<id>/` and `_template/`.
 * @throws when the catalog or a preset directory violates the publishing contract.
 */
function validateCatalog(raw, presetsDir) {
  if (!Array.isArray(raw)) throw new Error('preset catalog must be an array')
  const seen = new Set()
  const entries = []
  for (let i = 0; i < raw.length; i++) {
    const entry = raw[i]
    if (typeof entry !== 'object' || entry === null) throw new Error('preset #' + i + ': entry must be an object')
    for (const key of REQUIRED) {
      if (typeof entry[key] !== 'string' || entry[key].trim() === '') {
        throw new Error('preset #' + i + '(' + (entry.id || '?') + '): missing required string field ' + key)
      }
    }
    if (!ID_RE.test(entry.id)) throw new Error('preset #' + i + ': id must match ' + ID_RE + ': ' + entry.id)
    if (RESERVED_IDS.includes(entry.id)) {
      throw new Error('preset #' + i + ': id is reserved by a shipped preset: ' + entry.id)
    }
    if (seen.has(entry.id)) throw new Error('preset #' + i + ': duplicate id: ' + entry.id)
    seen.add(entry.id)

    const dir = path.join(presetsDir, entry.id)
    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
      throw new Error('preset #' + i + ': directory not found: presets/' + entry.id)
    }
    const composition = path.join(dir, 'agent.cordis.yml')
    if (!fs.existsSync(composition)) throw new Error('preset #' + i + ': agent.cordis.yml missing: presets/' + entry.id)
    if (fs.readFileSync(composition, 'utf8').trim() === '') {
      throw new Error('preset #' + i + ': agent.cordis.yml is empty: presets/' + entry.id)
    }
    const metadataFile = path.join(dir, 'preset.yml')
    if (!fs.existsSync(metadataFile)) throw new Error('preset #' + i + ': preset.yml missing: presets/' + entry.id)
    const metadata = parsePresetYml(fs.readFileSync(metadataFile, 'utf8').replace(/\r\n?/g, '\n'))
    if (!metadata.name) {
      throw new Error('preset #' + i + ': preset.yml needs a single-line name: presets/' + entry.id)
    }
    const category = typeof entry.category === 'string' && entry.category ? entry.category : 'other'
    if (category !== 'other' && !CATEGORIES.includes(category)) {
      throw new Error('preset #' + i + ': category must be one of ' + CATEGORIES.join(' / ') + ' or omitted: ' + entry.id)
    }
    if (entry.category !== undefined && typeof entry.category !== 'string') {
      throw new Error('preset #' + i + ': category must be a string: ' + entry.id)
    }
    if (entry.tags !== undefined && (!Array.isArray(entry.tags) || entry.tags.some((tag) => typeof tag !== 'string'))) {
      throw new Error('preset #' + i + ': tags must be an array of strings: ' + entry.id)
    }
    if (entry.rank !== undefined && (typeof entry.rank !== 'number' || !Number.isFinite(entry.rank))) {
      throw new Error('preset #' + i + ': rank must be a number: ' + entry.id)
    }
    entries.push(entry.id)
  }

  // A preset directory that no catalog entry names would ship bytes the
  // market never lists; the reverse is caught above.
  for (const name of fs.readdirSync(presetsDir)) {
    if (NON_ENTRY_DIRS.has(name)) continue
    const full = path.join(presetsDir, name)
    if (!fs.statSync(full).isDirectory()) continue
    if (!seen.has(name)) throw new Error('preset directory without a catalog entry: presets/' + name)
  }

  return entries
}

function main() {
  const raw = JSON.parse(fs.readFileSync(CATALOG_FILE, 'utf8'))
  const entries = validateCatalog(raw, PRESETS_DIR)
  console.log('preset-catalog: OK (' + entries.length + ' presets)')
}

if (require.main === module) main()

module.exports = { validateCatalog, parsePresetYml, PRESETS_DIR }

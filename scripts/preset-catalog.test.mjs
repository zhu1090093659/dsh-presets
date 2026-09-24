/**
 * preset-catalog script contract: catalog validation rejects malformed
 * submissions and the CLI gate stays green against the committed catalog —
 * the publishing source the dsh-web market build reads.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateCatalog } from './preset-catalog.cjs'

/** Build a preset directory tree: one good preset plus the template. */
function fixture() {
  const dir = mkdtempSync(join(tmpdir(), 'preset-catalog-'))
  for (const [id, name] of [['_template', 'Template'], ['roleplay-a', 'A']]) {
    mkdirSync(join(dir, id), { recursive: true })
    writeFileSync(join(dir, id, 'preset.yml'), 'name: ' + name + '\ndescription: ' + name + '\n')
    writeFileSync(join(dir, id, 'agent.cordis.yml'), 'plugins: []\n')
  }
  return dir
}

const ENTRY = {
  id: 'roleplay-a',
  author: 'author-a',
  version: '1.0.0',
  nameEn: 'A',
  category: 'roleplay',
}

test('validateCatalog accepts a well-formed catalog', () => {
  const dir = fixture()
  try {
    assert.deepEqual(validateCatalog([ENTRY], dir), ['roleplay-a'])
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('validateCatalog requires the mandatory fields', () => {
  const dir = fixture()
  try {
    for (const key of ['id', 'author', 'version']) {
      const broken = [{ ...ENTRY }]
      delete broken[0][key]
      assert.throws(() => validateCatalog(broken, dir), new RegExp('missing required string field ' + key))
    }
    assert.throws(() => validateCatalog({}, dir), /must be an array/)
    assert.throws(() => validateCatalog([null], dir), /must be an object/)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('validateCatalog rejects a bad, reserved or duplicate id', () => {
  const dir = fixture()
  try {
    assert.throws(() => validateCatalog([{ ...ENTRY, id: 'Roleplay_A' }], dir), /id must match/)
    assert.throws(() => validateCatalog([{ ...ENTRY, id: 'standard' }], dir), /reserved by a shipped preset/)
    assert.throws(() => validateCatalog([ENTRY, { ...ENTRY }], dir), /duplicate id/)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('validateCatalog rejects a catalog entry without its directory', () => {
  const dir = fixture()
  try {
    assert.throws(() => validateCatalog([{ ...ENTRY, id: 'roleplay-b' }], dir), /directory not found/)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('validateCatalog rejects a preset directory the catalog does not name', () => {
  const dir = fixture()
  try {
    mkdirSync(join(dir, 'roleplay-orphan'))
    assert.throws(() => validateCatalog([ENTRY], dir), /preset directory without a catalog entry: presets\/roleplay-orphan/)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('validateCatalog rejects a missing composition file', () => {
  const dir = fixture()
  try {
    rmSync(join(dir, 'roleplay-a', 'agent.cordis.yml'))
    assert.throws(() => validateCatalog([ENTRY], dir), /agent.cordis.yml missing/)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('validateCatalog rejects a preset.yml the single-line reader cannot read', () => {
  const dir = fixture()
  try {
    writeFileSync(join(dir, 'roleplay-a', 'preset.yml'), 'name:\n  A\n')
    assert.throws(() => validateCatalog([ENTRY], dir), /needs a single-line name/)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('validateCatalog rejects an unknown category', () => {
  const dir = fixture()
  try {
    assert.throws(() => validateCatalog([{ ...ENTRY, category: 'unknown' }], dir), /category must be one of/)
    assert.throws(() => validateCatalog([{ ...ENTRY, tags: 'roleplay' }], dir), /tags must be an array/)
    assert.throws(() => validateCatalog([{ ...ENTRY, rank: 'first' }], dir), /rank must be a number/)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('CLI gate passes against the committed catalog', () => {
  const script = fileURLToPath(new URL('./preset-catalog.cjs', import.meta.url))
  const out = execFileSync(process.execPath, [script, '--check'], { encoding: 'utf8' })
  assert.match(out, /preset-catalog: OK/)
})

# Agent Note: The 2026-10-13 preset review round

Status: implemented

## Problem

Pull request #1 (`local-lite`, a minimum-prompt preset for short-context local
models, author `Xeraph627`, head `f87d607`) came back for a second round after
[the 2026-10-12 round](2026-10-12-preset-review-round.md) released its blocked CI
run and required one platform-neutral line of prompt copy. Two questions had to
be settled: whether the technical surface of the now-green pull request holds,
and whether the copy that ships with the preset - the catalog description and the
roster text - says something a maintainer can stand behind.

The technical surface held. The shipped copy did not: it quotes a token saving
that compares two different tool surfaces, so the two numbers are not a
before/after measurement of anything.

## Decision

**Merge-ready on the technical surface; held on two lines of user-visible copy.**

- The full gate was run on the PR head `f87d607`: `pnpm install --prefer-offline`,
  `pnpm preset:check` (`preset-catalog: OK (33 presets)`),
  `node --test scripts/preset-catalog.test.mjs` (9 pass), `pnpm typecheck`,
  `pnpm test` (55 passed) and `pnpm build` all pass; `git status` is clean and the
  committed `lib/` matches the sources it was built from. The head's required
  check (`preset catalog gate, typecheck, test and build`) is `success`, so the
  gate itself has now produced the repository-side record the previous round was
  waiting for.
- The previous round's single required change landed: `agent.cordis.yml:43` now
  reads `需要执行就用 shell 工具`, so the persona names a capability rather than a
  tool that is disabled off Windows. The contributor also fixed the adjacent `:46`
  (`Select-String / -First / -Tail` wording) on their own; platform-specific
  wording now survives only inside the `process.platform`-gated `pwsh` rows, where
  the row is already `disabled` off Windows and the guidance is therefore correct.
- The preset contract was checked against the repository's own readers and
  validator: the directory name `local-lite` is legal and not a harness-reserved
  id; `preset.yml` and `agent.cordis.yml` are both present; the catalog entry
  carries `id`, `author` and `version`; `order: 132` and `rank: 33` are unique
  among the 33 presets; `tool-surface.mjs` has no imports and passes
  `node --check`; the four `!!js` expressions in `agent.cordis.yml` parse. The
  repository's bilingual README contract (`README.md` + `README.zh.md`, with the
  blob-hash sidecar `README.i18n.yaml`) is a package-README contract: a preset
  directory carries only `preset.yml` and `agent.cordis.yml`, exactly as
  `presets/_template/` does and as all 32 existing presets do, so it is not a
  missing item for this submission.
- **Blocker.** `presets/catalog.json`'s `descriptionEn` and
  `presets/local-lite/preset.yml`'s `description` both quote the same saving - "a
  standing per-request cost cut from about 9,288 to about 2,004 tokens" in the
  catalog, the matching Chinese sentence in the roster text. The 9,288 is the
  shipped `standard` preset (1,490 system-prompt tokens plus 7,798 across 36 tool
  schemas) and the 2,004 is `local-lite` on one profile (13 tools), so the sentence
  reads as one preset's before/after while it compares two presets on two profiles;
  the author states in the pull-request body that the comparison is
  profile-to-profile and that the numbers are only meaningful as absolute costs.
  Both fields are read by the market build into the Workshop store card and into
  the DSH roster, which makes them user-visible copy, so the maintainer asked for a
  statement that holds up: measured values only, or the measurement premise stated
  beside them.
- The same request covers the pull-request body, where the "13 tools" measurement
  is tied to "the same large-profile machine" while the six `ssh_*` controls are
  reported absent from that profile - the value argument elsewhere in the body
  depends on an SSH plugin being installed. The count to expect by default is 11
  schemas (the 7 declared plus `read_image` and the three `job_*` controls); 13 is
  one profile's number and has to be labelled as such.

## Alternatives considered

- **Merging because CI and every gate are green.** A green gate answers whether the
  preset mounts and passes the checks; it says nothing about whether a quoted
  saving is a comparable measurement. The catalog description and the roster text
  are user-visible and would ship to the store card, so a number that does not hold
  up misleads users even with every check green.
- **Not raising a second copy request because the previous round already raised
  one.** The earlier request was about a line of prompt copy that named a
  platform-disabled tool; this one is about a measurement-basis claim in the
  shipped catalog fields. They are different defects in different files, and the
  earlier one being satisfied does not cover this one - dropping it because a
  request was already made once would leave the wrong number in the store.
- **Closing the pull request.** The technical surface is sound - the composition
  mounts only official packages, the surface-restriction plugin is verified, and
  the whole gate passes - and everything outstanding is two lines of copy. Closing
  a working submission over that is disproportionate and discards the preset.

## Consequences

- #1 stays open on the two copy fields, plus the body reconciliation; the gate
  itself is already green, so nothing else has to re-run before merge.
- A preset's `descriptionEn` / `description` is a user-visible surface, not
  internal prose: figures quoted there must be a same-surface measurement or carry
  their measurement premise. Reviewing the code and the gate is not enough on its
  own for these two fields.
- The store sees the preset only after the dsh-web submodule gitlink moves to this
  repository's `main` and `market/dist` is rebuilt - the same two-step intake the
  other satellite repositories use.
- Unverified in this round: token measurement inside a real DSH session, and
  reproduction on an international profile. This repository does not run the market
  build, so the equivalent parse of the `!!js` tags under `scripts/market-build` was
  not executed within this pull request's scope.

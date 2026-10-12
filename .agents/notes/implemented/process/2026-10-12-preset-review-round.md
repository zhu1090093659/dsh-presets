# Agent Note: The 2026-10-12 preset review round

Status: implemented

## Problem

The repository's first open pull request, #1 (`local-lite`, a minimum-prompt
preset for short-context local models), had sat unmerged since 2026-10-06. Its
required check - "preset catalog gate, typecheck, test and build" - had never
executed, because a first-time contributor's fork run waits for a maintainer's
approval and the run was sitting in `action_required`. On the GitHub side that
showed up as `mergeStateStatus: BLOCKED` with no failing check, which reads as a
mysterious hold rather than a gate that has simply not run.

## Decision

**Held, with one required wording change and CI released so the gate can run.**

- The composition is correct where it matters. `presets/catalog.json` gains one
  entry whose shape matches the existing ones (the `category` field is optional by
  contract - `scripts/preset-catalog.cjs` defaults it to `other`, and one of the 33
  existing entries omits it) with no duplicate id, no duplicate `rank` and no
  duplicate `order`. The diff is four files, 279 insertions, 0 deletions.
- `agent.cordis.yml` mounts only official `@deepseek-ai/*` packages as bare names
  with no version pins and no absolute paths; its `!!js process.platform` guards
  match the `_template` composition; every configuration value was validated
  against the installed SDK's own `Config()` schemas. The `{{cwd}}` placeholder
  resolves (registered by the agent loop, and the persona prefix interpolates
  strictly), and `tool-surface.mjs` uses `ctx.tools.restrict` and `schemas()` in
  agreement with the 0.2.0-rc.2 contract, with all 13 `ownTools` names confirmed to
  be real registered tools. The file has no imports, and the preset center treats a
  directory `.mjs` as a code file and absolutizes it, so the "no npm install
  needed" claim holds on this repository's path.
- The one required change: `agent.cordis.yml:43` tells the model to use `pwsh`,
  but the same file disables the pwsh tools off Windows, so on macOS and Linux the
  preset's only system prompt names a tool that is not in the surface. It must
  become a platform-neutral instruction.
- The pull request text also overstates three counts (seven declared tools where
  the composition yields eleven schemas, an online list whose arithmetic does not
  reach thirteen, `load_workspace_dependencies` described as still present when the
  deny calculation removes it) and quotes a test count (8 files / 60 cases) that is
  actually 7 files / 55 cases on both the head and main. The author was asked to
  correct the description.
- The pending CI run was approved so the required check executes; the local
  equivalent of every step in it was run in the meantime (`preset-catalog: OK (33
  presets)`, 9/9 catalog tests, build with no `lib` drift, typecheck clean, 55
  tests across 7 files).

## Alternatives considered

- **Merging on the local gate results alone.** The check is a required status
  check; approving the run is free and produces the repository-side record that a
  reader will look for. Local runs are the reviewer's substitute, not the gate.
- **Holding the pull request for the overstated description.** The description is
  not shipped behavior and the counts are not part of the preset; asking for the
  correction while releasing CI keeps the round moving without waving the numbers
  through as accurate.
- **Treating the missing `category` field as a contract violation.** The validator
  and the catalog README both define it as optional, and the catalog already has a
  precedent, so requiring it would have invented a rule.

## Consequences

- #1 stays open on one line of prompt copy; once that changes, the gate should
  already be green and the preset can merge.
- The store sees the preset only after the dsh-web submodule gitlink moves to this
  repository's `main` and `market/dist` is rebuilt — the same two-step intake the
  other satellite repositories use.
- First-time contributors' fork runs need a maintainer approval before any gate
  evidence exists; a `BLOCKED` status with no failing check should be read as that,
  not as a substantive hold.

# Agent Note: The 2026-10-20 preset intake round

Status: implemented

## Problem

The local-lite submission (#1) came back with the three copy inaccuracies the 2026-10-17 round recorded fixed, on a head that also answers the earlier tool-surface requests. The catalog gate validates structure only, so it cannot check whether the copy describes what the preset actually ships.

## Decision

**#1 is held on two remaining copy inaccuracies**, with structure, code and behaviour accepted. `presets/local-lite/agent.cordis.yml:14` still says seven tools are mounted while `:31-33` in the same file declares ten names and ships eleven, which is the same class of number that was fixed elsewhere in that file. `presets/local-lite/tool-surface.mjs:54-59` still calls 2,004 tokens the preset's own standing cost when `preset.yml:3` and `catalog.json:485` both now say 1,789, and attributes the 1,151 against 1,249 gap to the `web_fetch` schema although both rows of the comparison table carry `web_fetch` and 1,249 is the larger figure.

**The earlier requests are verified as implemented rather than taken on trust**: `fetch: false` on the tool-web row, the `RESERVED_TRANSPORT` filter for `run_code`, `ownTools` without `web_fetch`, the 247-character prompt with its measurement premise, and the stated ownership of `tools/mutation-check.mjs` outside this repository. `preset-catalog --check` reports `OK (33 presets)`, its tests pass 9 cases, `pnpm build` leaves `lib/` unchanged, typecheck is clean and the suite passes 7 files / 55 cases on the merged tree. `order: 132` and `rank: 33` remain the next free values, and the branch's ten-commit lag touches neither `presets/` nor `scripts/`.

**The executable surface is the standing risk.** `tool-surface.mjs` is the first preset asset the host runs through `file://`, so it was reviewed as a security question: no imports, no filesystem or network access, no subprocess use, and a failure path that degrades to an untrimmed surface. That risk class now attaches to the preset center's code-execution policy rather than to this submission.

## Alternatives considered

Merging with both copy fixes deferred was rejected for the reason the 2026-10-17 round gave: the numbers are what the preset sells, and a wrong count misstates the tool surface the user pays for in tokens.

Holding the submission until tokens could be measured reproducibly inside this repository was rejected: the figure is profile-dependent by construction, and the previous round already accepted author-measured numbers as the only evidence available.

## Consequences

The preset stays out of the catalog until the author fixes both lines in the same pull request. No presets pin moves, because the submission is still under review.

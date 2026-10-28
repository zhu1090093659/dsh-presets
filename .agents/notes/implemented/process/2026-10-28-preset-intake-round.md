# Agent Note: The 2026-10-28 preset intake round

Status: implemented

## Problem

#1 (local-lite, a minimum-prompt preset for short-context local models) had been through three rounds of changes requested, and no check had ever reported on its head because the workflow run sat at `action_required`. The third round left two points open: a comment claiming seven tools while the same file declared ten and framed eleven, and a benefit figure attributed to the wrong cause.

## Decision

**#1 merges after the third round, and the last unit error is corrected here instead of by a fourth round.** Both third-round points are answered in a779fe9c: the tool count now reads ten declared and eleven on the wire, naming `read_image` as the auto-registered one, and the benefit paragraph keeps a single matched pair (2,004 against 3,155, difference 1,151, identical prompt bytes, identical host surface, `web_fetch` on in both) with 1,789 listed separately as the preset's own cost. What remained was `tool-surface.mjs:58` and `:65` labelling 186 and 190 as characters when both are token counts (2,004−1,818 and 1,789−1,599); the maintainer corrected those two comments in the same merge train rather than asking for another commit.

**A preset directory may carry an executable module.** `agent.cordis.yml` names `./tool-surface.mjs`, and the preset center resolves that relative row to a `file://` URL through `src/core/definition.ts` `absolutizeRows`, which shipped in v0.4.11; the skin family already ships `hooks.mjs` the same way. This PR is the first preset to use the capability, not the change that introduces it, so it is reviewed as existing behaviour and recorded here because the store now distributes code beside display text.

## Consequences

One of one merged. The catalogue gains its first preset that ships its own plugin file, and the correction commit keeps the unit consistent with the numbers printed next to it.

## Alternatives considered

A fourth review round for a two-word unit fix was rejected: the defect is a comment, the author had answered every substantive point, and a round trip costs them a day for no behavioural change.

Blocking on the executable module was rejected: the resolution path is a shipped capability of the preset center, and a skin already depends on it.

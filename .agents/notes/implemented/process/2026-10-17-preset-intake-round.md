# Agent Note: The 2026-10-17 preset intake round

Status: implemented

## Problem

One submission (#1, local-lite) was open with two earlier change requests. The catalog gate validates structure only, so a green run says nothing about the copy a preset ships with or about the one executable file it carries.

## Decision

**#1 is held on three copy inaccuracies**, with structure and code accepted. Checked on the pull request content: `preset-catalog --check` reports `OK (33 presets)` and its test file passes 9 cases; the id is outside the reserved set, the directory and the catalog entry agree, and `order: 132` and `rank: 33` are the next free values. The earlier requests are implemented: `fetch: false` on the tool-web row, the `run_code` filter through `RESERVED_TRANSPORT`, `ownTools` without `web_fetch`, and the 2,004 figure replaced by the measured 1,789 with its measurement premise.

What remains: the catalog description and `preset.yml` still say seven tools while the composition wires eleven (ten declared names plus `read_image`, registered by `dsh-tool-fs` when attachments are mounted); `agent.cordis.yml` states 270 characters in one comment and 257 in another for the same prompt; and the body's own arithmetic reads ten.

Two further points are recorded: the requested written difference from the built-in minimal preset does not exist in the four files, and `tools/mutation-check.mjs`, referenced by `tool-surface.mjs` and by the description, is not in the repository, so that evidence cannot be reproduced.

## Alternatives considered

Merging and correcting the numbers in a follow-up was rejected: the numbers are what the preset sells, and they are wrong in the direction that would make it look better than it is.

## Consequences

The preset stays out of the catalog until the author pushes a copy fix in the same pull request. This is also the first community preset to carry an executable `.mjs` that the host runs through `file://`, so the copy is the only thing standing between it and the catalog.

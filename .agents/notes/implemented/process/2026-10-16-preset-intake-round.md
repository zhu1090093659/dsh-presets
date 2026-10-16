# Agent Note: The 2026-10-16 preset intake round

Status: implemented

## Problem

One preset pull request was open: #1 adds `presets/local-lite`, a minimum-prompt
preset for short-context local models, and it ships `tool-surface.mjs` - the first
executable file a preset contribution hands to the host process. A preset is code
once it is declared, so the round had to review it as code and not only as a
catalog entry.

## Decision

**Not merged; request changes sent.** The composition, the catalog entry and both
gate commands pass on the pull request's content (`preset-catalog --check` reports
33 presets, the contract suite is 9 of 9), and `tool-surface.mjs` is clean - no
imports, no filesystem or network access, no subprocess, no environment reads, and
its only effect is a deny mask on this preset's own scope. Relative to
`presets/_template/` it also drops the bare `dsh-fs-local` group in favour of the
host's sandboxed filesystem, which is safer than the template.

Three things block it:

1. The `tool-web` row omits `fetch: false`. The host base sets it with a comment
   explaining that the fetch provider defers SSRF protection and lets the model
   choose the request target, and the shipped `standard` and `code` presets follow
   it. A preset row is a separate instance, so this row re-registers `web_fetch`
   inside the preset's scope.
2. The deny list is computed from the global tool view. On a deployment whose
   `tools` row uses `mode: ptc` or `both`, that view contains the reserved
   transport name `run_code`, `restrict()` throws on it, and the plugin catches the
   error and silently masks nothing.
3. The template asks for evidence from a real host install and declaration; the
   submission carries none, and it is the first preset in the catalog to ship an
   executable `.mjs`.

## Alternatives considered

**Merge and file the two defects as follow-ups.** The first one hands a network
capability back to the model in any deployment that mounts a fetch provider, on a
preset whose entire purpose is to be minimal. The second makes the preset a no-op
with only a warning line, which is the failure a maintainer is least likely to
notice.

**Reject the `.mjs` mechanism outright.** Running code inside the host is exactly
what a preset is; the catalog already gates it behind an explicit
`confirmation-required` before a user enables it. The mechanism is acceptable, the
specific file still has to be correct.

**Treat the missing host evidence as a formality.** The catalog cannot install a
preset before the entry exists, which is the author's stated reason; but the same
argument would accept any preset that has never run, and this one carries code.

## Consequences

The catalog stays at 32 entries. Community presets now routinely contain
executable code, so this round's review of `tool-surface.mjs` sets the expectation
that a preset review reads the JavaScript and not only the YAML. The two defects
are cheap for the author to fix, and the required check can then be approved and
run.


## Second pass, 2026-10-16 (maintenance round)

The required check was approved and now passes, and a full local replay of the
gate on `main` plus this pull request agrees with it: install, typecheck, build,
`preset-catalog --check` (OK, 33 presets) and 55 tests all succeed, and
`git status --short -- lib` is clean. The two defects recorded above are fixed in
the source: the `run_code` filtering happens before `ctx.tools.restrict()` is
called, and the `tool-web` row now sets `fetch: false`.

**What still blocks is the copy.** `preset.yml:3` and the catalog entry's
`descriptionEn` both still say "about 2,004 tokens", which was the figure while
`fetch` was on; the submission's own final measurement is 1,789
(`agent.cordis.yml:26` and the body table). Those fields reach the store card and
the roster, so the number has to be the measured one or carry its measurement
premise. The same pass found the shadowing gain quoted as three different numbers
across three files (1,151 / 1,249 / 1,366) and a body sentence claiming ten tools
where its own list sums to eleven.

**The evidence question was settled rather than deferred.** The template's
"evidence from a real host install" was accepted through the substitute the author
supplied - preset-center state reads plus a bundle row declaring the preset - and
the Workshop install path is explicitly deferred to after the catalog entry
exists. That is a structural limit rather than a concession: a preset cannot be
installed from the store before it has been merged, so requiring that log
pre-merge would block every first submission equally.

## Decision

Request changes, scoped to copy and consistency rather than code. Also asked:
drop `'web_fetch'` from the surface's `ownTools` list, or say why it stays, since
this preset no longer registers it and a host that still mounts the fetch provider
would keep it on the wire.

## Alternatives considered

**Approve, and let the store show 2,004 until someone notices.** Once a number is
baked into the market artifacts, correcting it costs a release.

**Require the real-host install log before merging.** It cannot be produced for a
preset that is not in the catalog yet, which makes the requirement unsatisfiable
rather than strict.

**Treat the three different gain figures as cosmetic.** They are the same quantity,
and the next reader cannot tell which is current; that is the condition that
produced this round's defects in the first place.

## Consequences

The catalog stays at 32 entries. This remains the first preset to ship an
executable `.mjs` and it still has no coverage in this repository - the gate only
checks directories, the catalog and single-line `preset.yml` fields, and the
author's six-case suite lives in a sibling repository. Whether that file deserves
a check here is a separate question and is not being settled in this round.

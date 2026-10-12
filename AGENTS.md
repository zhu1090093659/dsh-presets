# dsh-presets Repository Instructions

This repository owns the community agent-preset catalog: `presets/` is the
publishing source for the Workshop's Presets category (the catalog plus one
directory per preset), read by the dsh-web market build from the pinned submodule
commit. The same repository carries the preset-center plugin that installs,
declares, disables and uninstalls those presets.

## Common Commands

```sh
pnpm install
pnpm build
pnpm test
pnpm typecheck
pnpm preset:check   # scripts/preset-catalog.cjs --check
```

## Rules

- Presets are contributed under `presets/<id>/` with one entry appended to
  `presets/catalog.json`; the submission checklist and review rules are in
  [CONTRIBUTING.md](CONTRIBUTING.md).
- A composition mounts only official `@deepseek-ai/*` packages, by bare package
  name and without pinned versions, and must not carry absolute paths or
  machine-local configuration. A preset's system prompt must name tools that
  exist on every platform the composition enables.
- Use Conventional Commits (`feat(presets): ...`, `fix(...)`, `docs(...)`). No
  emoji in code, comments, documentation, or commit messages.
- The integration branch is `main`.

## Agent Notes

Decision records live in [.agents/notes](.agents/notes/README.md). Read it before
changing how presets are reviewed or merged.

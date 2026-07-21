# Contributing

Thanks for helping make messy data less annoying.

## Setup

Requirements:

- Node.js 22.18 or newer
- npm 10 or newer

```bash
npm install
npm run check
```

## Before changing code

Preserve the core contract: do not mutate input, execute getters, permit dangerous path segments,
or expose raw values through diagnostics. Public type changes need matching runtime and compile-time
tests. Keep the synchronous core deterministic and free of runtime dependencies.

## Pull requests

A good pull request:

- solves one coherent problem
- includes runtime and type-level tests when the output type changes
- updates public documentation when behavior changes
- describes user-visible release impact in the pull request
- passes `npm run check`

Public API changes without documentation and type tests are incomplete.

## Release notes

Before 1.0, describe whether a change is a fix, additive API work, or a breaking contract change in
the pull request. Maintainers collect those notes into each alpha release.

## Commit style

Use a small conventional commit with an imperative subject, such as:

```text
feat(runtime): add nested immutable path writes
```

Keep generated output out of commits. The lockfile is expected and must be committed when
dependencies change.

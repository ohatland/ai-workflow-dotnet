---
name: code-standards
description: This project's coding standards for C#/.NET (ASP.NET Core best practices), React/TypeScript (React docs) and accessibility (WCAG via Uutilsynet), complexity limits and how to check them. Use when refining or reviewing code.
---

# Code standards

The standards the `refiner` applies and the `reviewer` checks. The developer is not held to
them while implementing; security rules in `.claude/agents/developer.md` always apply.

Read the file for the code you are working on:

- [backend.md](backend.md): API endpoints, contracts, validation, async, EF Core, PostgreSQL,
  error handling, logging, performance.
- [frontend.md](frontend.md): React (from the official React docs), TanStack Query,
  components, forms.
- [accessibility.md](accessibility.md): the WCAG requirements from Uutilsynet. They win over
  the React docs when the two disagree.

For module structure and abstractions, use the `codebase-design` skill.

## Quality gate

`bun scripts/check.mjs --base <commit>` builds, lints and tests the working tree and checks
the changes since a base commit. `FAIL` blocks: build or test failures, **any** analyzer or
lint warning (the code base is kept at zero), new suppressions, skipped tests, a model
without migration. `FLAG` must be justified:
changed tests, migrations, endpoint mappings, authorization model changes, new packages,
leftovers. Add `--e2e` with the app running, or `--no-tests` while iterating.

## Complexity

Measure, then judge. The tools give objective numbers; you decide whether the structure is
right.

| Check | Command | Limit |
|---|---|---|
| C# compiler and analyzer warnings, including cognitive complexity (S3776) | the quality gate (a full, non-incremental build) | Zero warnings; cognitive complexity 15 per method |
| TypeScript cyclomatic complexity, nesting, parameters | `bun run --cwd web lint` | Zero warnings; complexity 10, nesting depth 3, 4 parameters |

A number under the limit is not proof of good code, and a number over it is a prompt to
restructure, not to split a function mechanically. Prefer reducing complexity by moving
logic to where it belongs (a deeper module, the domain) over extracting private helpers
that only shuffle lines around.

## Code style

Follow existing repository conventions.

Prefer:

- explicit, descriptive names
- small methods
- immutable request/response records
- constructor injection
- `sealed` where appropriate
- nullable reference types
- file-scoped namespaces if already used

Avoid comments that merely restate the code.

Comment why something exists, not what a line does.

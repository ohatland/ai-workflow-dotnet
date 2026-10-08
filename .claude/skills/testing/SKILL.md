---
name: testing
description: How to write tests worth keeping in this project - what a good test is, where tests go (seams), anti-patterns and what to fake. Use when writing or reviewing tests.
metadata:
  source: Adapted from mattpocock/skills (engineering/tdd), MIT License, Copyright (c) 2026 Matt Pocock
---

# Testing

What a good test is, where tests go, and the anti-patterns. Consult it whenever you write a
test.

## What a good test is

Tests verify behavior through public interfaces, not implementation details. Code can
change entirely; tests shouldn't. A good test reads like a specification: "approved time
entries cannot be edited" tells you exactly what capability exists, and it survives
refactors because it doesn't care about internal structure.

See [tests.md](tests.md) for examples and [mocking.md](mocking.md) for what to fake.

## Seams: where tests go

A **seam** is the public boundary you test at: the interface where you observe behavior
without reaching inside. Tests live at seams, never against internals.

Choose the seams yourself; they are an internal decision. Prefer the highest seam that
gives fast, clear feedback:

- **The HTTP API**, through `ApiFactory` in `tests/MyApp.Api.Tests` with real PostgreSQL.
  The default for endpoint behavior, authorization and tenant isolation.
- **A domain module's public interface**, for rules with many cases where going through
  HTTP would be slow or obscure the rule.

Record the seams you chose under Decisions in the step file.

SQL whose effect depends on privileges (roles, grants, RLS, DDL in migrations) is tested as
the non-superuser role that runs it in production, not only as superuser: PostgreSQL turns
some privilege failures into warnings, so a superuser test passes while production silently
does nothing. A test that needs its own database container shares it through a fixture.

## Anti-patterns

- **Implementation-coupled**: fakes internal collaborators, tests private methods, or
  verifies through a side channel (querying the database instead of using the interface).
  The tell: the test breaks when you refactor but behavior hasn't changed.
- **Tautological**: the assertion recomputes the expected value the way the code does, so it
  passes by construction. Expected values must come from an independent source of truth: a
  known literal, a worked example, the contract.

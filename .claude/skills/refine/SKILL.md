---
name: refine
description: Refactor the current step with the refiner subagent - code standards, build and lint warnings, complexity and module structure - without changing behavior.
argument-hint: "[step-file | goal-slug]"
---

Refine step: $ARGUMENTS

Follow `.claude/skills/workflow-protocol/orchestrating.md`. Phase specifics:

1. **Find the step** with status `Refining` and dispatch the `refiner` subagent.
2. On `DONE`, confirm that `bun scripts/check.mjs --base <base> --no-tests` reports no
   warnings before you commit; if it does, send the refiner back.
3. Set the status to `Reviewing`, commit, and report what was restructured, the
   measurements and observations. Continue with `/final-review`.

If tests fail and the refiner cannot fix them without changing behavior, report that
plainly and do not move the step on.

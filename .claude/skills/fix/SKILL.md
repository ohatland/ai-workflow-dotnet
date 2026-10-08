---
name: fix
description: Fix a bug outside a goal with a lighter loop - regression test, fix, quality gate and one review. For behavior that is broken, not for new behavior.
argument-hint: "<bug description>"
disable-model-invocation: true
---

Fix: $ARGUMENTS

A bug fix restores behavior that was intended. New behavior, or a fix that changes the data
model, the API or what the user sees beyond restoring the intended behavior, is a contract
change: stop and take it through `/next-step` instead.

Follow `.claude/skills/workflow-protocol/orchestrating.md` for dispatch, questions and
commits. The record is a fix file instead of a step file.

1. **Record.** Write `docs/fixes/<YYYY-MM-DD>-<slug>.md` with `## Problem` (what happens),
   `## Expected` (what should happen, and where that is decided: a step's contract, an ADR
   or the user), and empty `## Implementation`, `## Review` and `## Retro` sections. Confirm
   the expected behavior with the user if it is not written down anywhere. Commit it; that
   commit is the base.
2. **Fix.** Dispatch the `developer` subagent with the fix file. It writes a regression test
   that fails because of the bug, then fixes the cause, and fills in `## Implementation`
   (cause, fix, test, verification).
3. **Gate.** Run `bun scripts/check.mjs --base <base>`, with `--e2e` and the app running if
   the frontend changed. Warnings and failures go back to the developer.
4. **Review.** Dispatch one `reviewer` subagent with axis `fix`. Blockers and majors go back
   to the developer once; after that, the user decides.
5. **Close.** Record the review, commit, and report to the user. If the fix showed friction
   in the workflow, add it to `docs/process-log.md`; the next retro picks it up.

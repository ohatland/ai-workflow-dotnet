---
name: verify
description: Verify the current step functionally with the tester subagent, against its acceptance criteria and contract in the running app.
argument-hint: "[step-file | goal-slug]"
---

Verify step: $ARGUMENTS

Follow `.claude/skills/workflow-protocol/orchestrating.md`. Phase specifics:

1. **Find the step** with status `Verifying` and dispatch the `tester` subagent.
2. **`PASSED`**: set the status to `Refining`, commit, and report the criteria results,
   findings and observations. Continue with `/refine`.
3. **`FAILED`**: present the failures to the user. A failure where the contract itself looks
   wrong is the user's decision; anything else goes back to the developer. Set the status to
   `Implementing`, commit, and continue with `/implement`.

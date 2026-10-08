---
name: implement
description: Implement the current step with the developer subagent, relaying the developer's questions to the user and resuming it with the answers.
argument-hint: "[step-file | goal-slug]"
---

Implement step: $ARGUMENTS

Follow `.claude/skills/workflow-protocol/orchestrating.md`. Phase specifics:

1. **Find the step** with status `Planned` or `Implementing`. Stop if its contract has no
   approval date; the user approves it with `/next-step` first.
2. Set the status to `Implementing` and dispatch the `developer` subagent.
3. On `DONE`, also check that no observation leaves a public member that cannot be used
   correctly. Then set the status to `Verifying`, commit, and report: what changed, the
   developer's own decisions and its observations. Continue with `/verify`.

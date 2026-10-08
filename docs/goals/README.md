# Goals

Development is organised as goals worked toward in small steps. A user guide in
Norwegian is in [../workflow-guide.md](../workflow-guide.md).

```text
docs/goals/<goal-slug>/
  goal.md                 current state, target state, success criteria, progress
  steps/<NN>-<slug>.md    one increment: task, approved contract, acceptance criteria,
                          and the record of each phase
```

Workflow:

1. `/goal` — agree the goal with the architect. No implementation plan.
2. `/next-step` — choose one small step and approve its contract (data model, API,
   user-facing behavior) and acceptance criteria.
3. `/implement` — the developer builds the step and tests it. It stops to ask when something affects
   the outcome (unclear, could be better, needs a contract change) and records its own
   decisions in the step file.
4. `/verify` — the tester checks the acceptance criteria and contract in the running app,
   adds e2e tests, and sends failures back to `/implement`.
5. `/refine` — the refiner applies code standards, reduces complexity and improves module
   structure, without changing the contract or behavior.
6. `/final-review` — the quality gate (`scripts/check.mjs`) and three parallel reviewers
   (spec, slop, security). Findings go back to `/implement`, `/refine` or the user; a clean
   step is recorded in the goal's progress table, followed by a retro on the process
   (`/retro`), where the user approves each proposed change. Then `/next-step` again.
7. `/close-goal` — verify the success criteria end to end, review the whole goal for drift
   across steps, and run a retrospective that improves the workflow.

Bugs outside a goal go through `/fix`, recorded in [../fixes/](../fixes/). The rules every
phase shares are in `.claude/skills/workflow-protocol/`.

Process friction is noted in [../process-log.md](../process-log.md); `/retro` turns it into
improvements to the workflow.

---
name: close-goal
description: Close a goal - verify its success criteria end to end, review the whole goal for drift across steps, and run a retrospective that improves the workflow.
argument-hint: "[goal-slug]"
disable-model-invocation: true
---

Close goal: $ARGUMENTS

Small steps can each pass review while the whole drifts. This checks the whole, and learns
from how the goal went. You orchestrate; keep your own context small.

If no goal is given, use the only goal with `Status: Active`. If any step is not `Done`,
tell the user and ask whether to continue.

The goal's base commit is the commit that added `goal.md`.

## 1. Whole-goal check

Run these in parallel:

- **Verify.** Dispatch the `tester` subagent to verify the goal's **success criteria** end to
  end in the running app, instead of a step's acceptance criteria. It reports in the reply;
  it does not edit the step files.
- **Gate.** Run `bun scripts/check.mjs --base <goal base>`, saving the output under the
  system temp directory, and give the report path to the reviewers.
- **Review.** Dispatch the `reviewer` subagent with axis `goal` over the goal's diff.
- **Architecture.** Dispatch the `architect` subagent over the goal's diff, the target state
  and the ADRs, using the `codebase-design` skill. Ask for: drift from the target state or
  ADRs, shallow modules or seams in the wrong place across steps, ADRs that are now needed or
  outdated (as proposals with why, advantages and disadvantages, never written directly), and documentation that no longer matches. It must not write files.

Present the combined result to the user. For each issue the user wants fixed, it becomes a
step through `/next-step`; the goal stays active.

## 2. Retrospective

Follow `.claude/skills/retro/SKILL.md` with this goal's step files as the scope, plus the
open entries in `docs/process-log.md`.

## 3. Close

Tick the success criteria, set `Status: Done`, add a short `## Retrospective` section to
`goal.md` with what was learned and what changed in the workflow, and commit.

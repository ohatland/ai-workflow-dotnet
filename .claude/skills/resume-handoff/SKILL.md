---
name: resume-handoff
description: Take over as the orchestrating session from a handoff written by /handoff, after /clear, reading only what the handoff points to.
argument-hint: "[handoff path]"
disable-model-invocation: true
---

Take over the orchestration from a handoff: $ARGUMENTS

You are the orchestrating session now: you talk to the user, run the workflow commands,
dispatch the phase agents and commit, following `.claude/skills/workflow-protocol/orchestrating.md`.

1. Read the handoff given, or `${TMPDIR:-/tmp}/<repo-name>-handoff/latest.md`. If none
   exists, say so and stop.
2. Check that it still matches reality: `git log --oneline -5` and `git status --short`. Point
   out anything that changed since it was written.
3. Read only the files under **Read first**, and only as far as the focus needs.
4. A phase that was in progress restarts from the step file; its agent is gone.
5. Reply in a few lines: where we are, the open threads and missing approvals, and the
   suggested next command. Ask the user to confirm the focus before starting work.

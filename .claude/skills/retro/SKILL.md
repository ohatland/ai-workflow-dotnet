---
name: retro
description: Retrospective on how the AI workflow is working - turn friction from the process log, step files and session transcripts into improvements the user approves one by one. Runs after every step, at /close-goal, or on demand.
argument-hint: "[step-file | goal-slug | session-id | since-date]"
metadata:
  source: Adapted from mattpocock/skills (engineering/retro), MIT License, Copyright (c) 2026 Matt Pocock
---

Run a retrospective: $ARGUMENTS

You are improving the agents' **environment** (roles, skills, checks, settings, docs) so
future runs go better. You are not reviewing the product code.

## 1. Scope and sources

- **After a step** (from `/final-review`, or `/next-step` when it was missed): that step's
  file and the open entries in `docs/process-log.md`. Read the session transcript only when
  the step showed friction: several review rounds, many clarifications, failed
  verification, or the user's corrections.
- **After a goal** (from `/close-goal`): all the goal's step files and the open log entries.
- **On demand**: everything since the newest entry under `## Retros` in the process log, or
  the scope given in the arguments.

What to read:

- **The process log**: open entries in `docs/process-log.md`.
- **Step files**: the Clarifications, Verification failures, Review rounds and findings,
  and the agents' Observations and Process notes.
- **Session transcripts**: `~/.claude/projects/<project-dir>/*.jsonl`, where `<project-dir>` is the repo's absolute path with every `/` replaced by `-`. They
  are large; dispatch a `general-purpose` subagent to read the relevant ones and report
  friction: corrections from the user, repeated mistakes, permission prompts, long searches
  for information, expensive or repeated tool calls, and loops.

If nothing points to a change, say so, record it, and stop.

## 2. Find candidates

Most severe first. For each, name the evidence.

- **Automated checks**: a mistake a check could have caught. Classify it first: a
  **mechanical** violation (a fixed pattern, a banned API, a file rule) gets a deterministic
  check (an analyzer or oxlint rule, or a check in `scripts/check.mjs`), not a written rule.
- **Standards**: a **judgement** call the reviewer missed or the refiner got wrong becomes a
  rule in `code-standards`, or an existing rule is clarified or removed.
- **Planning gaps**: questions the developer had to stop for that `/goal` or `/next-step`
  should have settled; change those skills or the architect role.
- **Phase friction**: a phase that asked too much or too little of the user, looped, or
  repeated another phase's work; change that skill or role.
- **Permissions**: prompts for routine commands, or something that ran without a prompt but
  should not have; change `.claude/settings.json`.
- **Navigation and information access**: agents searched long for something, or lacked it;
  add a pointer in the right skill or doc.
- **Tool economy**: expensive or repeated calls that a script or a narrower command would
  replace.
- **No-ops and size**: instructions that change nothing, and a `CLAUDE.md` that grows. Every
  agent loads `CLAUDE.md`; it holds pointers and principles, details belong in skills.
- **Experiments**: running experiments recorded in memory or the log; say whether the
  evidence supports keeping them.

## 3. Propose

Nothing is applied without the user's approval. Present the proposals numbered, most
severe first, each with:

- **Evidence**: what happened, and where.
- **Change**: the exact file and what changes in it.
- **Advantages** and **disadvantages**: including what it costs in context, speed or
  prompts for the user.

The user approves, adjusts or rejects each proposal separately.

Code issues found along the way (from Observations) are not process changes. List them
separately as candidate steps; the user picks them up in `/next-step` if they want.

## 4. Apply and record

Apply only the approved proposals. Write changes for agents: short, specific, one place
per rule, no duplication between files. A change to an ADR follows the ADR rules in
CLAUDE.md.

Record the outcome:

- For a step: a `## Retro` section in the step file with each proposal and whether it was
  approved, adjusted or rejected, and the candidate steps.
- In `docs/process-log.md`: remove the handled entries, add rejected ones nowhere (the step
  file records them), and add a line under `## Retros` with the date, the scope and what
  changed.

Commit.

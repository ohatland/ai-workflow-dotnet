---
name: next-step
description: Choose the next small increment toward a goal with the architect and get the user's approval of its contract and acceptance criteria.
argument-hint: "[goal-slug]"
disable-model-invocation: true
---

Choose the next step toward goal: $ARGUMENTS

If no goal is given, use the only goal in `docs/goals/` with `Status: Active`; if there are
several, ask which one.

A step is the smallest increment that brings us observably closer to a success criterion,
preferably a thin vertical slice that can be verified end to end, and small enough for one
developer session. A step describes *what*, never *how*: no implementation plan, no file
lists. The developer decides the code.

## Process

1. **Read** `docs/goals/<goal>/goal.md`, the previous step files in `steps/`, and the commits
   since the last step. If the latest step is `Done` but has no `## Retro` section, run its
   retro first (`.claude/skills/retro/SKILL.md`). Candidate steps the retro produced are
   input to this step.
2. **Done?** If every success criterion is met, propose closing the goal instead: tick the
   criteria, set `Status: Done`, commit, and stop.
3. **Propose.** Dispatch the `architect` subagent with the goal path. Ask it to propose one
   next step: a title, a few sentences of task, a draft contract, acceptance criteria and
   open questions. It must also list the ADR requirements the step touches and which of
   them the draft leaves out; each one left out becomes an open question. It must not write
   files.
4. **Approve the contract.** Present the proposal and use the `grilling` skill on the open
   questions. The contract covers exactly what the user controls (see "Human-controlled
   decisions" in CLAUDE.md): data model, API structure and user-facing behavior. Write
   `None` for a section that does not change. User-facing behavior must meet the criteria
   marked **Contract** in `.claude/skills/code-standards/accessibility.md`, such as
   confirmation before deleting data and clear error messages. Get explicit approval of the contract and the
   acceptance criteria. Do not ask about internal code structure.
5. **Write** `docs/goals/<goal>/steps/<NN>-<step-slug>.md` from the template below, numbering
   steps from `01`. Record the approval with today's date.
6. **Commit** the step file. That commit is the step's base: later phases diff from it.
   Suggest `/implement` as the next command.

## Template

```markdown
# Step <NN>: <title>

- Goal: [<goal title>](../goal.md)
- Status: Planned

## Task

<What this step achieves and why, in two to five sentences.>

## Contract

Approved by the user on <YYYY-MM-DD>.

### Data model

<Tables, columns, constraints, RLS policies that change, or None.>

### API

<Endpoints: method, path, request and response fields, status codes, or None.>

### User-facing behavior

<What the user sees and can do in the UI, including messages and error states, or None.>

## Acceptance criteria

1. <Observable scenario: given ..., when ..., then ...>

<Mark a criterion `(verified by the user)` when checking it needs a destructive or privileged
action on the developer's machine, such as removing secrets or volumes. Word criteria about
existing tests as "no assertion or expected value changed", not "without edits", so refine
can restructure tests without breaking the criterion.>

## Clarifications

<Questions raised during implementation and the user's answers.>

## Implementation

## Verification

## Refinement

## Review

## Retro
```

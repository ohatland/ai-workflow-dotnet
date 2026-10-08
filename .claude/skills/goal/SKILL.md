---
name: goal
description: Start or revise a development goal with the architect — current state, target state and success criteria, without a detailed implementation plan.
argument-hint: "[idea | goal-slug]"
disable-model-invocation: true
---

Establish a goal for: $ARGUMENTS

A goal describes *where we are going and how we know we got there*. It is not an
implementation plan: the work is done later in small steps chosen one at a time with
`/next-step`. Keep it short.

If `$ARGUMENTS` names an existing folder in `docs/goals/`, revise that goal instead of
creating a new one.

## Process

1. **Current state.** Dispatch the `architect` subagent to survey the code and ADRs relevant
   to the idea. Ask it to return, briefly: what exists today, the ADRs and constraints that
   apply, and the architectural questions the goal raises. It must not write files.
2. **Align.** Use the `grilling` skill with the user on the target state, success criteria,
   what is out of scope, and the *direction* of data model, API and user-facing behavior.
   Settle direction only; exact contracts are approved per step.
3. **ADR.** If the goal requires a significant architectural decision, ask the `architect`
   subagent for an ADR proposal (decision, why now, alternatives, advantages and
   disadvantages, recommendation) and put it to the user. Only after the user approves,
   have the architect write the ADR and update the index: continue the architect that wrote
   the proposal (`SendMessage`), or give a new one the full approved proposal text and the
   user's changes. A summary is not enough; it loses approved points.
4. **Write** `docs/goals/<goal-slug>/goal.md` from the template below. Use a short kebab-case
   slug. Show the user the result and adjust until they approve it.
5. **Commit** the goal (and any ADR), then suggest `/next-step <goal-slug>`.

## Template

```markdown
# Goal: <title>

- Status: Active
- Started: <YYYY-MM-DD>

## Current state

<What exists today and what the problem is. A few sentences or bullets.>

## Target state

<What is true when we are done, from the user's and the system's point of view.>

## Success criteria

- [ ] <Observable outcome that can be verified in the app or through the API>

## Out of scope

- <What this goal deliberately does not do>

## Direction and constraints

<Approved direction for data model, API and user-facing behavior. Links to relevant ADRs.>

## Progress

| Step | Result | Learned |
|---|---|---|
```

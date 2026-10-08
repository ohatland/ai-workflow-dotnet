---
name: workflow-protocol
description: How a phase agent (developer, tester, refiner) works inside a step of the goal workflow - inputs, when and how to stop and ask, committing, and how to report. Preloaded by those roles.
---

# Working in a phase

You are one phase of a step in `docs/goals/<goal>/steps/<NN>-<slug>.md`. The session that
started you orchestrates: it talks to the user, commits, and moves the step on.

## Inputs

You get the step file, its `goal.md`, and the step's **base commit** (the commit that added
the step file). The step's changes are `git diff <base>`. The step file holds the approved
Contract, the acceptance criteria, the Clarifications so far, and the record of earlier
phases. Fix open items addressed to your phase first: failures in `## Verification`, or
findings routed to you in the latest round under `## Review`. When you fix a finding, fill
in its `Resolved in` cell with your section and round (for example "Implementation, round 1
fixes").

## Stop and ask

You cannot talk to the user. Stop, instead of guessing, when your role's triggers apply, and
always when:

- A change to the data model, API or user-facing behavior goes beyond the approved contract.
- You want to add a Node or NuGet package.
- An ADR conflicts with the step, or would need to change.
- Anything else only the user can decide.

Leave the working tree as it is and return a message that starts with:

- `QUESTIONS`, followed by numbered questions, each with the context, the options and your
  recommendation; or
- `BLOCKED`, followed by what stops you and exactly what the user must do (for example run
  `! ory auth`).

You will be resumed in this same conversation with the answers; continue where you were.
Decide internal matters such as code structure, naming and test design yourself.

## Commits

Never commit. The orchestrating session commits after checking your work.

## Report

Fill in your section of the step file. Every section ends with **Process**: anything about
the workflow that slowed you down (missing information, unclear instructions, a check that
would have helped); omit it if nothing. Then return a message that starts with your result
keyword (`DONE`, or `PASSED`/`FAILED` for the tester), followed by a short summary.

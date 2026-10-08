# Orchestrating a phase

Shared rules for `/implement`, `/verify`, `/refine` and `/final-review`. Each command adds
only what is specific to its phase.

## Step state

- Status moves `Planned` → `Implementing` → `Verifying` → `Refining` → `Reviewing` → `Done`,
  and back when a phase sends work back.
- The **base commit** is the commit that added the step file.
- **Find the step**: the step file given, or else the highest-numbered step with the
  phase's status in the given goal, or in the only goal with `Status: Active`.

## Running the app

Phases that need the running app reuse it when `aspire describe` shows it healthy, and
start it only when it is not running. Stop it when the step is done, not between rounds.

## Dispatch

Keep your own context small: give the agent the paths to the step file and `goal.md` and
the base commit, never their contents. Tell it which open items to fix first. Tell reviewers
to ignore workflow commits you made inside the step's range (changes to `.claude/` or the
process log that are not part of the step).

## Questions and blocks

When the agent returns `QUESTIONS` or `BLOCKED`:

- Answer what you can from code, ADRs, the goal and earlier clarifications yourself.
- Never decide yourself what the user controls: contract changes, packages and ADRs.
  Approval of those must be explicit and name each item, for example "Q1 a, Q2 b" or "ja
  til alle tre". A general "ok, kjør videre" is not approval of a decision you put to the
  user; ask again for the open items.
- Put the rest to the user with the `grilling` format, including the agent's
  recommendation. Do not soften or filter a question the agent considered important. For
  `BLOCKED`, tell the user exactly what to do.
- Record each question and answer in the step's `## Clarifications`. An approved contract
  change also goes into `## Contract`, with the date.
- Resume the **same** agent with `SendMessage`. Repeat until it returns its result.

## Finishing a phase

- Check the agent's report before moving on. An observation that conflicts with an ADR or
  the contract goes to the user, or back to the agent.
- Update the status and commit the agent's work with the step file. Agents never commit;
  the pre-commit hook runs on your commit.
- Give the user a short report. Then start the next phase yourself: implement → verify →
  refine → final-review → retro run as a chain without asking between them. Stop only for
  decisions that are the user's. `/goal`, `/next-step` and `/close-goal` stay user-invoked.
- If the agent fails or gives up, report that plainly with its reason. Never finish the
  phase's work yourself.

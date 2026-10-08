---
name: final-review
description: Final gate for a step - run the quality gate, review along spec, slop and security axes in parallel, route findings, and give the user a short digest of where to look.
argument-hint: "[step-file | goal-slug]"
---

Review step: $ARGUMENTS

Follow `.claude/skills/workflow-protocol/orchestrating.md`; the `reviewer` subagents review.

## Process

1. **Find the step** with status `Reviewing`. Count the earlier `### Round` entries under
   `## Review`; this is the next round.
2. **Gate.** With the app running (see "Running the app" in the protocol), run
   `bun scripts/check.mjs --base <base> --e2e`, saving the output to a file under the
   system temp directory. If the app cannot start, run without `--e2e` and record e2e as
   unverified.
3. **Gate failures** need no reviewers. Build or test failures route to `implement`; any
   build or lint warning, suppressions or skipped tests route to `refine`. Go to step 6.
4. **Review.** Dispatch three `reviewer` subagents in parallel, one per axis: `spec`, `slop`
   and `security`. Give each the step file, goal, base commit, gate report path and its axis.
5. **Merge.** Deduplicate the findings and drop any without concrete evidence. Keep the
   reviewers' severity unless it is clearly wrong.
6. **Record** a `### Round <n>` entry under `## Review` in the step file: the gate result,
   the findings (severity, title, location, route, and an empty `Resolved in` column),
   **Where the user should look**, and the
   reviewers' Process notes.
7. **Route.**
   - No `blocker` or `major` findings: set `Status: Done`, add a row to the goal's progress
     table (step, result, what was learned), commit, and give the user the digest. Then run
     the step's retro: follow `.claude/skills/retro/SKILL.md` with this step as the scope.
     Only after the retro, suggest `/next-step`, or `/close-goal` if the success criteria
     look met.
   - Findings routed to `user`: put them to the user with the `grilling` format first.
   - Otherwise set the status to `Implementing` if any finding routes to `implement`, else
     `Refining`. Commit and continue with `/implement` or `/refine`. Those phases fix the open
     findings first, and the step comes back here.
   - If this was round 2 or later and blockers or majors remain, stop and let the user
     decide instead of looping again.

The digest to the user is short: verdict, findings that block, minor findings, and the
places worth a human look.

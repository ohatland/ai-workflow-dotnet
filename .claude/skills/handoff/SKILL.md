---
name: handoff
description: Hand the orchestration over from this session to a fresh one - a short handoff from the orchestrating session to its successor, so the user can /clear and continue with /resume-handoff.
argument-hint: "[what the next session will focus on]"
disable-model-invocation: true
metadata:
  source: Adapted from mattpocock/skills (productivity/handoff), MIT License, Copyright (c) 2026 Matt Pocock
---

You are the orchestrating session: you talk to the user, run the workflow commands,
dispatch the phase agents and commit. Write a handoff to your successor, the next
orchestrating session, so it can take over the process without this conversation.
Focus of the next session: $ARGUMENTS

## 1. Make durable what should outlive the session

The handoff is temporary; it holds session state, not rules. Before writing it, check that
everything decided in this conversation that should last is already where it belongs:

- Workflow rules and conventions: the repo (`CLAUDE.md`, roles, skills, docs), committed.
- Decisions about the product: step files, goals or ADRs, through the usual approvals.
- The user's preferences and project state: memory.

If something is missing, list it for the user and ask before writing it; do not slip it into
the handoff instead. Uncommitted work is named in the handoff, not committed silently.

## 2. Write the handoff

Save it to `${TMPDIR:-/tmp}/<repo-name>-handoff/<YYYY-MM-DD-HHMM>-<slug>.md`, outside
the repo, and overwrite `latest.md` in the same folder with the same content.

Keep it under about 60 lines. Point to files, commits and step files by path or hash; never
copy what they already say. Sections:

- **Focus**: what the next session will do, from the arguments or the conversation.
- **State**: where things stand: the latest relevant commits, the active goal and step and
  its status, uncommitted changes and who owns them, and whether the app is running.
- **Process position**: the phase in progress and the next command. Phase agents do not
  survive `/clear`; name any that were mid-phase, so the successor restarts that phase from
  the step file instead of resuming the agent.
- **Open threads**: questions waiting for the user (and which approvals are still missing),
  promised follow-ups, and anything the user asked to come back to.
- **Working with the user**: only what memory and the repo do not already say about how
  this user wants the process run; usually a pointer is enough.
- **Decisions not yet recorded elsewhere**: ideally none; each with why it is not recorded.
- **Read first**: the few files the next session needs, in order.
- **Suggested commands and skills**: for example `/next-step authorization-foundation`.

Redact secrets, passwords and personal data.

## 3. Tell the user

Give the path, a three-line summary, and the next move: run `/clear`, then `/resume-handoff`.

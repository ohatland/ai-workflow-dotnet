# Project instructions

This is a .NET 10 + React B2B application.

Architecture:

- ASP.NET Core REST API
- React + TypeScript + Vite
- TanStack Query
- PostgreSQL
- EF Core
- Ory Kratos for authentication
- OpenFGA for authorization
- PostgreSQL RLS for tenant isolation
- SignalR for realtime notifications

Architecture decisions are recorded in `docs/adr/`.

Roles are defined as subagents in `.claude/agents/`:

- `architect` for architectural design and ADRs
- `developer` for implementing a task
- `tester` for functional verification in the running app
- `refiner` for refactoring without changing behavior
- `reviewer` for the final gate against AI slop (read-only)

When the user asks you to act as architect, implement a task, or review code, delegate to
the matching subagent, or follow its definition when the session itself runs as that agent.

## Human-controlled decisions

The user controls the data model (tables, columns, constraints, RLS), the API structure
(endpoints, request and response contracts, status codes) and user-facing behavior. Never
assume or change these without explicit approval. Approved decisions are recorded in the
Contract section of a step in `docs/goals/`.

ADRs need the user's approval before they are written or changed. Propose first: the
decision, why it is needed now, the alternatives, and the advantages and disadvantages.

New packages also need the user's approval, every time: Node packages (dependencies or
devDependencies) and NuGet packages (including test and analyzer packages). Build or buy:
write small things ourselves, but when a large, well-established package solves the problem
we are working on, propose it rather than building our own. A proposal explains what the
package does, why the platform, existing dependencies or a little of our own code are not
enough, its maintenance and adoption, and its cost (size, transitive dependencies, lock-in).
Subagents stop with `QUESTIONS` to ask, and the orchestrating session always puts the
question to the user; it never approves a package itself.

Everything else, such as internal code structure, naming, refactoring and tests, is for
agents to decide without asking. Once a contract is approved, proceed autonomously.

## Tooling

The frontend uses Bun: `bun install`, `bun add`, `bun run`, `bunx`. Never use npm, npx, pnpm
or yarn, and never commit another lockfile than `web/bun.lock`.

## Development workflow

Work is organised as goals worked toward in small steps; see `docs/goals/README.md`.
Start with `/goal`, then `/next-step` for each increment, and finish with `/close-goal`.
Every step ends with a retro on the process before the next step starts. Bugs outside a
goal go through `/fix`.

When the user points out friction in the workflow, or you notice it, add a line to
`docs/process-log.md`. `/retro` turns the log into improvements.

To run the app or tests, use the `run-app` skill (`.claude/skills/run-app/SKILL.md`).

Never mix architectural redesign into an implementation task unless explicitly requested.

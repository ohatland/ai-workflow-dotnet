# ai-workflow-dotnet

A Claude Code setup for building a .NET + React B2B application with AI agents, in small
steps with the human in control of what matters. Copy it into a repository and let Claude
adapt it to that project.

The stack it assumes:

- ASP.NET Core REST API, EF Core, PostgreSQL with RLS for tenant isolation
- React + TypeScript + Vite, TanStack Query, Bun
- Ory Kratos for authentication, OpenFGA for authorization, SignalR for realtime
- Aspire for local orchestration, Playwright for end-to-end tests

## The workflow

Work is organised as **goals** reached in small **steps**. The main session orchestrates:
it dispatches role agents, puts their questions to the user and commits after each phase.

```text
/goal → /next-step → implement → verify → refine → final-review → retro → /next-step … → /close-goal
                     └──────────── chained automatically ────────────┘
/fix for bugs outside a goal
```

| Command | What happens | Who |
|---|---|---|
| `/goal` | Current state, target state, success criteria. No implementation plan. | architect + user |
| `/next-step` | One small step with a contract (data model, API, user-facing behavior) and acceptance criteria. The user approves the contract. | architect + user |
| `/implement` | Working code and tests; stops to ask instead of guessing. | developer |
| `/verify` | Acceptance criteria checked in the running app, through the browser and the API. | tester |
| `/refine` | Code standards, zero warnings, complexity and module structure, without changing behavior. | refiner |
| `/final-review` | Quality gate plus three parallel reviewers: spec, slop and security. | reviewer ×3 |
| `/retro` | Process friction turned into proposed changes to the setup, each approved by the user. | main session + user |
| `/close-goal` | Success criteria end to end, drift across steps, retrospective. | tester, reviewer, architect |
| `/handoff`, `/resume-handoff` | Hand the orchestration to a fresh session around `/clear`. | main session |

The state lives in files, so any session can pick up where the last one stopped:
`docs/goals/<goal>/goal.md` and `docs/goals/<goal>/steps/NN-<slug>.md`, where each step file
records the approved contract, clarifications and the result of every phase.

### What the user controls

- The data model, the API structure and user-facing behavior (the step contract).
- ADRs: proposed with alternatives, advantages and disadvantages before they are written.
- Every new NuGet or Node package.
- Every change the retro proposes to the setup.

Everything else (code structure, naming, tests, refactoring) the agents decide themselves.

## What is in the repository

```text
CLAUDE.md                          project instructions every agent loads
.claude/
  settings.json                    permissions: allow build/test/git, ask for packages and ADRs, deny npm and --no-verify
  agents/                          architect, developer, tester, refiner, reviewer
  skills/
    goal, next-step, close-goal    planning commands
    implement, verify, refine,     phase commands
    final-review, retro, fix
    handoff, resume-handoff        session handover
    workflow-protocol/             shared rules for phase agents and the orchestrator
    grilling/                      structured question rounds with the user
    code-standards/                C#, React/TypeScript and accessibility (WCAG) standards
    codebase-design/               deep modules, seams and interfaces
    testing/                       what a good test is and where tests go
    run-app/                       start the app with Aspire, sign in, drive it with Playwright
scripts/
  check.mjs                        quality gate: build, lint, tests, diff rules, new packages
  pre-commit.mjs, diff-rules.mjs   fast checks on every commit
  authorization-model.mjs          OpenFGA model transform and tests
  seed-test-users.mjs              Kratos test users for e2e and manual testing
.githooks/pre-commit
docs/
  workflow-guide.md                user guide (Norwegian)
  goals/README.md                  goal and step structure
  adr/README.md                    ADR index, empty
  fixes/README.md                  bug fix records
  process-log.md                   friction log that feeds the retro
```

## Adopting it

Copy the files into the target repository and ask Claude to adapt them. Things to change:

- **`MyApp`** is a placeholder for the solution and project names (`MyApp.slnx`,
  `src/MyApp.Api`, `src/MyApp.Infrastructure`, `tests/MyApp.Api.Tests`, `MyApp.AppHost`),
  the database roles (`myapp_owner`, `myapp_app`) and the test domain (`test.myapp.example`).
- **`CLAUDE.md`**: the architecture list.
- **ADRs**: the roles point to ADRs for authentication, tenancy and authorization. Write
  them for the project and list them in `docs/adr/README.md`.
- **`run-app`**: how the project starts, its ports, its test users and how to sign in.
- **`scripts/check.mjs`**: the build, tests and checks that apply to the project.
- **The architect's backend structure** and the testing skill's seams (`ApiFactory`) describe
  one project layout; change them to match.
- **`<repo-name>`** in the handoff skills and **`<project-dir>`** in the retro skill.

Then enable the pre-commit hook once per clone:

```bash
git config core.hooksPath .githooks
```

Aspire's own skills are not included; install them with `aspire agent init`.

## Credits

The `grilling`, `retro`, `handoff`, `testing` and `codebase-design` skills are adapted from
[mattpocock/skills](https://github.com/mattpocock/skills), MIT License, Copyright (c) 2026
Matt Pocock. See [LICENSE](LICENSE).

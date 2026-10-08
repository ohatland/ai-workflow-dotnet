# What to fake

Fake only at **system boundaries** you do not control:

- Ory Kratos sessions: use `FakeOry` in the API tests
- Time: inject `TimeProvider` and use a fake one in tests
- Other external HTTP services

Never fake:

- EF Core or PostgreSQL: use the real database from Testcontainers. RLS and constraints are
  part of the behavior.
- The OpenFGA model: test against a real OpenFGA container.
- Your own classes or modules, or internal collaborators.

When code talks to an external service, inject a specific client per service with one
method per operation, so each fake returns one known shape without conditional logic.

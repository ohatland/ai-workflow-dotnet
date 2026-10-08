---
name: run-app
description: Start MyApp with Aspire, sign in as a seeded test user, and drive or test it with Playwright. Use when asked to run the app, verify a change in the browser, or run tests.
---

# Run and test MyApp

## Tests

| What | Command (repo root) | Needs |
|------|---------|-------|
| API integration tests (auth, provisioning, endpoint inventory) | `dotnet test --project tests/MyApp.Api.Tests` | Docker |
| Authorization model tests, and `model.json` up to date | `node scripts/authorization-model.mjs check` | Docker |
| End-to-end smoke tests against real Ory | `bun run --cwd web e2e` | Running app + seeded test user |

Run the API tests after any change to `src/`. The endpoint inventory test calls every
`/api` endpoint anonymously and expects `401`. If you add an intentionally anonymous endpoint,
add it to `AnonymousEndpoints` in `EndpointInventoryTests.cs`, and say so in your report.

Run the e2e tests after changes to authentication, the AppHost, Ory configuration or the
login UI, and before reporting such work as done.

## Start the app

```bash
aspire start --apphost MyApp.AppHost/MyApp.AppHost.csproj
aspire describe   # wait until api, frontend, ory and openfga are Healthy
# The tunnel reports Healthy before it serves login flows; wait for 200 before signing in:
until curl -sf -o /dev/null -H 'Accept: application/json' http://localhost:4000/self-service/login/browser; do sleep 2; done
```

Fixed URLs: frontend `http://localhost:5173`, Ory tunnel `http://localhost:4000`.
Both ports must be free. Always use `localhost`, never `127.0.0.1` (cookies).

If the `ory` resource is `Finished`, read `aspire logs ory`. A `401 ... Access token is not
active` means the tunnel has neither a project API key nor a valid CLI login. Ask the user to
set `Parameters:ory-project-api-key` (see README) or to run `! ory auth`, then run
`aspire resource ory start`.

## Sign in as a test user

Never sign in as the user's own account (user 0); you do not have
and must not ask for its password.

```bash
node scripts/seed-test-users.mjs                    # creates/resets user@ and other@test.myapp.example
bun run --cwd web e2e --project=setup               # writes web/e2e/.auth/user.json (user@)
```

`test-users.json` lists the users in seed order: `users[0]` is `user@`, the one the e2e tests
sign in as; `users[1]` is `other@`, a second account for non-member and permission checks.

For interactive Playwright MCP use, sign in by loading the session cookies that the setup
project wrote, with `browser_run_code_unsafe`. No password is sent. The snippet has no `fs`,
`require` or `import`, so it reads the file through the browser via `file://`:

```js
async (page) => {
  await page.goto('file://<repo-root>/web/e2e/.auth/user.json')
  const { cookies } = JSON.parse(await page.locator('body').innerText())
  await page.context().addCookies(cookies)
  await page.goto('http://localhost:5173/')
  await page.getByRole('heading', { name: '<a heading on the start page>' }).waitFor()
}
```

If `/api/me` returns `401` afterwards, the session is gone (reseeding resets it): run the setup
project again.

# Good and bad tests

## Good tests

**Through the real interface**, with real PostgreSQL and the fake Ory session from
`ApiFactory`:

```csharp
[Fact]
public async Task Signed_in_user_can_read_their_profile()
{
    var token = api.Ory.ActiveSession(Guid.NewGuid(), "user@example.test");
    var request = new HttpRequestMessage(HttpMethod.Get, "/api/me");
    request.Headers.Add("Cookie", $"session={token}");

    var response = await api.CreateApiClient().SendAsync(request, TestContext.Current.CancellationToken);

    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
}
```

Characteristics:

- Tests behavior that users or callers care about
- Uses the public interface only
- Survives internal refactors
- Describes WHAT, not HOW
- One logical assertion per test

The other examples are illustrative; follow the helpers in `tests/MyApp.Api.Tests`.

## Bad tests

**Implementation-detail tests**, coupled to internal structure:

```csharp
// BAD: asserts that a collaborator was called
await handler.Handle(command, ct);
authorizationMock.Verify(a => a.CheckAsync(userId, Permission.ReadTenant, It.IsAny<Resource>(), ct));
```

Red flags:

- Faking internal collaborators
- Testing private methods
- Asserting on call counts or order
- The test breaks when refactoring without a behavior change
- The test name describes HOW, not WHAT
- Verifying through a side channel instead of the interface

```csharp
// BAD: bypasses the interface to verify
await client.PostAsJsonAsync("/api/customers", new { Name = "Alice" });
Assert.True(await db.Customers.AnyAsync(c => c.Name == "Alice"));

// GOOD: verifies through the interface
var created = await client.PostAsJsonAsync("/api/customers", new { Name = "Alice" });
var customer = await client.GetFromJsonAsync<CustomerResponse>(created.Headers.Location);
Assert.Equal("Alice", customer!.Name);
```

Checking the database directly is right when the database *is* the behavior, such as RLS
policies or "exactly one row is created under concurrency".

**Tautological tests**, where the expected value restates the implementation:

```csharp
// BAD: expected value computed the way the code computes it
var expected = entries.Sum(e => e.Hours);
Assert.Equal(expected, timesheet.TotalHours);

// GOOD: an independent, known literal
Assert.Equal(7.5m, timesheet.TotalHours);
```

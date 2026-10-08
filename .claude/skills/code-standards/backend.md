# Backend standards

Based on [ASP.NET Core Best Practices](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/best-practices?view=aspnetcore-10.0)
and this project's conventions. Read the source when a section here is not enough.

## API endpoints

Prefer resource-oriented REST endpoints.

Examples:

```text
GET    /api/customers
GET    /api/customers/{id}
POST   /api/customers
PUT    /api/customers/{id}
DELETE /api/customers/{id}
```

Use:

- `200 OK`
- `201 Created`
- `204 No Content`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `409 Conflict`

appropriately.

Use Problem Details for API errors.

Do not return stack traces or internal exception details to clients.


## Request and response models

Do not expose EF Core entities directly from the API.

Use explicit contracts.

Example:

```csharp
public sealed record UpdateCustomerRequest(
    string Name);

public sealed record CustomerResponse(
    Guid Id,
    string Name);
```

Keep contracts simple.

Do not introduce mapping frameworks unless the project already uses one and it provides clear value.

Prefer explicit mapping.


## Validation

Validate input at the API boundary.

Examples:

- required values
- string lengths
- formats
- identifiers
- ranges

Do not rely on database errors for normal user input validation.

Business-rule validation belongs in the application/domain layer.


## Async code

Use async APIs for I/O.

Always propagate `CancellationToken` where practical.

Example:

```csharp
public async Task<Customer?> GetAsync(
    Guid id,
    CancellationToken cancellationToken)
{
    return await db.Customers
        .SingleOrDefaultAsync(
            x => x.Id == id,
            cancellationToken);
}
```

Do not use:

```csharp
.Result
.Wait()
```


## Entity Framework Core

Prefer simple, readable EF Core queries.

Use:

```csharp
AsNoTracking()
```

for read-only queries unless tracking is needed.

Avoid loading more data than required.

Project to response models when practical.

Example:

```csharp
var customer = await db.Customers
    .AsNoTracking()
    .Where(x => x.Id == id)
    .Select(x => new CustomerResponse(
        x.Id,
        x.Name))
    .SingleOrDefaultAsync(cancellationToken);
```

Avoid N+1 queries.

Use `Include` only when appropriate.

Do not hide EF Core behind a generic repository abstraction.


## PostgreSQL

Use PostgreSQL-specific capabilities when they clearly improve the solution.

Do not write database-specific SQL when ordinary EF Core is simpler and sufficient.

When using raw SQL:

- parameterize values
- never concatenate user input
- document why raw SQL is used


## Error handling

Expected errors should be represented explicitly.

Examples:

```text
Validation failure
Not found
Forbidden
Conflict
```

Do not use exceptions for ordinary control flow.

Use exceptions for unexpected failures.

Log unexpected exceptions once, at the appropriate boundary.

Avoid duplicate logging at several layers.


## Logging

Use structured logging.

Good:

```csharp
logger.LogInformation(
    "Customer {CustomerId} updated for tenant {TenantId}",
    customerId,
    tenantId);
```

Avoid:

```csharp
logger.LogInformation(
    $"Customer {customerId} updated");
```

Never log:

- passwords
- session cookies
- API keys
- authorization headers
- secrets

Be careful with personal data.


## Performance

Do not optimize without evidence.

However, avoid obvious problems:

- N+1 queries
- loading entire tables
- synchronous I/O
- unnecessary repeated OpenFGA calls
- repeated Kratos session lookups within the same request
- excessive SignalR payloads

Use caching only when a concrete need is identified.


## ASP.NET Core performance and reliability

From the official best practices:

- **Never block on async.** No `.Result`, `.Wait()` or `Task.Run(...)` awaited immediately
  in request code. Make the whole call stack async.
- **Never use `async void`.** Return `Task` so the request does not complete early.
- **Do not let exceptions drive normal flow.** Detect expected conditions and return a
  result; throw for the unexpected.
- **Page large collections.** Return a page with size and index instead of everything.
  Materialize with `ToListAsync` instead of returning `IEnumerable<T>` from an endpoint, or
  return `IAsyncEnumerable<T>`.
- **Query only what the request needs.** Filter and aggregate in the database, use
  no-tracking for reads, minimize round trips, and avoid projections on collections that
  cause N+1 queries.
- **Use `IHttpClientFactory`.** Never create and dispose `HttpClient` per call.
- **Keep middleware and per-request code fast.** No long-running work in middleware,
  authorization handlers or per-request services. Long-running work goes to a hosted
  service, with SignalR to notify the client.
- **Read request bodies asynchronously** and never buffer large bodies into a single
  `string` or `byte[]`. Use `ReadFormAsync` instead of `Request.Form`.
- **`HttpContext` belongs to the request.** Do not store `IHttpContextAccessor.HttpContext`
  in a field, do not use it from parallel tasks or after the request completes, and do not
  capture it, or request-scoped services such as `DbContext`, in background work. Copy the
  values you need, and create a new scope with `IServiceScopeFactory` for background work.
- **Do not change status code or headers after the response has started.** Check
  `Response.HasStarted` or use `Response.OnStarting`.
- **Do not assume `Request.ContentLength` is set.** `null` means unknown, not zero.


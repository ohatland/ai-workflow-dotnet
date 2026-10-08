# Frontend standards

Based on the official React docs, <https://react.dev/learn>, the Vite guide,
<https://vite.dev/guide/>, and the accessibility
requirements in [accessibility.md](accessibility.md). **When the React docs and the
accessibility requirements disagree, the accessibility requirements win.**

Every React docs page is available as Markdown by adding `.md`, for example
<https://react.dev/learn/you-might-not-need-an-effect.md>. Read the page when a rule here is
not enough.

## React

- **Keep components pure.** Same props, state and context give the same JSX. Never mutate
  props, state or variables that existed before rendering; local mutation of values created
  during the render is fine. ([Keeping Components Pure](https://react.dev/learn/keeping-components-pure))
- **Side effects go in event handlers first.** `useEffect` is a last resort, for
  synchronizing with something outside React. ([You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect))
  - Compute derived values during render; use `useMemo` only for expensive calculations.
  - Reset state when an identity changes with a `key`, not with an Effect.
  - Put logic caused by a user action in that event handler.
  - Do not chain Effects that set state to trigger each other.
  - Do not use Effects to sync or notify parents; update both in the same event.
  - Do not fetch data in Effects; server data goes through TanStack Query.
- **Structure state deliberately.** ([Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure))
  - Group state that always changes together.
  - Avoid contradictory state; use one status value instead of several booleans.
  - Do not store what can be computed from props or state.
  - Do not duplicate the same data in several places; store ids, not copies.
  - Keep state flat rather than deeply nested.
  - Do not mirror props in state. If a prop is only an initial value, name it `initial...`.
- **Put state where it is used.** Lift it to the closest common parent when siblings share
  it; use a reducer when updates are many and related, and context only for data many
  components deep in the tree need. ([Managing State](https://react.dev/learn/managing-state))
- **Stable keys.** List items use an id from the data as `key`, never the array index for
  lists that can change. ([Rendering Lists](https://react.dev/learn/rendering-lists))
- **Rules of hooks.** Call hooks only at the top level of components and custom hooks. Share
  stateful logic with custom hooks named `use...`. ([Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks))
- **Refs are an escape hatch,** for values that do not affect rendering and for focus and
  other DOM work React cannot express. ([Referencing Values with Refs](https://react.dev/learn/referencing-values-with-refs))

## Frontend implementation principles

Keep React simple.

Use:

- TanStack Query for server state
- React state for local UI state
- React Router for navigation

Do not introduce Redux unless there is a demonstrated need.

Do not duplicate server state into global React state.


## TanStack Query

API reads should normally use TanStack Query.

Example:

```typescript
const query = useQuery({
  queryKey: ["customers", tenantId],
  queryFn: () => getCustomers(tenantId),
});
```

Mutations should invalidate relevant queries.

Example:

```typescript
const mutation = useMutation({
  mutationFn: updateCustomer,
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ["customers", tenantId],
    });
  },
});
```

Keep query keys predictable and consistent.


## React components

Prefer small, focused components.

Do not split components merely to reduce line count.

Extract a component when it:

- has a clear responsibility
- is reused
- isolates meaningful complexity

Keep feature-specific code within the feature.


## Forms

Keep form handling simple.

Use the existing form library if one is already established.

Do not add a new form library for a trivial form.

Display server validation errors clearly.

Do not assume client-side validation replaces server-side validation.


## Vite

From the [Vite guide](https://vite.dev/guide/):

- **Vite only transpiles; it does not type-check.** `bun run --cwd web build` runs `tsc -b`
  first; run it, not just the dev server, before calling frontend work done.
- **Keep the bundler-mode TypeScript settings** in `tsconfig.app.json`
  (`moduleResolution: bundler`, `verbatimModuleSyntax`, `types: ["vite/client"]`). Use
  `import type` for type-only imports.
- **Environment variables.** Only `VITE_`-prefixed variables reach the browser through
  `import.meta.env`, and everything that does ends up in the public bundle: never put a
  secret there. Server-side settings such as `API_PROXY_TARGET` stay in `vite.config.ts`.
  `.env.*.local` files are not committed. Type custom variables in `ImportMetaEnv`.
  ([Env Variables and Modes](https://vite.dev/guide/env-and-mode))
- **Imports.** Import modules directly instead of through barrel files that re-export a
  folder. Import static assets so Vite resolves their URL; use `public/` only for files that
  must keep their exact name. ([Performance](https://vite.dev/guide/performance), [Static Asset Handling](https://vite.dev/guide/assets))
- **Code splitting.** Use dynamic `import()` (for example `React.lazy` per route) for large
  parts of the app not needed at first load.
- **CSS.** Plain CSS or CSS Modules (`*.module.css`) over preprocessors.
- **The API goes through the Vite proxy** in development (`/api`), so the browser stays on one
  origin; do not hardcode API hosts in frontend code.


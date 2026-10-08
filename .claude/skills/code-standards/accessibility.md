# Accessibility (universell utforming)

The requirement set is the WCAG success criteria that Uutilsynet lists for the private
sector: <https://www.uutilsynet.no/wcag-standarden/wcag-standarden/86?f%5B0%5D=t2%3A130>.
They are requirements, not suggestions. **When the React docs and these requirements
disagree, these requirements win.**

The **Decided in** column says who owns a criterion:

- **Contract**: it shapes what the user sees or does, so it belongs in the step's
  user-facing behavior, approved by the user (`/next-step`). Agents report gaps; they do not
  change visible behavior on their own.
- **Code**: it is met in markup and code without changing what the user sees. The developer
  should meet it, the refiner fixes it, and the tester checks it.

| Criterion | Level | Decided in | How to meet it in this app |
|---|---|---|---|
| 1.1.1 Ikke-tekstlig innhold | A | Code | `alt` on every `img` (`alt=""` when decorative); icon-only buttons get an accessible name. |
| 1.2.1 Bare lyd og bare video | A | Contract | Provide a text alternative for recorded audio or video. |
| 1.2.2 Teksting | A | Contract | Captions for recorded video with sound. |
| 1.3.1 Informasjon og relasjoner | A | Code | Semantic HTML: headings in order, lists, tables with `th`, `label` tied to every input, `fieldset`/`legend` for groups, landmarks (`header`, `nav`, `main`). Never a `div` as a button. |
| 1.3.2 Meningsfylt rekkefølge | A | Code | DOM order matches the reading order; do not reorder meaning with CSS. |
| 1.3.3 Sensoriske egenskaper | A | Contract | Instructions do not rely only on shape, colour, size or position ("the green button"). |
| 1.4.1 Bruk av farge | A | Contract | Colour is never the only signal; errors and states also have text or an icon. |
| 1.4.2 Styring av lyd | A | Contract | Audio that plays automatically for more than 3 seconds can be paused or muted. |
| 1.4.3 Kontrast (minimum) | AA | Contract | Text contrast at least 4.5:1, large text 3:1. |
| 1.4.4 Endring av tekststørrelse | AA | Code | Works at 200 % text size: `rem` units, no fixed heights that clip text. |
| 1.4.5 Bilder av tekst | AA | Code | Real text, not images of text. |
| 2.1.1 Tastatur | A | Code | Everything works with the keyboard alone. Use `button`, `a` and form elements; custom controls need focus and key handling. |
| 2.1.2 Ingen tastaturfelle | A | Code | Focus can always leave a component; dialogs close with Esc and return focus. |
| 2.2.1 Justerbar hastighet | A | Contract | Time limits, such as session expiry, warn the user and can be extended. |
| 2.2.2 Pause, stopp, skjul | A | Contract | Moving or automatically updating content, such as live updates over SignalR, can be paused, or does not move on its own. |
| 2.3.1 Terskelverdi på maksimalt tre glimt | A | Code | Nothing flashes more than three times per second. |
| 2.4.1 Hoppe over blokker | A | Code | A skip link to `main`, and landmarks. |
| 2.4.2 Sidetitler | A | Code | Every route sets a descriptive `document.title`. |
| 2.4.3 Fokusrekkefølge | A | Code | Logical tab order; move focus sensibly after route changes and when dialogs open and close. |
| 2.4.4 Formål med lenke (i kontekst) | A | Code | Link text says where it goes; no bare "Les mer". |
| 2.4.5 Flere måter | AA | Contract | More than one way to reach a page, such as navigation and search, except steps in a process. |
| 2.4.6 Overskrifter og ledetekster | AA | Contract | Headings and labels describe the topic or purpose. |
| 2.4.7 Synlig fokus | AA | Code | Keyboard focus is always visible; never remove `outline` without a replacement. |
| 3.1.1 Språk på siden | A | Code | `<html lang="nb">`. |
| 3.1.2 Språk på deler av innholdet | AA | Code | `lang` on passages in another language. |
| 3.2.1 Fokus | A | Code | Receiving focus never changes context (no navigation or submit on focus). |
| 3.2.2 Inndata | A | Contract | Changing a field never changes context unexpectedly, such as submitting or navigating on select. |
| 3.2.3 Konsekvent navigering | AA | Contract | Navigation is in the same place and order on every page. |
| 3.2.4 Konsekvent identifikasjon | AA | Contract | The same function has the same name and icon everywhere. |
| 3.3.1 Identifikasjon av feil | A | Code | Errors are described in text and tied to the field (`aria-invalid`, `aria-describedby`). Map Problem Details validation errors to their fields. |
| 3.3.2 Ledetekster eller instruksjoner | A | Contract | Visible labels, required fields marked, expected formats explained. |
| 3.3.3 Forslag ved feil | AA | Contract | When the fix is known, the error message suggests it. |
| 3.3.4 Forhindring av feil | AA | Contract | Submissions with legal or financial effect, or that change or delete the user's data, can be reversed, are checked, or are confirmed first. Approvals and deletions are examples. |
| 4.1.1 Parsing | A | Code | Valid markup and unique `id`s; use `useId` for generated ids. |
| 4.1.2 Navn, rolle, verdi | A | Code | Prefer native elements. Custom controls expose name, role and state (`aria-expanded`, `aria-pressed`, `aria-checked`). |

In e2e tests, prefer `getByRole` and `getByLabel`: a test that cannot find an element by role
and accessible name usually points to a 1.3.1 or 4.1.2 problem.

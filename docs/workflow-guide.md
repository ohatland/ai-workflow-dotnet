# Arbeidsflyt med Claude – brukerguide

Hvordan vi utvikler med Claude Code. Den tekniske beskrivelsen som agentene
leser, ligger i [goals/README.md](goals/README.md) og [CLAUDE.md](../CLAUDE.md).

## Byggeklossene

| Type | Hva | Hvordan du bruker det |
|---|---|---|
| **Kommandoer** | `/goal`, `/next-step`, `/implement`, `/verify`, `/refine`, `/final-review`, `/close-goal`, `/retro`, `/fix` | Du skriver dem. De er overgangene i flyten. |
| **Personas** (subagenter) | `architect`, `developer`, `tester`, `refiner`, `reviewer` | Startes av kommandoene. Spørsmålene deres kommer til deg via hovedøkten. |
| **Skills** (kunnskap) | `grilling`, `testing`, `code-standards`, `codebase-design`, `run-app`, Aspire | Lastes automatisk av rollene som trenger dem. |
| **Faste kontroller** | `scripts/check.mjs`, pre-commit-hooken, OpenAPI-snapshot, analyzere, tillatelser i `.claude/settings.json` | Kjører eller gjelder automatisk. |

Hovedøkten (du og Claude) er dirigenten: den sender arbeid til personaene, stiller deg
spørsmålene deres og fører alt inn i filene. Personaene jobber i egne kontekstvinduer.

## Én runde

1. **`/goal <idé>`** – Arkitekten kartlegger dagens situasjon. Du svarer på spørsmålsrunder
   (hvert spørsmål har en anbefaling) og godkjenner `goal.md`: situasjonsbilde, målbilde,
   suksesskriterier og hva som ikke er med. Ingen implementeringsplan.
2. **`/next-step`** – Arkitekten foreslår ett lite steg med kontraktutkast og akseptkriterier.
   **Du godkjenner kontrakten** (datamodell, API, brukerflate). Dette er den viktigste porten.
3. **`/implement`** – Developer skriver kode som virker, og tester for den. Den stopper og spør
   når noe er uklart, kunne vært bedre eller krever kontraktsendring. Du får en rapport med
   beslutningene den tok selv.
4. **`/verify`** – Testeren tester i nettleseren og mot API-et, og skriver kontrakt- og
   e2e-tester. Du trengs bare hvis den blir blokkert (typisk `! ory auth`) eller en feil
   ligger i kontrakten.
5. **`/refine`** – Refiner rydder etter standardene, reduserer kompleksitet og forbedrer
   modulstrukturen, uten å endre oppførsel. Går som regel av seg selv.
6. **`/final-review`** – Kvalitetsskriptet og tre reviewere (spesifikasjon, slop, sikkerhet).
   Funn sendes tilbake til riktig fase. Du leser oppsummeringen og **ser på stedene reviewer
   peker ut**. Etter runde 2 avgjør du.
7. **Retro** – Startes automatisk når steget er godkjent i review. Claude ser på hva som
   skapte friksjon i steget og foreslår endringer i prosessen, hver med begrunnelse,
   fordeler og ulemper. **Du godkjenner, justerer eller avviser hvert forslag.** Ingenting
   legges inn automatisk. Kodeproblemer som dukket opp, blir kandidater til neste steg.
8. Tilbake til **`/next-step`** til suksesskriteriene er nådd. `/next-step` starter ikke før
   forrige steg har hatt sin retro.
9. **`/close-goal`** – Suksesskriteriene verifiseres ende til ende, helheten gjennomgås, og
   en retrospektiv foreslår forbedringer i oppsettet.

Innenfor et steg starter Claude neste fase selv; etter retroen foreslår Claude `/next-step`.

## Hva skjer automatisk

- Personaene startes, og fortsettes med svarene dine.
- Spørsmål går via hovedøkten, som svarer selv på det som kan slås opp.
- Avklaringer, testrapport, refaktorering og review føres i stegfila.
- Status oppdateres, og det committes på `main` etter hver fase.
- Kvalitetsskriptet kjøres, og funn rutes.
- Bygg, test, git og endringer i kode og dokumentasjon kjører uten å spørre.

## Hva som krever deg

- Mål og kontrakter: datamodell, API og brukerflate.
- Nye pakker (Bun og NuGet), hver gang, med begrunnelse. Små ting lager vi selv; store,
  veletablerte pakker som løser det vi jobber med, foreslås heller enn at vi lager dem selv.
- Endringer i API-kontrakten: `openapi.snapshot.json` oppdateres bare for en godkjent endring.
- ADR-er. Arkitekten foreslår først: beslutningen, hvorfor den trengs nå, alternativene,
  og fordeler og ulemper. Den skrives ikke før du har godkjent.
- Hvert forslag fra retroen.
- Svar på spørsmål fra personaene.
- Avgjørelsen når et steg har funn etter runde 2.
- Å starte `/goal`, `/next-step` og `/close-goal`. Fasene `/implement` → `/verify` → `/refine` →
  `/final-review` → retro kjedes automatisk, og stopper bare for beslutninger som er dine.

## Husk

1. **`/clear` mellom steg eller mål.** Alt ligger i filene; neste kommando leser stegfila.
   Midt i noe, eller når samtalen er blitt lang: kjør `/handoff [neste fokus]`, deretter
   `/clear` og `/resume-handoff`. Handoff skriver et kort overleveringsdokument utenfor repoet med
   pekere til filer og commits; varige beslutninger skal allerede ligge i repoet eller minnet.
   Bruk ikke `/resume` til dette – den henter tilbake hele den gamle samtalen.
2. **Kontrakten er porten.** Ta deg tid. Du kan redigere stegfila selv før `/implement`.
3. **Små steg.** Ser et steg stort ut, be om å dele det.
4. **Én flyt per arbeidskopi.** Parallelt arbeid i egen worktree: `claude --worktree`.
5. **Før `/verify` og `/final-review`:** Docker kjører, Ory-innloggingen er gyldig, og
   portene 5173 og 4000 er ledige.
6. **Feil utenfor et mål:** `/fix <beskrivelse>` – regresjonstest, retting, kvalitetsskript og
   én review. Endrer rettingen kontrakten, går den via `/next-step` i stedet.
   Andre småting kan du be om direkte.
7. **Hele økter i én rolle:** `claude --agent architect` for fri utforsking,
   `claude --agent developer` for en stor oppgave der du vil ha dialogen direkte.
8. **«Husk at …»** lagrer noe i Claudes minne til neste økt. Varige regler hører hjemme i
   repoet.

## Kvalitet som alltid gjelder

- **Null advarsler.** Kvalitetsskriptet feiler på enhver advarsel i bygg og lint, ikke bare
  nye. Refiner retter alle, også de som fantes fra før.
- **Pre-commit-hook** stopper skjulte advarsler, hoppede tester og kode som ikke kompilerer.
  Slå den på én gang per klon: `git config core.hooksPath .githooks`.
- **Eksplisitt godkjenning.** «ok, kjør videre» regnes ikke som godkjenning av en beslutning;
  svar per punkt, for eksempel «Q1 a, Q2 b».

## Forbedre prosessen

- **Underveis:** Si fra når noe er tungvint. Claude noterer det i
  [process-log.md](process-log.md). Personaene noterer også friksjon under «Process» i
  rapportene sine.
- **`/retro`** når du vil: leser prosessloggen, stegfilene og økt-transkriptene, og foreslår
  konkrete endringer. Mekaniske feil blir automatiske sjekker; skjønnsspørsmål blir regler
  i standardene eller rollene; planleggingshull blir endringer i `/goal` og `/next-step`.
  Du godkjenner hver endring.
- **`/close-goal`** kjører den samme retrospektiven for hvert mål.

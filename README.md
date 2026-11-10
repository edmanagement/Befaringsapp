# Befaringsapp – Scandic Markiser

En web-app (PWA) for befaring på iPhone. Den har ingen server: alt lagres på telefonen og eksporteres som zip til Dropbox.

## Kom i gang (utvikling)

```
npm install
npm run dev        # åpner på http://localhost:5173
npm test           # måleregler, motor og eksport (Vitest)
npm run build      # lager dist/ for publisering
```

Klikktest av hele flyten i mobilstørrelse: `npx vite preview --port 4173` i ett vindu og `node tests/e2e.mjs` i et annet.

## Mappestruktur

```
src/
  motor/        generisk skjemamotor (typer.ts, motor.ts) – ingen produktlogikk
  regler/       måleregler (regler.ts) og tallhåndtering (tall.ts)
  produkter/    én fil per produkt + index.ts (rekkefølge i appen)
  valglister/   eBest-lister (duker, farger, motorer) – oppdateres uten å røre resten
  grenser/      min/maks per plissetype (tom = ingen varsler)
  db/           lokal lagring (IndexedDB via Dexie)
  eksport/      befaring.json, oppsummering.md, zip, bildekomprimering
  sider/, skjermer/   brukergrensesnitt
tests/          enhetstester + e2e.mjs
EKSPORTFORMAT.md     forklarer eksportfilene
```

## Oppdatere eBest-valglister

Listene ligger i `src/valglister/`. Hvert valg er teksten slik den står i eBest.

- **Ny duk i en kolleksjon:** legg nummeret til i riktig liste i `honeycell.ts` (per prisgruppe) eller `screen.ts`.
- **Plissé-fargenumre:** i `honeycell.ts`, under `plisseDuker`. Bytt `p('Basel')` med `{ navn: 'Basel', numre: ['1234', '5678'], navnIEbest: true }`.
- **Grenser per plissetype:** fyll inn `src/grenser/plissetyper.ts`, f.eks. `P1600: { maksBredde: 200, maksHoyde: 220 }`.
- **Standardvalg** ligger i produktfilen (`standard: '…'`).

Kjør `npm test` og `npm run build` etter endringer, og publiser `dist/` på nytt.

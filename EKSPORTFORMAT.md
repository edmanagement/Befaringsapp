# Eksportformat – Scandic Markiser befaringsapp

Skjemaversjon: **1**

Denne filen forklarer hva befaringsappen eksporterer, slik at en Claude-økt kan lage tilbud og eBest-bestilling ut fra filene uten å se koden.

## Mappestruktur

Hver befaring lagres i Dropbox som en utpakket mappe under **`/Scandic Markiser/Befaringer/`** (knappen «Fullfør og lagre i Dropbox»). Reserve: samme mappe som zip-fil.

```
ÅÅÅÅ-MM-DD Fornavn Etternavn/
  befaring.json        ← alt strukturert – bruk denne som fasit
  oppsummering.md      ← samme innhold, lesbart for mennesker
  bilder/
    01-stue-vest-1.jpg ← <postnr>-<postnavn>-<bildenr>.jpg, maks 1600 px lengste side
```

En befaring kan lagres flere ganger. Nyeste versjon erstatter filene i mappen (samme mappenavn), og `bilder/` tømmes først.

## Viktige prinsipper

- **Alle mål er i cm**, som tall med én desimal (JSON bruker punktum: `120.4`).
- **Bestillingsmålet er allerede regnet ut.** Bruk `bestillingsmaal_cm` rett inn i eBest. Ikke trekk fra eller legg til noe på nytt. `maalt_cm` er det som ble målt på stedet, og `regel` forklarer forskjellen.
- **`ebest_tekst` er teksten slik den skal velges eller skrives i eBest.** `verdi` er den rå verdien appen lagret.
- **`kilde`** sier hvor verdien kommer fra:
  - `valgt`: valgt av selgeren på stedet
  - `standard`: standardverdi som selgeren godtok uten å endre
  - `skriv_selv`: fritekst fordi valget manglet i listen. Kontroller mot eBest, eller legg verdien i kommentar.
  - `automatisk`: satt av appen etter en regel (f.eks. Large bunnlist ved bred screen). Se `varsler`.
- Felt som ikke er aktuelle (f.eks. regulering for en plissetype uten snor) er **ikke med**.

## befaring.json

```jsonc
{
  "skjemaversjon": 1,
  "app": "Scandic Markiser befaringsapp",
  "eksportert": "2026-11-10T16:25:41+01:00",   // lokal tid med tidssone
  "befaring": {
    "id": "…",                                  // intern id
    "kunde": { "navn": "Ola Nordmann", "telefon": "…", "adresse": "…", "epost": "…" },
    "dato": "2026-11-12T14:00",                 // tidspunkt for befaringen (lokal tid)
    "produktinteresse": ["Zipscreen"],          // samme kategorier som CRM
    "sluttkommentar": "…",                      // kommentar til hele befaringen
    "status": "eksportert",
    "kilde": "manuell"                          // manuell | import
  },
  "poster": [ /* én per vindu/åpning, se under */ ]
}
```

### Post

```jsonc
{
  "nr": 1,                                       // rekkefølge, også prefiks i bildefilnavn
  "postnavn": "Stue vest",
  "kategori": "Interiør",                        // Interiør | Eksteriør | Garasjeporter
  "produkt": {
    "id": "honeycell",                           // se produkt-id-er under
    "navn": "Honeycell / Plissé",
    "skjemaversjon": 1,                          // versjon av produktdefinisjonen
    "ebest_sti": "Interiør > Plissegardiner",    // hvor produktet ligger i eBest
    "enkelt_skjema": false                       // true = generelt skjema, færre felt enn eBest krever
  },
  "antall": 2,
  "felt": [ /* valg, se under */ ],
  "maal": [ /* mål, se under */ ],
  "varsler": [ { "felt": "bredde", "tekst": "…" } ],  // varsler som ble vist i appen
  "mangler": [],                                 // id-er til påkrevde felt uten svar (bør være tom)
  "kommentar": "Husk stige",                     // kommentar til denne posten
  "bilder": ["01-stue-vest-1.jpg"],              // filnavn i bilder/
  "bilde_hoppet_over": false,                    // true = selgeren valgte «Hopp over bilde»
  "ferdig": true                                 // false = posten ble ikke fullført i appen
}
```

### Felt (valg)

```jsonc
{
  "id": "profilfarge",
  "ledetekst": "Profilfarge",                    // teksten i appen
  "ebest_felt": "Profilfarge",                   // feltnavn i eBest. null = appens eget felt, ikke i eBest
  "verdi": "Hvit",                               // rå verdi. Duk: {"kolleksjon": "MISTRAL", "nummer": "7410"}
  "ebest_tekst": "Hvit",                         // tekst til eBest. Duk: «MISTRAL 7410», screenduk bare «19.1106»
  "kilde": "valgt",                              // valgt | standard | skriv_selv | automatisk
  "plassering": "steg",                          // steg = eget spørsmål, standardvalg = fra Standardvalg-skjermen
  "merknad": "…"                                 // valgfri forklaring, f.eks. for «fra eget lager»
}
```

### Mål

```jsonc
{
  "id": "bredde",
  "ledetekst": "Bredde",
  "ebest_felt": "Bredde (A)",
  "maalt_cm": 120.4,                             // målt på stedet
  "maaltype": "netto",                           // netto | brutto | lysåpning | bestillingsmål | ikke angitt
  "avkryssinger": [                              // valg på målskjermen
    { "id": "sideskinner", "tekst": "Legg til sideskinner (+8,2 cm)", "avkrysset": true }
  ],
  "regel": "Nettomål −0,4 cm (4 mm)",            // regelen som ble brukt
  "beregnet_cm": 120.0,                          // appens beregning
  "bestillingsmaal_cm": 120.0,                   // ← BRUK DENNE i eBest (= beregnet, eller manuelt overstyrt)
  "manuelt_overstyrt": false                     // true = selgeren skrev bestillingsmålet selv
}
```

## Produkter og felt-id-er

### `honeycell` – Honeycell / Plissé (eBest: Interiør > Plissegardiner)

Felt: `type` (Honeycell/Plissé), `prisgruppe`, `plissetype`, `skravindu` (appens eget, styrer laveste høyde), `profilfarge`, `duk` (eBest: Duktype), `regulering` (bare P17xx), `feste`, `underlag`. Standardvalg: `system`, `monteringshoyde`, `snorlengde` (bare P17xx), `snorlengde_cm` (bare ved Spesial).
Mål: `bredde` (netto −0,4 cm), `hoyde` (brutto, ingen regel), `laveste_hoyde` (bare ved skråvindu).
Merk: Plissé-duker har bare kolleksjon i appen. Nummeret er skrevet inn (`kilde: valgt`, men nummeret er fritekst).

### `screen-v550` – Scandic Zipscreen V550 (eBest: Eksteriør > Screen > Motorstyrt > Verano V550)

Felt: `storrelse` (eBest: artikkel V550 XS/S/M/L), `bunnlist`, `screenduk`, `kassettfarge`, `kassettfarge_ral` (bare ved RAL (egen)), `motor` (eBest: Betjening), `bryter_fjernkontroll`, `regulering`, `stromkabel`, `kabellengde`, `stopsel` (ikke med ved imove – solcellemotor har ikke strømkabel), `utbygging`, `utbygging_avstand`, `utbygging_eget_lager` (true = **skal ikke bestilles**, tas fra eget lager), `feste`, `underlag`, `etasje`, `lift`. Standardvalg: `kassett_type`, `sideskinner`, `forboret_venstre`, `forboret_hoyre`.
Mål: `bredde` (netto, +8,2 cm ved avkrysset sideskinner), `hoyde` (netto, kassett-tillegg XS +12 / S +13 / M +14 / L +16, og +2 ekstra med Large bunnlist).
Regler: Large bunnlist er tvunget når bestilt bredde er over 320 cm. Solcellemotor imove (hvitt/sort panel) står ikke i eBest-listen for V550 og tvinger Rett kassett. Den må legges inn manuelt.

### Generelt skjema (`enkelt_skjema: true`)

Brukes inntil videre for: `persienne-25`, `rullegardin`, `lamellgardin`, `insektsnetting`, `terrassemarkise`, `scandic-80`, `scandic-50`, `standard-50`, `vindusmarkise`, `zipscreen-mini`, `continent-50`, `fasademarkise`, `dukskift`, `pergola`, `levegg`, `glasslosninger`, `garasjeport`.
Felt: `farge` (fritekst), `betjening` (fritekst), `feste`, `underlag`, `etasje`, `lift`. Mål `bredde` og `hoyde` lagres som tastet (`maaltype: "ikke angitt"`, ingen regel). Disse postene har ikke alt eBest krever, så still oppfølgingsspørsmål eller bruk kommentaren.

## Endringslogg

- **1** (10.11.2026): første versjon. Honeycell/Plissé og Screen V550 har eget skjema.

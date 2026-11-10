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
  "manuelt_overstyrt": false,                    // true = selgeren skrev bestillingsmålet selv
  // Bare for felt med faste høydetrinn (persienner):
  "hoydetrinn": true,                            // beregnet_cm = forslaget, bestillingsmaal_cm = trinnet som ble valgt
  "valgt_trinn_cm": 101.0
}
```

**Høydetrinn (persienner):** selgeren velger alltid trinnet selv. `maalt_cm` er målt vindushøyde (kan være `null`). `beregnet_cm` er appens forslag: det minste trinnet som er minst målt høyde, pluss trinnets dekkassehøyde hvis avkryssingen `dekkasse` er på. `bestillingsmaal_cm` er trinnet som ble valgt, og det er det som skal i eBest.

## Produkter og felt-id-er

### `honeycell` – Honeycell / Plissé (eBest: Interiør > Plissegardiner)

Felt: `type` (Honeycell/Plissé), `prisgruppe`, `plissetype`, `skravindu` (appens eget, styrer laveste høyde), `profilfarge`, `duk` (eBest: Duktype), `regulering` (bare P17xx), `feste`, `underlag`. Standardvalg: `system`, `monteringshoyde`, `snorlengde` (bare P17xx), `snorlengde_cm` (bare ved Spesial).
Mål: `bredde` (netto −0,4 cm), `hoyde` (brutto, ingen regel), `laveste_hoyde` og `skra_lengde` (skrå side C) bare ved skråvindu, brutto uten fratrekk.
Varsler for maksmål per plissetype kommer fra prisliste 2026 (side 84–85). Regulering er alltid på høyeste side ved skråvindu.
Merk: Plissé-duker har bare kolleksjon i appen. Nummeret er skrevet inn (`kilde: valgt`, men nummeret er fritekst).

### `screen-v550` – Scandic Zipscreen V550 (eBest: Eksteriør > Screen > Motorstyrt > Verano V550)

Felt: `storrelse` (eBest: artikkel V550 XS/S/M/L), `bunnlist`, `screenduk`, `kassettfarge`, `kassettfarge_ral` (bare ved RAL (egen)), `motor` (eBest: Betjening), `bryter_fjernkontroll`, `regulering`, `stromkabel`, `kabellengde`, `stopsel` (ikke med ved imove – solcellemotor har ikke strømkabel), `utbygging`, `utbygging_avstand`, `utbygging_eget_lager` (true = **skal ikke bestilles**, tas fra eget lager), `feste`, `underlag`, `etasje`, `lift`. Standardvalg: `kassett_type`, `sideskinner`, `forboret_venstre`, `forboret_hoyre`.
Mål: `bredde` (netto, +8,2 cm ved avkrysset sideskinner), `hoyde` (netto, kassett-tillegg XS +12 / S +13 / M +14 / L +16, og +2 ekstra med Large bunnlist).
Regler: Large bunnlist er tvunget når bestilt bredde er over 300 cm (prisliste 2026). Solcellemotor imove (hvitt/sort panel) står ikke i eBest-listen for V550 og tvinger Rett kassett. Den må legges inn manuelt.

### Interiør

- **`persienne-25`** (eBest: Interiør > Persienner > 25mm > Roulette 25). Mål: `bredde` (netto −0,4 cm), `hoyde` (høydetrinn, ingen dekkasse). Felt: `lamellfarge`, `betjening`, `betjening_undervalg` (fritekst/valgfri), `regulering`, `feste`, `underlag`. Standardvalg: `braketter`.
- **`lamellgardin`** (alltid 89 mm). Felt: `prisgruppe`, `hoyde_til` (appens eget: «Til gulv» / «I vinduskarm»), `profilfarge`, `farge_lamell`, `parkering`, `regulering`, `betjening`, `feste`, `underlag`. Mål: `bredde` (netto −1 cm), `hoyde` (til gulv −2 cm, i vinduskarm −1 cm). Standardvalg: `flerfarget` (+ `flerfarget_farger`), `skralamell` (+ `skra_a`–`skra_d` bruttomål uten fratrekk, `skra_vinkel`), `monteringshoyde`.
- **`rullegardin`** (Verano medium / large). Felt: `modell`, `prisgruppe`, `duk`, `kassett`, `profilfarge`, `betjening`, `betjening_undervalg`, `regulering`, `feste`, `underlag`. Mål: `bredde`, `hoyde` (ingen regel). Standardvalg: `styreskinne`, `styrewire`, `monteringsprofil`, `underlist`, `monteringshoyde`.
- **`insektsnetting`**. Felt: `type` (Vindu/Dør), `farge`. Mål: `bredde` (−0,2 cm, eller −0,1 cm hvis `bare1mm` er avkrysset), `hoyde` (ingen regel).

### Eksteriør

- **`zipscreen-mini`**. Mål: `bredde` (−1 cm når `lysaapning` er avkrysset, som er standard), `hoyde` (brutto). Felt: `screenduk`, `kassettfarge` (+ `kassettfarge_ral`), `utbygging`, `utbygging_eget_lager` (true = **skal ikke bestilles**), `regulering`, `snorfarge`, `underlag`, `etasje`, `lift`. Standardvalg: `feste` (Vegg).
- **`terrassemarkise`**. Felt: `modell`, `stativfarge` (+ `stativfarge_ral`), `utfall`, `duktype`, `dukfarge` eller `spesialfarge`, `kappe`, `kantband` (+ `kantband_farge`), `nedfellbar_front` (+ `front_dukfarge`), `betjening`, `sveivlengde` / `fjernkontroll` / `bryter`, `stromkabel` (motor), `regulering`, `tak` (+ `tak_lengde`, `tak_farge`), `hev_senk`, `vindsikring` (fritekst, liste mangler), `braketter`, `feste`, `underlag`, `etasje`, `lift`. Mål: `bredde` (brutto, hele cm).
- **`scandic-50`, `scandic-80`, `standard-50`** (utvendige persienner). Mål: `bredde` (vindusmål +10 cm), `hoyde` (høydetrinn med dekkasse). Felt: `lamellfarge`, `dekkasse` (+ `dekkassefarge`), `vannbrett` (+ `vannbrett_dybde`), `feste`, `underlag`, `etasje`, `lift`. Scandic: `betjening` med `linelengde` / `sveivlengde` / `bryter` / `fjernkontroll` + `kabel`, `regulering`. Standard 50: `linelengde`, `regulering`. Standardvalg: `dekkasse_dybde`, `braketter`, `sammenkobling` (standard «Nei, frittstående») + `sammenkobling_type` / `sammenkobling_avstand`. Scandic 80 har også `sideskinne_venstre`, `sideskinne_hoyre`, `skinnefarge`, `beinlengde`, `beinfarge`, `endelokk`.
- **`continent-50`**. Mål: `bredde` (`maaltype: "bestillingsmål"`, skrevet inn av selgeren etter veiledningen «trekk 2,2–5,5 cm, slutt på ,5», maks 180 cm og maks 3,2 m²), `hoyde` (høydetrinn med dekkasse). Felt: `lamellfarge`, `dekkasse` (+ `dekkassefarge`), `sprosser`, `vendestav`, `regulering`, `feste`, `underlag`, `etasje`, `lift`. Standardvalg: `braketter`.
- **`vindusmarkise`**. Felt: `stativfarge`, duk som terrassemarkise, `nisjebeslag` (+ `nisjebeslag_dybde` i mm), `sideforskyvning`, `wireboks`, `betjening`, `regulering`, `stromkabel` (fritekst), `underlag`, `braketter`, `etasje`, `lift`, `montor`. Mål: `bredde` (+20 cm, eller +10 cm med `vannrett`), `armlengde` (mål / 2, rundet opp til nærmeste 10. Bruk `bestillingsmaal_cm` som armlengde i artikkelen). Standardvalg: `feste` (Vegg).
- **`fasademarkise`** (skal kun brukes under tak). Felt: `modell`, `stativfarge`, `armlengde` (50–100), duk som terrassemarkise, `innvendig_armfeste`, `nisjebeslag` (+ `nisjebeslag_dybde` i cm), `betjening`, `regulering`, `stromkabel`, `underlag`, `braketter`, `etasje`, `lift`. Mål: `bredde` (hele cm). Standardvalg: `feste` (Vegg).

### Generelt skjema (`enkelt_skjema: true`)

Brukes for: `dukskift`, `pergola`, `levegg`, `glasslosninger`, `garasjeport`.
Felt: `farge` (fritekst), `betjening` (fritekst), `feste`, `underlag`, `etasje`, `lift`. Mål `bredde` og `hoyde` lagres som tastet (`maaltype: "ikke angitt"`, ingen regel). Disse postene har ikke alt eBest krever, så still oppfølgingsspørsmål eller bruk kommentaren.

**Felt med `kilde: "skriv_selv"`** der eBest har et «Spesial»-valg (lamellfarge, dekkassefarge, screenduk o.l.): velg «Spesial» i eBest og bruk teksten.

## Import: befaringer.json

Appen kan importere bookede befaringer (knappen «Importer befaringer.json» på forsiden). Filen er en liste, eller `{ "befaringer": [...] }`:

```json
[
  {
    "navn": "Kari Hansen",
    "telefon": "912 34 567",
    "adresse": "Fjordgata 1, 7010 Trondheim",
    "epost": "kari@eksempel.no",
    "dato": "2026-11-12T10:00",
    "produktinteresse": ["Zipscreen", "Markise"],
    "kommentar": "Ring før"
  }
]
```

- `dato`: `ÅÅÅÅ-MM-DDTHH:MM`, `ÅÅÅÅ-MM-DD HH:MM`, `ÅÅÅÅ-MM-DD` eller `DD.MM.ÅÅÅÅ HH:MM`.
- `produktinteresse`: liste eller kommaseparert tekst. Bruk CRM-kategoriene: Dukskift, Garasjeport, Interiørgardin, Markise, Pergola, Utvendig persienne, Varmepumpe, Vindskjerming, Zipscreen, Annet.
- `kommentar` blir sluttkommentaren.
- Navn får stor forbokstav. En befaring med samme telefon (bare sifre, uten +47) og samme dag som en som finnes fra før, hoppes over.

## Endringslogg

- **1** (10.11.2026): første versjon. Honeycell/Plissé og Screen V550 har eget skjema.
- **1** (10.11.2026, etappe 2): alle produkter unntatt dukskift, pergola, levegg, glassløsninger og garasjeport har eget skjema (`produkt.skjemaversjon: 2`). Nye mål-felt `hoydetrinn` og `valgt_trinn_cm`. Import av befaringer.json. Formatet er bakoverkompatibelt, så skjemaversjonen er uendret.
- **1** (10.11.2026): grenser fra prisliste 2026 – Large bunnlist over 300 cm, Continent 50 maks 180 cm / 3,2 m², Persienne 25 maks 260 cm, maksmål per plissetype. Nytt mål `skra_lengde` på Honeycell/plissé ved skråvindu.

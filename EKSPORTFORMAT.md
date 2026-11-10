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
  "ebest_tekst": "HVIT",                         // tekst ordrett som i eBest. Duk: «MISTRAL - 7410», Verano «72.1322 - BASIC - BO PLUS», screen «19.1106-3%»
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

Alle valgtekster er ordrett fra eBest (hentet 10.11.2026), også tegn som «►», «Kasett» og «Hirchmann». `betjening2` er eBests felt «Betjening2» (sveivlengde, fjernkontroll, bryter eller vendestav – avhenger av betjening). `kabel` / `stromkabel` / `kabellengde` er eBests kabelvalg. Felt uten `ebest_felt` er appens egne (styrer skjemaet eller skal i kommentar). `antall` ligger på Standardvalg i alle produkter (standard 1). Braketter spørres ikke om – eBest regner dem ut.

### Interiør

- **`honeycell`** (Interiør > Plissegardiner). Rekkefølge: `type` (Honeycell / Plissé / Skråvindu – Honeycell / Skråvindu – Plissé; `ebest_tekst` er Honeycell eller Plissé), mål, `plissetype` (bare typer som passer målene; skråvindu gir P1740/P1751), `duk` (alle kolleksjoner, vises som «MISTRAL · gr. 1», `ebest_tekst` «MISTRAL - 7410»), `profilfarge`, `regulering` (P17xx), `feste`, `underlag`. Standardvalg: `antall`, `prisgruppe` (`kilde: automatisk` fra duken), `system`, `monteringshoyde` (210), `snorlengde` + `snorlengde_cm`. Mål: `bredde` (netto −0,4), `hoyde` (brutto), ved skråvindu `laveste_hoyde` (eBest D) og `skra_lengde` (C – **ikke eget felt i eBest**, legg i kommentar).
- **`persienne-25`** (Roulette 25). Mål: `bredde` (−0,4), `hoyde` (høydetrinn). Felt: `lamellfarge` («Opl 0717 = 0717»), `betjening`, `betjening2` (vendestavlengde / «Benytter eksisterende fjernkontroll»), `regulering`, `feste`, `underlag`.
- **`lamellgardin`** (89 mm, gr. 1–3 har farger, gr. 4 har ikke målskjema i eBest). Felt: `prisgruppe`, `hoyde_til` (appens), `profilfarge`, `farge_lamell` («BERLIN - 0100»), `parkering`, `regulering`, `betjening` (uten Føringsstav ► ved «Hver side»), `stavlengde` (Føringsstav), `snorlengde` (Spesial snor/kjede ►), `feste`, `underlag`. Standardvalg: `flerfarget` (Nei / Ja ►) + `flerfarget_farger`, `skralamell` + `skra_c`, `skra_d` (eBest har bare C og D; A/B = bredde/høyde), `monteringshoyde`. Mål: `bredde` −1, `hoyde` gulv −2 / karm −1. **Ved skrålamell: ingen fratrekk.**
- **`rullegardin`** (Verano M/L). Felt: `modell`, `prisgruppe`, `duk` («nr - KOLLEKSJON»), `kassett` (Nei / Rund kasett / Rett kasett), `profilfarge` (eBest: Beslag), `betjening` (egne lister for M og L), `betjening2`, `regulering` («Høyre (sett forfra)»), `feste`, `underlag`. Standardvalg: `styreskinne`, `styrewire`, `monteringsprofil`, `underlist`, `monteringshoyde`.
- **`insektsnetting`**. Felt: `modell` («Altho for Vindu - Hvit» osv.). Mål: `bredde` (−0,2 / −0,1), `hoyde`.

### Eksteriør

- **`screen-v550`**. Felt: `storrelse`, `bunnlist`, `screenduk` («19.1106-3%»), `kassettfarge` (+ `kassettfarge_ral` ved RAL ►), `motor` (Somfy-navn som i eBest; iMove solar sort/hvit panel bare med Rett kassett), `bryter_fjernkontroll`, `regulering`, `stromkabel` (uttak), `kabellengde` (liste etter motor), `stopsel`, `utbygging` (+ avstand, `utbygging_eget_lager` = **skal ikke bestilles**), `feste`, `underlag`, `etasje`, `lift`. iMove skjuler uttak, kabellengde og støpsel (eBest viser kabellengde, men den skal ikke fylles). Standardvalg: `kassett_type`, `sideskinner`, `forboret_venstre`, `forboret_hoyre`. Mål: `bredde` (+8,2 med sideskinner), `hoyde` (+kassett, +2 med Large). Large tvunget over 300 cm.
- **`zipscreen-mini`**. Mål: `bredde` (−1 i lysåpning), `hoyde`. Felt: `screenduk` («19.1106-3%»), `kassettfarge` (+ RAL), `utbygging` (+ eget lager), `regulering`, `snorfarge`, `underlag`, `etasje`, `lift`. Standardvalg: `feste`.
- **`terrassemarkise`** (Premium, Premium Pluss, cross-over, Trendline). Felt: `modell`, `stativfarge` (+ RAL), `utfall`, duk (`duktype`, `dukfarge`/`spesialfarge`, `kappe`, `kantband`, `kantband_farge`), `nedfellbar_front` + `front_dukfarge` (ikke Premium), `betjening`, `betjening2`, `stromkabel` (eBest: Kabel), `vindsikring` (Eolis bare med Sunilus), `regulering`, `tak` (Ja/Nei, ikke Premium – lengden regnes ut i eBest) + `tak_farge` (`automatisk`, samme farge som stativet), `hev_senk`, `feste`, `underlag`, `etasje`, `lift`. Mål: `bredde` (brutto, hele cm).
- **`kassettmarkise`** (Verano Ipanema / Santander; Palermo har ikke målskjema). Felt: `modell`, `utfall`, `farge` (+ `spesialfarge` ved RAL ►), `duktype` (Trend/Urban Colors), `dukfarge` (70.xxxx), `armer` (Santander), `led` (Ipanema), `betjening`, `betjening2`, `kabel`, `regulering`, `feste`, `brakett` (Ipanema), `underlag`, `etasje`, `lift`. Mål: `bredde`.
- **`scandic-50`, `scandic-80`, `standard-50`, `continent-50`**. Mål: `bredde` (+10; Continent: bestillingsmål, slutt på ,5), `hoyde` (høydetrinn). Felt: `lamellfarge`, `dekkasse` (Scandic/Standard 50: inkl. «Nei, kun brakett - dybde 10…16»), `dekkassefarge`, `vannbrett` + `vannbrett_dybde`, `feste`, `underlag`, `etasje`, `lift`. Scandic: `betjening`, `betjening2` (lengde / bryter / fjernkontroll), `kabel` (motor), `regulering` (liste etter betjening). Standardvalg Scandic: `sammenkobling` (eBest: Kobles, standard «Nei, Frittstående») + `kobles_venstre` / `kobles_hoyre`. Scandic 80: `dekkasse_lengde`, `sideskinne_venstre/hoyre`, `skinnefarge` og `beinfarge` (følger lamellfarge), `beinlengde` + `ekstra_beinlengde`, `endelokk`. Standard 50: `linelengde` («Lengde, 75cm»), `regulering`. Continent 50: `sprosser` (DekkasseSprosser), `vendestav`, `regulering`.
- **`vindusmarkise`**. Felt: `stativfarge`, armlengde, duk, `nisjebeslag` (ett felt: «Ja, dybde 65 mm»), `sideforskyvning`, `wireboks`, `betjening`, `betjening2` og `stromkabel` (motor), `regulering`, `underlag`, `etasje`, `lift`, `montor` (eBest: Montering). Mål: `bredde` (+20 / +10 vannrett), `armlengde` (mål / 2 opp til nærmeste 10).
- **`fasademarkise`** (Fasade / Balkong, kun under tak). Felt: `modell`, `stativfarge`, `armlengde`, duk, `innvendig_armfeste` (eBest: Armfeste), `nisjebeslag` («Ja, dybde 8cm»), `betjening`, `betjening2`, `stromkabel` (motor), `regulering`, `underlag`, `etasje`, `lift`. Standardvalg: `feste`.
- **`kurvmarkise`**. Felt: `type`, duk, `pyntelist`, `betjening`, `regulering`, `feste`, `underlag`, `etasje`, `lift`. Mål: `bredde`, `utfall`.
- **`dukskift`**. `type` styrer skjemaet: Duk terrassemarkise (+ `terrasse_type`; «Soltis 86 og 96» har ikke målskjema), Duk vindusmarkise, Kappe, Balkongtrekk / sydd duk (+ `duktype_sydd`), Screenduk (+ `screen_type`). Felt etter type: duk, `dukfarge_tekst`, `kappe_k`, `kantband_k` (+ farge), `maljer` + `antall_maljer`, `etasje` (1–5+). Mål: `bredde`, `utfall`, `hoyde` etter type.
- **`pergola`** (Pergoline, Pergo-zip, X-Line, X-Light; Verano-modeller bare som modellnavn). Felt: `modell`, `dukfarge`, `ralfarge`, `skinne_v/h`, `beinlengde` (+ `beinlengde_cm`, X-modeller), `betjening`, `betjening2`, `regulering`, `feste`, `underlag`, `etasje`, `lift`. Mål: `bredde`, `utfall`, `stolpelengde`.
- **`levegg`** (Acryl / Screen). Felt: `duk_type`, `modell` (stativfarge), `dukfarge`, `styreskinne`, `regulering`, `sveivlengde`, `vindu` (appens) + mål `vindu_venstre`, `vindu_hoyde`, `vindu_hoyre`, `vindu_bunn`, `feste`, `underlag`. Mål: `bredde`, `hoyde`.
- **`sidemarkise`** (Acrylduk / Screenduk). Felt: `modell`, `dukfarge`, `profilfarge`, `regulering`, `underlag`. Standardvalg: `feste`, `securestop`, `stolpe`, `universalvinkel`, `skinnehjul`, `ekstrahandtak`.
- **`glasslosninger`** (Olivera, Vadella, Nova, Luderitz; Tofino har ikke målskjema). `system` styrer feltene: Olivera/Vadella `farge`, `bunnskinnefarge`, `bunnskinne`, `tetningslist`, `vegglist`, `parkering`, `las`, `handtak`, `forlengelse_v/h`. Nova `farge`/`ral`, `profilfarge`, `bunnskinnefarge`, `bunnskinne`, `forlengelse_bunnskinne`. Luderitz `farge` (+ `ral`), `glass`, `regulering`, `betjening`, `betjening2`, `sidestolpe`, `fot_v`, `fot_h`, standardvalg `ral_fot`, `toppdeksel`, `skjult_sammenkobling`. Alle: `underlag`, `etasje`, `lift`. Mål: `bredde`, `hoyde`.

### Garasjeporter

- **`garasjeport`** (GS-modeller, trestruktur og glatt). Felt: `modell`, `betjening` (+ `betjening2` føringsskinne ved Dexo), `farge` (glatte modeller har flere), `ral`, `bunnpakning`, `vegg`, `tak`. Mål: `bredde`, `hoyde`, `hn` (nisjehøyde), `b_venstre`, `b_hoyre` (sideplass). Alle som tastet.

**Felt med `kilde: "skriv_selv"`** der eBest har et «Spesial ►»-valg: velg Spesial i eBest og bruk teksten.

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
- Gjennomførte (fullført eller lagret i Dropbox) og slettede befaringer kommer ikke tilbake: samme telefon hoppes over til og med 30 dager etter den gamle datoen. Appen husker slettede befaringer (telefon og dato).

## Endringslogg

- **1** (10.11.2026): første versjon. Honeycell/Plissé og Screen V550 har eget skjema.
- **1** (10.11.2026, etappe 2): alle produkter unntatt dukskift, pergola, levegg, glassløsninger og garasjeport har eget skjema (`produkt.skjemaversjon: 2`). Nye mål-felt `hoydetrinn` og `valgt_trinn_cm`. Import av befaringer.json. Formatet er bakoverkompatibelt, så skjemaversjonen er uendret.
- **1** (10.11.2026): grenser fra prisliste 2026 – Large bunnlist over 300 cm, Continent 50 maks 180 cm / 3,2 m², Persienne 25 maks 260 cm, maksmål per plissetype. Nytt mål `skra_lengde` på Honeycell/plissé ved skråvindu.
- **1** (10.11.2026, eBest-data): alle valgtekster ordrett fra eBest. Duk-tekst i eBest-format. Nye produkter med eget skjema: kassettmarkise, kurvmarkise, dukskift, pergola, levegg, sidemarkise, glassløsninger, garasjeport – ingen produkter bruker lenger generelt skjema. Nye felt `betjening2`, `kobles_venstre/hoyre`, Scandic 80 skinne-/beinfarge. Lamell skrå: bare C og D, uten fratrekk. Formatet er bakoverkompatibelt.
- **1** (10.11.2026): befaringer kan slettes (✕ i listen eller «Slett befaring»). Import hopper over gjennomførte og slettede (samme telefon, inntil 30 dager etter).
- **1** (10.11.2026): Honeycell – plissetype etter mål, skråvindu som typevalg, alle duker med lystett-filter, prisgruppe fra duk. Antall på Standardvalg. Braketter og taklengde fjernet. Monteringshøyde 210 som standard overalt.

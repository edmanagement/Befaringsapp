// Interiør: Persienne 25 mm, Lamellgardin, Rullegardin (Verano M/L), Insektsnetting.
import type { K, Produkt } from '../motor/typer';
import { antall, valg } from './felles';
import { v, profilfarge3, underlag4, underlag5 } from '../valglister/felles';
import {
  lamellBetjening, lamellFarger, persienne25Betjening, persienne25Lamellfarge, veranoBetjening, veranoDuker,
} from '../valglister/interior';
import { roulett25 } from '../valglister/hoydetrinn';
import { ingenRegel, insektBredde, lamellBredde, lamellHoyde, persienne25Bredde } from '../regler/regler';
import { cmTekst } from '../regler/tall';

const over = (navn: string, cm: number | null, maks: number) =>
  cm !== null && cm > maks ? [`${navn} ${cmTekst(cm)} cm er over maks (${maks} cm).`] : [];
const under = (navn: string, cm: number | null, min: number) =>
  cm !== null && cm < min ? [`${navn} ${cmTekst(cm)} cm er under min (${min} cm).`] : [];

// ---------- Persienne 25 mm ----------
export const persienne25: Produkt = {
  id: 'persienne-25',
  navn: 'Persienne 25 mm',
  kategori: 'Interiør',
  versjon: 2,
  ebestSti: 'Interiør > Persienner > 25mm > Roulette 25',
  antallFelt: 'antall',
  steg: [
    antall(),
    {
      id: 'bredde', ledetekst: 'Bredde', ebestFelt: 'Bredde', type: 'maal', maaltype: 'netto',
      hjelp: 'Mål netto bredde. Appen trekker 4 mm.',
      regel: (m) => persienne25Bredde(m),
      varsler: (k) => [...over('Bredde', k.bestilt('bredde'), 260), ...under('Bredde', k.bestilt('bredde'), 27)],
    },
    {
      id: 'hoyde', ledetekst: 'Høyde', ebestFelt: 'Høyde', type: 'maal', maaltype: 'ikke angitt',
      hjelp: 'Velg høydetrinn fra eBest. Tast gjerne målt høyde først, så markeres nærmeste trinn over.',
      trinn: () => roulett25, regel: (m) => ingenRegel(m),
    },
    valg('lamellfarge', 'Lamellfarge', persienne25Lamellfarge, { hjelp: 'Spesialfarge: bruk «Skriv selv».' }),
    valg('betjening', 'Betjening', persienne25Betjening),
    // TODO: fyll inn fra eBest – undervalget som åpnes etter valgt betjening.
    valg('betjening_undervalg', 'Betjening – undervalg', [], {
      valgfri: true, hjelp: 'Undervalgene er ikke lagt inn i appen ennå. Skriv selv eller hopp over.',
    }),
    valg('regulering', 'Regulering', v('Høyre', 'Venstre')),
    valg('feste', 'Feste', v('Vegg', 'Tak')),
    valg('underlag', 'Underlag', underlag4),
    { id: 'braketter', ledetekst: 'Braketter', ebestFelt: 'Braketter', type: 'tall', enhet: 'stk', heltall: true, plassering: 'standardvalg' },
  ],
};

// ---------- Lamellgardin (alltid 89 mm) ----------
const hoydeTil = (k: K): 'gulv' | 'karm' | null =>
  k.verdi('hoyde_til') === 'Til gulv' ? 'gulv' : k.verdi('hoyde_til') === 'I vinduskarm' ? 'karm' : null;
const skraa = (k: K) => String(k.verdi('skralamell') ?? 'Nei').startsWith('Ja');

export const lamellgardin: Produkt = {
  id: 'lamellgardin',
  navn: 'Lamellgardin',
  kategori: 'Interiør',
  versjon: 2,
  ebestSti: 'Interiør > Lamellgardiner > Lamell 89 mm',
  info: 'Alltid 89 mm lamell.',
  antallFelt: 'antall',
  steg: [
    valg('prisgruppe', 'Prisgruppe', v('1', '2', '3', '4')),
    antall(),
    {
      id: 'bredde', ledetekst: 'Bredde', ebestFelt: 'Bredde', type: 'maal', maaltype: 'netto',
      hjelp: 'Mål netto bredde. Appen trekker 1 cm.',
      regel: (m) => lamellBredde(m),
      varsler: (k) => over('Bredde', k.bestilt('bredde'), 700),
    },
    valg('hoyde_til', 'Høyde – til gulv eller i vinduskarm?', v('Til gulv', 'I vinduskarm'), {
      ebestFelt: undefined, hjelp: 'Til gulv: appen trekker 2 cm. I vinduskarm: appen trekker 1 cm.',
    }),
    {
      id: 'hoyde', ledetekst: 'Høyde', ebestFelt: 'Høyde', type: 'maal', maaltype: 'ikke angitt',
      hjelp: 'Til gulv −2 cm, i vinduskarm −1 cm.',
      regel: (m, k) => lamellHoyde(m, hoydeTil(k)),
      varsler: (k) => over('Høyde', k.bestilt('hoyde'), 500),
    },
    valg('profilfarge', 'Profilfarge', profilfarge3),
    {
      id: 'farge_lamell', ledetekst: 'Farge lamell', ebestFelt: 'Farge lamell', type: 'duk', gruppeLedetekst: 'Kolleksjon',
      grupper: (k) => lamellFarger[String(k.verdi('prisgruppe') ?? '')] ?? [],
    },
    valg('parkering', 'Parkering', v('Venstre', 'Høyre', 'Hver side')),
    valg('regulering', 'Regulering', v('Venstre', 'Høyre')),
    valg('betjening', 'Betjening', lamellBetjening),
    valg('feste', 'Feste', v('Vegg', 'Tak')),
    valg('underlag', 'Underlag', underlag5),

    // ---- Standardvalg ----
    valg('flerfarget', 'Flerfarget', v('Nei', 'Ja'), { plassering: 'standardvalg', standard: 'Nei' }),
    {
      id: 'flerfarget_farger', ledetekst: 'Flerfarget – farger og antall', ebestFelt: 'Flerfarget', type: 'tekst',
      plassering: 'standardvalg', vis: (k) => k.verdi('flerfarget') === 'Ja',
    },
    valg('skralamell', 'Skrålamell', v('Nei', 'Ja, fra V ► H', 'Ja, fra H ► V'), { plassering: 'standardvalg', standard: 'Nei' }),
    ...(['A', 'B', 'C', 'D'] as const).map((x) => ({
      id: `skra_${x.toLowerCase()}`, ledetekst: `Skrålamell – bruttomål ${x}`, ebestFelt: `Bruttomål ${x}`,
      type: 'maal' as const, maaltype: 'brutto' as const, plassering: 'standardvalg' as const,
      hjelp: 'Mål på skrå: ingen fratrekk.', regel: (m: number) => ingenRegel(m), vis: skraa,
    })),
    { id: 'skra_vinkel', ledetekst: 'Skrålamell – vinkel E', ebestFelt: 'Vinkel E', type: 'tall', enhet: '°', plassering: 'standardvalg', vis: skraa },
    { id: 'monteringshoyde', ledetekst: 'Monteringshøyde', ebestFelt: 'Monteringshøyde', type: 'tall', enhet: 'cm', plassering: 'standardvalg' },
  ],
};

// ---------- Rullegardin (Verano medium / large) ----------
const erLarge = (k: K) => k.verdi('modell') === 'Verano large';

export const rullegardin: Produkt = {
  id: 'rullegardin',
  navn: 'Rullegardin (Verano)',
  kategori: 'Interiør',
  versjon: 2,
  ebestSti: 'Interiør > Rullegardiner > Verano',
  antallFelt: 'antall',
  steg: [
    valg('modell', 'Modell', v('Verano medium', 'Verano large')),
    valg('prisgruppe', 'Prisgruppe', [], { valg: (k) => (erLarge(k) ? v('0', '2', '3', '5') : v('0', '1', '2', '3', '5')) }),
    antall(),
    { id: 'bredde', ledetekst: 'Bredde', ebestFelt: 'Bredde', type: 'maal', maaltype: 'ikke angitt', hjelp: 'Ingen regel ennå – målet bestilles som tastet.', regel: (m) => ingenRegel(m) },
    { id: 'hoyde', ledetekst: 'Høyde', ebestFelt: 'Høyde', type: 'maal', maaltype: 'ikke angitt', hjelp: 'Ingen regel ennå – målet bestilles som tastet.', regel: (m) => ingenRegel(m) },
    {
      id: 'duk', ledetekst: 'Duktype', ebestFelt: 'Duktype', type: 'duk', gruppeLedetekst: 'Kolleksjon',
      grupper: (k) => veranoDuker[String(k.verdi('prisgruppe') ?? '')] ?? [],
    },
    valg('kassett', 'Kassett', v('Nei', 'Rund kassett', 'Rett kassett')),
    valg('profilfarge', 'Profilfarge', v('Hvit', 'Naturell alu', 'Sort')),
    valg('betjening', 'Betjening', veranoBetjening),
    // TODO: fyll inn fra eBest – undervalget som åpnes etter valgt betjening.
    valg('betjening_undervalg', 'Betjening – undervalg', [], { valgfri: true, hjelp: 'Undervalgene er ikke lagt inn i appen ennå. Skriv selv eller hopp over.' }),
    valg('regulering', 'Regulering (sett forfra)', v('Høyre', 'Venstre'), { ebestFelt: 'Regulering' }),
    valg('feste', 'Feste', v('Vegg', 'Tak')),
    valg('underlag', 'Underlag', underlag4),

    // ---- Standardvalg (ingen standarder oppgitt – må velges) ----
    valg('styreskinne', 'Styreskinne', v('Nei', 'Ja'), { plassering: 'standardvalg' }),
    valg('styrewire', 'Styrewire', v('Nei', 'Ja'), { plassering: 'standardvalg' }),
    valg('monteringsprofil', 'Monteringsprofil', v('Nei', 'Ja'), { plassering: 'standardvalg' }),
    valg('underlist', 'Underlist', v('L1 13x29'), { plassering: 'standardvalg' }),
    { id: 'monteringshoyde', ledetekst: 'Monteringshøyde', ebestFelt: 'Monteringshøyde', type: 'tall', enhet: 'cm', plassering: 'standardvalg' },
  ],
};

// ---------- Insektsnetting ----------
const erDor = (k: K) => k.verdi('type') === 'Dør';

export const insektsnetting: Produkt = {
  id: 'insektsnetting',
  navn: 'Insektsnetting',
  kategori: 'Interiør',
  versjon: 2,
  ebestSti: 'Interiør > Annet > Innsektsnetting (Altho)',
  antallFelt: 'antall',
  steg: [
    valg('type', 'Vindu eller dør', v('Vindu', 'Dør'), { ebestFelt: 'Altho for vindu eller dør' }),
    valg('farge', 'Farge', v('Hvit', 'Sort')),
    antall(),
    {
      id: 'bredde', ledetekst: 'Bredde', ebestFelt: 'Bredde', type: 'maal', maaltype: 'ikke angitt',
      hjelp: 'Trekk 1–2 mm i bredden. Appen trekker 2 mm – kryss av for å trekke bare 1 mm.',
      avkryssinger: [{ id: 'bare1mm', tekst: 'Trekk bare 1 mm (−0,1 cm)' }],
      regel: (m, _k, a) => insektBredde(m, a('bare1mm')),
      varsler: (k) => over('Bredde', k.bestilt('bredde'), erDor(k) ? 150 : 160),
    },
    {
      id: 'hoyde', ledetekst: 'Høyde', ebestFelt: 'Høyde', type: 'maal', maaltype: 'ikke angitt',
      hjelp: 'Ingen fratrekk. Dør finnes i høyde 220 eller 250 cm.',
      regel: (m) => ingenRegel(m),
      varsler: (k) => over('Høyde', k.bestilt('hoyde'), erDor(k) ? 250 : 170),
    },
  ],
};

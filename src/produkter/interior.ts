// Interiør: Persienne 25 mm, Lamellgardin, Rullegardin (Verano M/L), Insektsnetting.
import type { K, Produkt } from '../motor/typer';
import { antall, valg } from './felles';
import { v, underlag4, underlag5 } from '../valglister/felles';
import {
  FORINGSSTAV, KJEDE, P25_STANDARD, SPESIAL_SNOR, insektModell, lamellBetjening, lamellFarger, lamellSkra,
  persienne25Betjening, persienne25Fjernkontroll, persienne25Lamellfarge, persienne25Vendestav, stavlengde,
  veranoBetjeningLarge, veranoBetjeningMedium, veranoDuker, veranoKassett, veranoProfilfarge, veranoRegulering, veranoUndervalg,
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
  versjon: 3,
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
    valg('lamellfarge', 'Lamellfarge', persienne25Lamellfarge, { hjelp: 'Spesialfarge (Spesial ►): bruk «Skriv selv».' }),
    valg('betjening', 'Betjening', persienne25Betjening, { standard: P25_STANDARD }),
    valg('betjening2', 'Vendestav / fjernkontroll', [], {
      ebestFelt: 'Betjening2',
      valg: (k) => (k.verdi('betjening') === P25_STANDARD ? persienne25Vendestav : persienne25Fjernkontroll),
    }),
    valg('regulering', 'Regulering', v('Høyre', 'Venstre')),
    valg('feste', 'Feste', v('Vegg', 'Tak')),
    valg('underlag', 'Underlag', underlag4),
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
  versjon: 3,
  ebestSti: 'Interiør > Lamellgardiner > Lamell 89 mm',
  info: 'Alltid 89 mm lamell.',
  antallFelt: 'antall',
  steg: [
    valg('prisgruppe', 'Prisgruppe', v('1', '2', '3', '4')),
    antall(),
    {
      id: 'bredde', ledetekst: 'Bredde', ebestFelt: 'Bredde', type: 'maal', maaltype: 'netto',
      hjelp: 'Mål netto bredde. Appen trekker 1 cm.',
      regel: (m, k) => (skraa(k) ? ingenRegel(m) : lamellBredde(m)),
      varsler: (k) => over('Bredde', k.bestilt('bredde'), 700),
    },
    valg('hoyde_til', 'Høyde – til gulv eller i vinduskarm?', v('Til gulv', 'I vinduskarm'), {
      ebestFelt: undefined, hjelp: 'Til gulv: appen trekker 2 cm. I vinduskarm: appen trekker 1 cm.',
    }),
    {
      id: 'hoyde', ledetekst: 'Høyde', ebestFelt: 'Høyde', type: 'maal', maaltype: 'ikke angitt',
      hjelp: 'Til gulv −2 cm, i vinduskarm −1 cm.',
      regel: (m, k) => (skraa(k) ? ingenRegel(m) : lamellHoyde(m, hoydeTil(k))),
      varsler: (k) => over('Høyde', k.bestilt('hoyde'), 500),
    },
    valg('profilfarge', 'Profilfarge', v('HVIT', 'GRÅ', 'SORT')),
    {
      id: 'farge_lamell', ledetekst: 'Farge lamell', ebestFelt: 'Farge lamell', type: 'duk', gruppeLedetekst: 'Kolleksjon',
      grupper: (k) => lamellFarger[String(k.verdi('prisgruppe') ?? '')] ?? [],
    },
    valg('parkering', 'Parkering', v('Venstre', 'Høyre', 'Hver side')),
    valg('regulering', 'Regulering', v('Venstre', 'Høyre')),
    valg('betjening', 'Betjening', [], {
      valg: (k) => (k.verdi('parkering') === 'Hver side' ? lamellBetjening.filter((x) => x.tekst !== FORINGSSTAV) : lamellBetjening),
      hjelp: 'Parkering «Hver side» gir ikke føringsstav.',
    }),
    valg('stavlengde', 'Stavlengde', stavlengde, { vis: (k) => k.verdi('betjening') === FORINGSSTAV }),
    { id: 'snorlengde', ledetekst: 'Snorlengde', ebestFelt: 'Snorlengde', type: 'tall', enhet: 'cm', vis: (k) => k.verdi('betjening') === SPESIAL_SNOR },
    valg('feste', 'Feste', v('Vegg', 'Tak')),
    valg('underlag', 'Underlag', underlag5),

    // ---- Standardvalg ----
    valg('flerfarget', 'Flerfarget', v('Nei', 'Ja ►'), { plassering: 'standardvalg', standard: 'Nei' }),
    {
      id: 'flerfarget_farger', ledetekst: 'Flerfarget – farge og antall', ebestFelt: 'FlerfargetFarge', type: 'tekst',
      plassering: 'standardvalg', vis: (k) => k.verdi('flerfarget') === 'Ja ►',
    },
    valg('skralamell', 'Skrålamell', lamellSkra, { plassering: 'standardvalg', standard: 'Nei' }),
    ...(['C', 'D'] as const).map((x) => ({
      id: `skra_${x.toLowerCase()}`, ledetekst: `Skrålamell – mål ${x}`, ebestFelt: `Skrå ${x}`,
      type: 'maal' as const, maaltype: 'brutto' as const, plassering: 'standardvalg' as const,
      hjelp: 'Mål på skrå: ingen fratrekk. A og B er bredde og høyde.', regel: (m: number) => ingenRegel(m), vis: skraa,
    })),
    { id: 'monteringshoyde', ledetekst: 'Monteringshøyde', ebestFelt: 'Monteringshøyde', type: 'tall', enhet: 'cm', plassering: 'standardvalg', standard: 210 },
  ],
};

// ---------- Rullegardin (Verano medium / large) ----------
const erLarge = (k: K) => k.verdi('modell') === 'Verano large';

export const rullegardin: Produkt = {
  id: 'rullegardin',
  navn: 'Rullegardin (Verano)',
  kategori: 'Interiør',
  versjon: 3,
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
    valg('kassett', 'Kassett', veranoKassett),
    valg('profilfarge', 'Profilfarge', veranoProfilfarge, { ebestFelt: 'Beslag' }),
    valg('betjening', 'Betjening', [], { valg: (k) => (erLarge(k) ? veranoBetjeningLarge : veranoBetjeningMedium), standard: KJEDE }),
    valg('betjening2', 'Fjernkontroll / bryter', [], {
      ebestFelt: 'Betjening2',
      valg: (k) => veranoUndervalg(String(k.verdi('betjening') ?? '')),
      vis: (k) => veranoUndervalg(String(k.verdi('betjening') ?? '')).length > 0,
    }),
    valg('regulering', 'Regulering', veranoRegulering),
    valg('feste', 'Feste', v('Vegg', 'Tak')),
    valg('underlag', 'Underlag', underlag4),

    // ---- Standardvalg (ingen standarder oppgitt – må velges) ----
    valg('styreskinne', 'Styreskinne', v('Nei', 'Ja'), { plassering: 'standardvalg' }),
    valg('styrewire', 'Styrewire', v('Nei', 'Ja'), { plassering: 'standardvalg' }),
    valg('monteringsprofil', 'Monteringsprofil', v('Nei', 'Ja'), { plassering: 'standardvalg' }),
    valg('underlist', 'Underlist', v('L1 13x29'), { plassering: 'standardvalg' }),
    { id: 'monteringshoyde', ledetekst: 'Monteringshøyde', ebestFelt: 'Monteringshøyde', type: 'tall', enhet: 'cm', plassering: 'standardvalg', standard: 210 },
  ],
};

// ---------- Insektsnetting ----------
const erDor = (k: K) => String(k.verdi('modell') ?? '').includes('Dør');

export const insektsnetting: Produkt = {
  id: 'insektsnetting',
  navn: 'Insektsnetting',
  kategori: 'Interiør',
  versjon: 3,
  ebestSti: 'Interiør > Annet > Innsektsnetting (Altho)',
  antallFelt: 'antall',
  steg: [
    valg('modell', 'Modell', insektModell, { ebestFelt: 'Artikkel' }),
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

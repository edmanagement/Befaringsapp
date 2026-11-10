// Eksteriør: Zipscreen Mini, Terrassemarkise, utvendige persienner (Scandic 80/50, Standard 50, Continent 50),
// Vindusmarkise, Fasademarkise.
import type { DukSteg, K, Produkt, Steg } from '../motor/typer';
import { antall, etasjeOgLift, valg } from './felles';
import { v, underlag4 } from '../valglister/felles';
import * as M from '../valglister/markise';
import * as P from '../valglister/persienner';
import { continent50, scandic50, scandic80, standard50 } from '../valglister/hoydetrinn';
import type { Hoydetrinn } from '../valglister/hoydetrinn';
import {
  ingenRegel, miniBredde, slutterPaaFem, utvPersienneBredde, vindusmarkiseArmRegel, vindusmarkiseBredde,
} from '../regler/regler';
import { cmTekst } from '../regler/tall';

const over = (navn: string, cm: number | null, maks: number) =>
  cm !== null && cm > maks ? [`${navn} ${cmTekst(cm)} cm er over maks (${maks} cm).`] : [];
const under = (navn: string, cm: number | null, min: number) =>
  cm !== null && cm < min ? [`${navn} ${cmTekst(cm)} cm er under min (${min} cm).`] : [];
const s = (k: K, id: string) => String(k.verdi(id) ?? '');
const heleCm = (navn: string, cm: number | null) =>
  cm !== null && !Number.isInteger(cm) ? [`${navn} ${cmTekst(cm)} cm – eBest tar hele cm.`] : [];

// ---------- Markiseduk (felles for terrasse-, vindus- og fasademarkise) ----------
const erSpesialDuk = (k: K) => k.verdi('duktype') === 'Spesial';
const markiseDukSteg = (): Steg[] => [
  valg('duktype', 'Duktype', M.duktype, { standard: 'Standard' }),
  {
    id: 'dukfarge', ledetekst: 'Dukfarge', ebestFelt: 'Dukfarge', type: 'duk',
    hjelp: 'Tast nummeret for å søke.',
    grupper: (k) => M.markiseDuker[s(k, 'duktype')] ?? [],
    vis: (k) => !erSpesialDuk(k),
  } as DukSteg,
  { id: 'spesialfarge', ledetekst: 'Spesialfarge', ebestFelt: 'Spesialfarge', type: 'tekst', vis: erSpesialDuk },
  valg('kappe', 'Kappe', M.kappe),
  valg('kantband', 'Kantbånd', v('Ja', 'Ingen')),
  valg('kantband_farge', 'Farge kantbånd', M.kantbandFarge, { vis: (k) => k.verdi('kantband') === 'Ja' }),
];

// ---------- Zipscreen Mini ----------
export const zipscreenMini: Produkt = {
  id: 'zipscreen-mini',
  navn: 'Zipscreen Mini (manuell)',
  kategori: 'Eksteriør',
  versjon: 2,
  ebestSti: 'Eksteriør > Screen > Manuell > Zipscreen Mini',
  antallFelt: 'antall',
  steg: [
    antall(),
    {
      id: 'bredde', ledetekst: 'Bredde', ebestFelt: 'Bredde', type: 'maal',
      maaltype: (a) => (a('lysaapning') ? 'lysåpning' : 'ikke angitt'),
      hjelp: 'Målt i lysåpning: appen trekker 1 cm. Maks 200 cm.',
      avkryssinger: [{ id: 'lysaapning', tekst: 'Målt i lysåpning (−1 cm)', standard: true }],
      regel: (m, _k, a) => miniBredde(m, a('lysaapning')),
      varsler: (k) => over('Bredde', k.bestilt('bredde'), 200),
    },
    {
      id: 'hoyde', ledetekst: 'Høyde', ebestFelt: 'Høyde', type: 'maal', maaltype: 'brutto',
      hjelp: 'Mål bruttohøyde. Ingen fratrekk. Maks 200 cm.', regel: (m) => ingenRegel(m),
      varsler: (k) => over('Høyde', k.bestilt('hoyde'), 200),
    },
    {
      id: 'screenduk', ledetekst: 'Screenduk (3 %)', ebestFelt: 'Screenduk', type: 'duk',
      grupper: () => [{ navn: '3 %', numre: ['19.1106', '19.1111', '19.1202', '19.1204', '19.1303', '19.1304', '19.1305'], navnIEbest: false }],
    },
    valg('kassettfarge', 'Kassettfarge', v('RAL (egen)', '9010 Hvit', 'VS905 Strukturert sort')),
    { id: 'kassettfarge_ral', ledetekst: 'RAL-nummer for kassett', ebestFelt: 'Kassettfarge (RAL)', type: 'tekst', vis: (k) => k.verdi('kassettfarge') === 'RAL (egen)' },
    valg('utbygging', 'Utbygging', v('Nei', '10 mm hylser', '15 mm hylser', '20 mm hylser')),
    {
      id: 'utbygging_eget_lager', ledetekst: 'Utbygging fra eget lager?', type: 'avkryssing', standard: false,
      hjelp: 'Ja = tas fra eget lager og skal ikke bestilles i eBest.',
      vis: (k) => k.verdi('utbygging') !== null && k.verdi('utbygging') !== 'Nei',
      merknadEksport: 'Ja betyr at utbyggingen tas fra eget lager og ikke skal bestilles.',
    },
    valg('regulering', 'Regulering', v('Snor høyre', 'Snor venstre')),
    valg('snorfarge', 'Farge på snor', v('Hvit', 'Sort', 'Grå')),
    valg('underlag', 'Underlag', v('Panel', 'Plater')),
    ...etasjeOgLift(),
    valg('feste', 'Feste', v('Vegg'), { plassering: 'standardvalg', standard: 'Vegg' }),
  ],
};

// ---------- Terrassemarkise ----------
const modell = (k: K) => s(k, 'modell');
const motorTerrasse = (k: K) => s(k, 'betjening') !== '' && s(k, 'betjening') !== 'Standard m/ sveiv';

export const terrassemarkise: Produkt = {
  id: 'terrassemarkise',
  navn: 'Terrassemarkise',
  kategori: 'Eksteriør',
  versjon: 2,
  ebestSti: 'Eksteriør > Terrassemarkiser',
  antallFelt: 'antall',
  steg: [
    valg('modell', 'Modell', v(...M.terrasseModellHurtig, ...M.terrasseModellFlere), { hurtig: M.terrasseModellHurtig }),
    valg('stativfarge', 'Stativfarge', [], {
      valg: (k) => (M.erPremium(modell(k)) ? M.stativfargePremium : M.erTrendline(modell(k)) ? M.stativfargeTrendline : []),
      hjelp: 'Verano kassettmarkiser: stativfargene er ikke lagt inn ennå – skriv selv.',
    }),
    { id: 'stativfarge_ral', ledetekst: 'RAL-nummer for stativ', ebestFelt: 'Stativfarge (RAL)', type: 'tekst', vis: (k) => k.verdi('stativfarge') === 'Valgfri RAL' },
    antall(),
    {
      id: 'bredde', ledetekst: 'Bredde', ebestFelt: 'Bredde', type: 'maal', maaltype: 'brutto',
      hjelp: 'Mål bruttobredde. Ingen fratrekk. Hele cm.', regel: (m) => ingenRegel(m),
      varsler: (k) => heleCm('Bredde', k.bestilt('bredde')),
    },
    valg('utfall', 'Utfall', M.utfall, { hjelp: 'Hvilke utfall som er mulig avhenger av bredden – eBest avgjør.' }),
    ...markiseDukSteg(),
    valg('nedfellbar_front', 'Nedfellbar front', v('Nei', 'Ja')),
    valg('front_dukfarge', 'Dukfarge front', [], {
      valg: (k) => (M.erTrendline(modell(k)) ? M.frontTrendline : M.frontPremium),
      vis: (k) => k.verdi('nedfellbar_front') === 'Ja',
    }),
    valg('betjening', 'Betjening', M.terrasseBetjening),
    valg('sveivlengde', 'Sveivlengde', M.sveivlengde, { vis: (k) => k.verdi('betjening') === 'Standard m/ sveiv' }),
    valg('fjernkontroll', 'Fjernkontroll', M.fjernkontrollIo, { vis: (k) => s(k, 'betjening').includes('Sunilus') }),
    valg('bryter', 'Bryter', M.bryterValg, { vis: (k) => s(k, 'betjening').includes('LT50') }),
    valg('stromkabel', 'Strømkabel', M.motorkabel, { vis: motorTerrasse }),
    valg('regulering', 'Regulering (side)', v('Høyre', 'Venstre')),
    valg('tak', 'Tak', v('Nei', 'Ja')),
    { id: 'tak_lengde', ledetekst: 'Tak – lengde', ebestFelt: 'Tak lengde', type: 'tall', enhet: 'cm', vis: (k) => k.verdi('tak') === 'Ja' },
    valg('tak_farge', 'Tak – farge', [], {
      valg: (k) => (M.erTrendline(modell(k)) ? M.takfargeTrendline : M.takfargePremium),
      vis: (k) => k.verdi('tak') === 'Ja',
    }),
    valg('hev_senk', 'Hev/Senk', v('Nei', 'Ja')),
    // TODO: fyll inn fra eBest – valgene for vindsikring.
    valg('vindsikring', 'Vindsikring', [], { hjelp: 'Valgene er ikke lagt inn i appen ennå – skriv selv.' }),
    { id: 'braketter', ledetekst: 'Braketter', ebestFelt: 'Braketter', type: 'tall', enhet: 'stk', heltall: true },
    valg('feste', 'Feste', [], { valg: (k) => (M.erTrendline(modell(k)) ? v('Vegg', 'Tak rett', 'Tak skrått') : v('Vegg', 'Tak')) }),
    valg('underlag', 'Underlag', underlag4),
    ...etasjeOgLift(),
  ],
};

// ---------- Utvendige persienner ----------
interface PersienneOppsett {
  id: string; navn: string; trinn: Hoydetrinn[]; minB: number; maksB: number; maksH: number; minBMotor?: number;
}

function hoydeMedTrinn(trinn: Hoydetrinn[], maksH: number): Steg {
  return {
    id: 'hoyde', ledetekst: 'Høyde', ebestFelt: 'Høyde', type: 'maal', maaltype: 'ikke angitt',
    hjelp: 'Velg høydetrinn fra eBest. Tast målt vindushøyde, så markeres nærmeste trinn over målt + dekkassehøyde. Fjern krysset hvis tillegget ikke skal med.',
    trinn: () => trinn, trinnTilleggId: 'dekkasse',
    avkryssinger: [{ id: 'dekkasse', tekst: 'Legg til dekkassehøyde fra tabellen', standard: true }],
    regel: (m) => ingenRegel(m),
    varsler: (k) => over('Høyde', k.bestilt('hoyde'), maksH),
  };
}

function breddeUtv(o: PersienneOppsett): Steg {
  return {
    id: 'bredde', ledetekst: 'Bredde', ebestFelt: 'Bredde', type: 'maal', maaltype: 'ikke angitt',
    hjelp: 'Mål vindusbredden. Appen legger til 5 cm per side (+10 cm).',
    regel: (m) => utvPersienneBredde(m),
    varsler: (k) => [
      ...over('Bredde', k.bestilt('bredde'), o.maksB),
      ...under('Bredde', k.bestilt('bredde'), o.minB),
      ...(o.minBMotor && s(k, 'betjening').startsWith('Persiennemotor') ? under('Bredde med motor', k.bestilt('bredde'), o.minBMotor) : []),
    ],
  };
}

const vannbrettSteg = (dybder: ReturnType<typeof v> | null): Steg[] => [
  valg('vannbrett', 'Vannbrett', P.vannbrett),
  dybder
    ? valg('vannbrett_dybde', 'Vannbrett – dybde (cm)', dybder, { ebestFelt: 'Vannbrett dybde', vis: (k) => !!k.verdi('vannbrett') && k.verdi('vannbrett') !== 'Ingen' })
    : {
      id: 'vannbrett_dybde', ledetekst: 'Vannbrett – dybde', ebestFelt: 'Vannbrett dybde', type: 'tall', enhet: 'cm',
      hjelp: 'eBest har trinn på 1 cm fra 0,1 til 8,9 cm.', min: 0.1, max: 8.9,
      vis: (k) => !!k.verdi('vannbrett') && k.verdi('vannbrett') !== 'Ingen',
    },
];

const betjeningScandic = (): Steg[] => [
  valg('betjening', 'Betjening', P.scandicBetjening),
  valg('linelengde', 'Lengde rundragsline (cm)', P.linelengde, { ebestFelt: 'Lengde', vis: (k) => s(k, 'betjening').startsWith('Rundragsline') }),
  valg('sveivlengde', 'Lengde sveiv (cm)', P.sveivlengde, { ebestFelt: 'Lengde', vis: (k) => s(k, 'betjening').startsWith('Sveiv') }),
  valg('bryter', 'Bryter', P.persienneBryter, { vis: (k) => P.erMotor(s(k, 'betjening')) }),
  valg('fjernkontroll', 'Fjernkontroll', P.persienneFjernkontroll, {
    vis: (k) => P.erIoMotor(s(k, 'betjening')), hjelp: 'Scroll-varianter: skriv selv.',
  }),
  valg('kabel', 'Kabel (med koblet Hirschmann)', P.ioKabel, { ebestFelt: 'Kabel', vis: (k) => P.erIoMotor(s(k, 'betjening')) }),
  valg('regulering', 'Regulering', [], {
    valg: (k) => (P.erLineEllerSveiv(s(k, 'betjening')) ? P.reguleringScandic : P.reguleringScandic.slice(0, 3)),
  }),
];

const sammenkoblingSteg = (): Steg[] => {
  const ja = (k: K) => s(k, 'sammenkobling').startsWith('Ja');
  return [
    valg('sammenkobling', 'Sammenkobling', P.sammenkobling, { plassering: 'standardvalg', standard: 'Nei, frittstående' }),
    valg('sammenkobling_type', 'Sammenkobling – rett eller ledd', P.sammenkoblingType, { plassering: 'standardvalg', vis: ja }),
    {
      id: 'sammenkobling_avstand', ledetekst: 'Sammenkobling – avstand', ebestFelt: 'Avstand', type: 'tall', enhet: 'cm',
      min: 10, max: 50, plassering: 'standardvalg', vis: ja, hjelp: 'Avstand venstre/høyre, 10–50.',
    },
  ];
};

const felles = (): Steg[] => [
  valg('feste', 'Feste', v('Vegg', 'Tak')),
  valg('underlag', 'Underlag', underlag4),
  ...etasjeOgLift(),
  { id: 'braketter', ledetekst: 'Braketter', ebestFelt: 'Braketter', type: 'tall', enhet: 'stk', heltall: true, plassering: 'standardvalg' },
];

const dekkasseJa = (k: K) => k.verdi('dekkasse') === 'Ja';
const dekkasse50Steg = (medDybde: boolean): Steg[] => [
  valg('dekkasse', 'Dekkasse', P.dekkasse50),
  valg('dekkassefarge', 'Dekkassefarge', P.dekkassefarge, { vis: dekkasseJa, hjelp: 'Spesialfarge: skriv selv.' }),
  ...(medDybde
    ? [valg('dekkasse_dybde', 'Dekkasse – dybde', P.dekkasseDybde, {
      plassering: 'standardvalg', vis: (k: K) => !!k.verdi('dekkasse') && k.verdi('dekkasse') !== 'Nei',
    })]
    : []),
];

function utvPersienne(o: PersienneOppsett, ekstra: (o: PersienneOppsett) => Steg[]): Produkt {
  return {
    id: o.id, navn: o.navn, kategori: 'Eksteriør', versjon: 2,
    ebestSti: `Eksteriør > Persienner > ${o.id === 'scandic-80' ? '80mm' : '50mm'} > ${o.navn}`,
    antallFelt: 'antall',
    steg: [antall(), breddeUtv(o), hoydeMedTrinn(o.trinn, o.maksH), ...ekstra(o)],
  };
}

export const scandic50Produkt = utvPersienne(
  { id: 'scandic-50', navn: 'Scandic 50', trinn: scandic50, minB: 30, maksB: 400, maksH: 300, minBMotor: 60 },
  () => [
    valg('lamellfarge', 'Lamellfarge', P.lamellfarge50, { hjelp: 'Spesialfarge: skriv selv.' }),
    ...dekkasse50Steg(true),
    ...vannbrettSteg(P.vannbrettDybde50),
    ...betjeningScandic(),
    ...felles(),
    ...sammenkoblingSteg(),
  ],
);

export const scandic80Produkt = utvPersienne(
  { id: 'scandic-80', navn: 'Scandic 80', trinn: scandic80, minB: 50, maksB: 500, maksH: 400, minBMotor: 60 },
  () => [
    valg('lamellfarge', 'Lamellfarge', P.lamellfarge50, { hjelp: 'Spesialfarge: skriv selv.' }),
    valg('dekkasse', 'Dekkasse', P.dekkasse80),
    valg('dekkassefarge', 'Dekkassefarge', P.dekkassefarge, { vis: (k) => s(k, 'dekkasse').startsWith('Dekkasse'), hjelp: 'Spesialfarge: skriv selv.' }),
    ...vannbrettSteg(null),
    ...betjeningScandic(),
    ...felles(),
    ...sammenkoblingSteg(),
    valg('sideskinne_venstre', 'Sideskinne venstre', P.sideskinne80, { plassering: 'standardvalg' }),
    valg('sideskinne_hoyre', 'Sideskinne høyre', P.sideskinne80, { plassering: 'standardvalg' }),
    // TODO: fyll inn fra eBest – farger for sideskinne og bein.
    {
      id: 'skinnefarge', ledetekst: 'Skinnefarge', ebestFelt: 'Skinnefarge', type: 'tekst', plassering: 'standardvalg',
      vis: (k) => [s(k, 'sideskinne_venstre'), s(k, 'sideskinne_hoyre')].some((x) => x === 'Enkel' || x === 'Dobbel'),
    },
    valg('beinlengde', 'Beinlengde', P.beinlengde80, { plassering: 'standardvalg' }),
    { id: 'beinfarge', ledetekst: 'Beinfarge', ebestFelt: 'Beinfarge', type: 'tekst', plassering: 'standardvalg', valgfri: true },
    valg('endelokk', 'Endelokk', v('Ja', 'Nei'), { plassering: 'standardvalg' }),
  ],
);

export const standard50Produkt = utvPersienne(
  { id: 'standard-50', navn: 'Standard 50', trinn: standard50, minB: 30, maksB: 400, maksH: 300 },
  () => [
    valg('lamellfarge', 'Lamellfarge', P.lamellfarge50, { hjelp: 'Spesialfarge: skriv selv.' }),
    ...dekkasse50Steg(true),
    ...vannbrettSteg(P.vannbrettDybdeStandard50),
    valg('linelengde', 'Rundragsline, lengde (cm)', P.linelengde, { ebestFelt: 'Rundragsline, lengde' }),
    valg('regulering', 'Regulering', P.reguleringStandard50),
    ...felles(),
  ],
);

// ---------- Continent 50 ----------
/** Prisliste 2026: maks 180 × 220 cm og maks 3,2 m². */
const continentAreal = (k: K): string[] => {
  const b = k.bestilt('bredde');
  const h = k.bestilt('hoyde');
  if (b === null || h === null) return [];
  const a = (b * h) / 10000;
  return a > 3.2 + 1e-9 ? [`Areal ${a.toFixed(2).replace('.', ',')} m² er over maks 3,2 m².`] : [];
};
export const continent50Produkt: Produkt = {
  id: 'continent-50',
  navn: 'Continent 50',
  kategori: 'Eksteriør',
  versjon: 2,
  ebestSti: 'Eksteriør > Persienner > 50mm > Continent 50',
  antallFelt: 'antall',
  steg: [
    antall(),
    {
      id: 'bredde', ledetekst: 'Bredde (bestillingsmål)', ebestFelt: 'Bredde', type: 'maal', maaltype: 'bestillingsmål',
      hjelp: 'Trekk 2,2–5,5 cm i bredden. Bredden skal slutte på 5 (f.eks. 119,5). Skriv bestillingsbredden. Maks 180 cm.',
      regel: (m) => ({ bestilt_cm: m, regel: 'Bestillingsmål skrevet inn (veiledning: trekk 2,2–5,5 cm, slutt på ,5)' }),
      varsler: (k) => {
        const b = k.bestilt('bredde');
        return [
          ...(b !== null && !slutterPaaFem(b) ? [`Bredden ${cmTekst(b)} slutter ikke på ,5.`] : []),
          ...over('Bredde', b, 180), ...under('Bredde', b, 30), ...continentAreal(k),
        ];
      },
    },
    { ...hoydeMedTrinn(continent50, 220), varsler: (k) => [...over('Høyde', k.bestilt('hoyde'), 220), ...continentAreal(k)] } as Steg,
    valg('lamellfarge', 'Lamellfarge', P.lamellfarge50, { hjelp: 'Spesialfarge: skriv selv.' }),
    valg('dekkasse', 'Dekkasse', v('Ja', 'Nei')),
    valg('dekkassefarge', 'Dekkassefarge', P.dekkassefarge, { vis: dekkasseJa, hjelp: 'Spesialfarge: skriv selv.' }),
    valg('sprosser', 'Sprosser', v('Ja', 'Nei')),
    valg('vendestav', 'Vendestav (cm)', P.vendestav, { ebestFelt: 'Vendestav' }),
    valg('regulering', 'Regulering', v('Høyre', 'Venstre')),
    ...felles(),
  ],
};

// ---------- Vindusmarkise ----------
const motorVindus = (k: K) => s(k, 'betjening').startsWith('Tillegg');

export const vindusmarkise: Produkt = {
  id: 'vindusmarkise',
  navn: 'Vindusmarkise',
  kategori: 'Eksteriør',
  versjon: 2,
  ebestSti: 'Eksteriør > Vindusmarkiser',
  antallFelt: 'antall',
  steg: [
    valg('stativfarge', 'Stativfarge', M.vindusStativ),
    antall(),
    {
      id: 'bredde', ledetekst: 'Bredde', ebestFelt: 'Bredde', type: 'maal', maaltype: 'ikke angitt',
      hjelp: 'Mål vindusbredden. Appen legger til 10 cm per side (+20 cm). Vannrett: 5 cm per side (+10 cm).',
      avkryssinger: [{ id: 'vannrett', tekst: 'Vannrett (+5 cm per side i stedet)' }],
      regel: (m, _k, a) => vindusmarkiseBredde(m, a('vannrett')),
      varsler: (k) => {
        const b = k.bestilt('bredde');
        return [...(b !== null && b > 200 ? ['Bredde over 200 cm: vurder motor.'] : []), ...heleCm('Bredde', b)];
      },
    },
    {
      id: 'armlengde', ledetekst: 'Armlengde', ebestFelt: 'Armlengde (artikkel)', type: 'maal', maaltype: 'ikke angitt',
      hjelp: 'Mål fra 10 cm over vinduet og ned til der markisen skal stå vannrett. Målet deles på to og rundes opp til nærmeste 10.',
      regel: (m) => vindusmarkiseArmRegel(m),
      varsler: (k) => {
        const a = k.bestilt('armlengde');
        return a !== null && (a < 50 || a > 100) ? [`Armlengde ${cmTekst(a)} cm – eBest har bare 50–100 cm.`] : [];
      },
    },
    ...markiseDukSteg(),
    valg('nisjebeslag', 'Nisjebeslag', v('Nei', 'Ja')),
    valg('nisjebeslag_dybde', 'Nisjebeslag – dybde (mm)', M.vindusNisjeDybde, { ebestFelt: 'Nisjebeslag dybde', vis: (k) => k.verdi('nisjebeslag') === 'Ja' }),
    valg('sideforskyvning', 'Sideforskyvning', v('Nei', 'Ja')),
    valg('wireboks', 'Wireboks', v('Nei', 'Ja')),
    valg('betjening', 'Betjening', M.vindusBetjening),
    valg('regulering', 'Regulering (side)', v('Høyre', 'Venstre')),
    // TODO: fyll inn fra eBest – valgene for strømkabel.
    valg('stromkabel', 'Strømkabel', [], { vis: motorVindus, hjelp: 'Valgene er ikke lagt inn i appen ennå – skriv selv.' }),
    valg('underlag', 'Underlag', underlag4),
    { id: 'braketter', ledetekst: 'Braketter', ebestFelt: 'Braketter', type: 'tall', enhet: 'stk', heltall: true },
    ...etasjeOgLift(),
    valg('montor', 'Montør', v('Ja', 'Selvmontering')),
    valg('feste', 'Feste', v('Vegg'), { plassering: 'standardvalg', standard: 'Vegg' }),
  ],
};

// ---------- Fasademarkise ----------
export const fasademarkise: Produkt = {
  id: 'fasademarkise',
  navn: 'Fasademarkise',
  kategori: 'Eksteriør',
  versjon: 2,
  ebestSti: 'Eksteriør > Fasademarkiser',
  info: 'Skal kun brukes under tak.',
  antallFelt: 'antall',
  steg: [
    valg('modell', 'Modell', M.fasadeModell, { hjelp: 'Skal kun brukes under tak.' }),
    valg('stativfarge', 'Stativfarge', [], { valg: (k) => M.fasadeStativ[s(k, 'modell')] ?? [] }),
    antall(),
    {
      id: 'bredde', ledetekst: 'Bredde', ebestFelt: 'Bredde', type: 'maal', maaltype: 'ikke angitt',
      hjelp: 'Hele cm. Ingen regel ennå – målet bestilles som tastet.', regel: (m) => ingenRegel(m),
      varsler: (k) => heleCm('Bredde', k.bestilt('bredde')),
    },
    valg('armlengde', 'Armlengde (cm)', M.armlengder, { ebestFelt: 'Armlengde (artikkel)' }),
    ...markiseDukSteg(),
    valg('innvendig_armfeste', 'Innvendig armfeste', v('Nei', 'Ja')),
    valg('nisjebeslag', 'Nisjebeslag', v('Nei', 'Ja')),
    valg('nisjebeslag_dybde', 'Nisjebeslag – dybde (cm)', M.fasadeNisjeDybde, { ebestFelt: 'Nisjebeslag dybde', vis: (k) => k.verdi('nisjebeslag') === 'Ja' }),
    valg('betjening', 'Betjening', M.fasadeBetjening),
    valg('regulering', 'Regulering (side)', v('Høyre', 'Venstre')),
    // TODO: fyll inn fra eBest – valgene for strømkabel.
    valg('stromkabel', 'Strømkabel', [], { vis: motorVindus, hjelp: 'Valgene er ikke lagt inn i appen ennå – skriv selv.' }),
    valg('underlag', 'Underlag', underlag4),
    { id: 'braketter', ledetekst: 'Braketter', ebestFelt: 'Braketter', type: 'tall', enhet: 'stk', heltall: true },
    ...etasjeOgLift(),
    valg('feste', 'Feste', v('Vegg'), { plassering: 'standardvalg', standard: 'Vegg' }),
  ],
};

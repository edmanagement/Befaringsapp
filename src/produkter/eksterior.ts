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
export const heleCm = (navn: string, cm: number | null) =>
  cm !== null && !Number.isInteger(cm) ? [`${navn} ${cmTekst(cm)} cm – eBest tar hele cm.`] : [];

// ---------- Markiseduk (felles for terrasse-, vindus- og fasademarkise) ----------
const erSpesialDuk = (k: K) => k.verdi('duktype') === 'Spesial';
export const markiseDukSteg = (): Steg[] => [
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
  versjon: 3,
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
      grupper: () => [{ navn: '3%', numre: ['19.1106', '19.1111', '19.1202', '19.1204', '19.1303', '19.1304', '19.1305'], navnIEbest: false, ebestMal: '{n}-{k}' }],
    },
    valg('kassettfarge', 'Kassettfarge', v('RAL ►', '9010 - Hvit', 'VS905 - Strukturert sort')),
    { id: 'kassettfarge_ral', ledetekst: 'RAL-nummer for kassett', ebestFelt: 'Kassettfarge (RAL)', type: 'tekst', vis: (k) => k.verdi('kassettfarge') === 'RAL ►' },
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
const motorTerrasse = (k: K) => s(k, 'betjening') !== '' && s(k, 'betjening') !== M.TERRASSE_SVEIV;
const pluss = (k: K) => M.erPremiumPluss(modell(k)) || M.erTrendline(modell(k));

export const terrassemarkise: Produkt = {
  id: 'terrassemarkise',
  navn: 'Terrassemarkise',
  kategori: 'Eksteriør',
  versjon: 3,
  ebestSti: 'Eksteriør > Terrassemarkiser',
  antallFelt: 'antall',
  steg: [
    valg('modell', 'Modell', v(...M.terrasseModellHurtig, ...M.terrasseModellFlere), { hurtig: M.terrasseModellHurtig }),
    valg('stativfarge', 'Stativfarge', [], {
      valg: (k) => (M.erPremium(modell(k)) ? M.stativfargePremium
        : modell(k) === 'Trendline cross-over' ? M.stativfargeTrendlineCross : M.stativfargeTrendline),
      hjelp: 'Kassettmarkiser (Ipanema, Santander, Palermo) ligger som eget produkt.',
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
    valg('nedfellbar_front', 'Nedfellbar', v('Nei', 'Ja'), { vis: pluss, hjelp: 'Premium har ikke nedfellbar front.' }),
    valg('front_dukfarge', 'Nedfellbar duk', [], {
      ebestFelt: 'NedfellbarDuk',
      valg: (k) => (M.erTrendline(modell(k)) ? M.frontTrendline : M.frontPremium),
      vis: (k) => pluss(k) && k.verdi('nedfellbar_front') === 'Ja',
    }),
    valg('betjening', 'Betjening', M.terrasseBetjening),
    valg('betjening2', 'Sveiv / fjernkontroll / bryter', [], {
      ebestFelt: 'Betjening2', valg: (k) => M.markiseUndervalg(s(k, 'betjening')),
    }),
    valg('stromkabel', 'Kabel', [], {
      ebestFelt: 'Kabel', vis: motorTerrasse,
      valg: (k) => (M.erTrendline(modell(k)) ? M.motorkabelTrendline : M.motorkabelPremium),
    }),
    valg('vindsikring', 'Vindsikring', [], { valg: (k) => M.vindsikring(modell(k), s(k, 'betjening')), standard: 'Nei' }),
    valg('regulering', 'Regulering (side)', v('Høyre', 'Venstre')),
    valg('tak', 'Tak', v('Nei', 'Ja'), { vis: pluss, standard: 'Nei', hjelp: 'Lengden på taket regnes ut i eBest. Taket får samme farge som markisen.' }),
    valg('tak_farge', 'Tak – farge', [], {
      ebestFelt: 'TakFarge', plassering: 'standardvalg',
      valg: (k) => (M.erTrendline(modell(k)) ? M.takfargeTrendline : M.takfargePremium),
      vis: (k) => pluss(k) && k.verdi('tak') === 'Ja',
      tving: (k) => {
        const f = M.takfargeFraStativ(s(k, 'stativfarge'));
        return f ? { verdi: f, melding: `Taket får samme farge som markisen (${f}).` } : null;
      },
    }),
    valg('hev_senk', 'Hev/Senk', v('Nei', 'Ja')),
    valg('feste', 'Feste', [], { valg: (k) => (M.erTrendline(modell(k)) ? M.festeTrendline : v('Vegg', 'Tak')) }),
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

const vannbrettSteg = (dybder: ReturnType<typeof v>, medType = true): Steg[] => [
  ...(medType ? [valg('vannbrett', 'Vannbrett', P.vannbrett)] : []),
  valg('vannbrett_dybde', 'Vannbrett – dybde', dybder, {
    ebestFelt: 'VannbrettDybde', vis: (k) => !medType || (!!k.verdi('vannbrett') && k.verdi('vannbrett') !== 'Ingen'),
  }),
];

const betjeningScandic = (): Steg[] => {
  const b = (k: K) => s(k, 'betjening');
  const erMotor = (k: K) => P.erMotor(b(k)) || P.erIoMotor(b(k));
  return [
    valg('betjening', 'Betjening', P.scandicBetjening),
    valg('betjening2', 'Lengde / bryter / fjernkontroll', [], {
      ebestFelt: 'Betjening2',
      valg: (k) => (P.erLine(b(k)) ? P.linelengde : P.erSveiv(b(k)) ? P.sveivlengde
        : P.erIoMotor(b(k)) ? P.persienneFjernkontroll : P.erMotor(b(k)) ? P.persienneBryter : []),
      vis: (k) => P.erLineEllerSveiv(b(k)) || erMotor(k),
    }),
    valg('kabel', 'Kabel', P.persienneKabel, { vis: erMotor, standard: 'Standard - 3m hvit med koblet hirschmann' }),
    valg('regulering', 'Regulering', [], {
      valg: (k) => (P.erLine(b(k)) ? P.reguleringLine : P.erSveiv(b(k)) ? P.reguleringSveiv : P.reguleringMotor),
      vis: (k) => b(k) !== 'Ingen betjening - Kobles med annen persienne',
    }),
  ];
};

const sammenkoblingSteg = (): Steg[] => {
  const k_ = (k: K) => s(k, 'sammenkobling');
  return [
    valg('sammenkobling', 'Kobles', P.kobles, { plassering: 'standardvalg', standard: 'Nei, Frittstående' }),
    valg('kobles_venstre', 'Kobles venstre – avstand', P.koblesAvstand, {
      ebestFelt: 'KoblesVenstre', plassering: 'standardvalg', vis: (k) => /Venstre|Begge/.test(k_(k)),
    }),
    valg('kobles_hoyre', 'Kobles høyre – avstand', P.koblesAvstand, {
      ebestFelt: 'KoblesHøyre', plassering: 'standardvalg', vis: (k) => /Høyre|Begge/.test(k_(k)),
    }),
  ];
};

const felles = (): Steg[] => [
  valg('feste', 'Feste', v('Vegg', 'Tak')),
  valg('underlag', 'Underlag', underlag4),
  ...etasjeOgLift(),
];

const dekkasseJa = (k: K) => k.verdi('dekkasse') === 'Ja';
const dekkasse50Steg = (): Steg[] => [
  valg('dekkasse', 'Dekkasse', P.dekkasse50),
  valg('dekkassefarge', 'Dekkassefarge', P.dekkassefarge, { vis: dekkasseJa, hjelp: 'Spesialfarge (Spesial ►): skriv selv.' }),
];

function utvPersienne(o: PersienneOppsett, ekstra: (o: PersienneOppsett) => Steg[]): Produkt {
  return {
    id: o.id, navn: o.navn, kategori: 'Eksteriør', versjon: 3,
    ebestSti: `Eksteriør > Persienner > ${o.id === 'scandic-80' ? '80mm' : '50mm'} > ${o.navn}`,
    antallFelt: 'antall',
    steg: [antall(), breddeUtv(o), hoydeMedTrinn(o.trinn, o.maksH), ...ekstra(o)],
  };
}

export const scandic50Produkt = utvPersienne(
  { id: 'scandic-50', navn: 'Scandic 50', trinn: scandic50, minB: 30, maksB: 400, maksH: 300, minBMotor: 60 },
  () => [
    valg('lamellfarge', 'Lamellfarge', P.lamellfarge50, { hjelp: 'Spesialfarge: skriv selv.' }),
    ...dekkasse50Steg(),
    ...vannbrettSteg(P.vannbrettDybde50),
    ...betjeningScandic(),
    ...felles(),
    ...sammenkoblingSteg(),
  ],
);

export const scandic80Produkt = utvPersienne(
  { id: 'scandic-80', navn: 'Scandic 80', trinn: scandic80, minB: 50, maksB: 500, maksH: 400, minBMotor: 60 },
  () => [
    valg('lamellfarge', 'Lamellfarge', P.lamellfarge80, { hjelp: 'Spesialfarge: skriv selv.' }),
    valg('dekkasse', 'Dekkasse', P.dekkasse80),
    valg('dekkassefarge', 'Dekkassefarge', P.dekkassefarge80, { vis: (k) => s(k, 'dekkasse').startsWith('Dekkasse'), hjelp: 'RAL: skriv nummeret i kommentar.' }),
    { id: 'dekkasse_lengde', ledetekst: 'Dekkasse – lengde', ebestFelt: 'DekkasseLengde', type: 'tall', enhet: 'cm', valgfri: true, vis: (k) => s(k, 'dekkasse').startsWith('Dekkasse') },
    ...vannbrettSteg(P.vannbrettDybde80),
    ...betjeningScandic(),
    ...felles(),
    ...sammenkoblingSteg(),
    valg('sideskinne_venstre', 'Sideskinne venstre', P.sideskinne80, { plassering: 'standardvalg' }),
    valg('sideskinne_hoyre', 'Sideskinne høyre', P.sideskinne80, { plassering: 'standardvalg' }),
    valg('skinnefarge', 'Skinnefarge', [], {
      plassering: 'standardvalg', valg: (k) => P.skinnefarge80(s(k, 'lamellfarge')),
      standard: (k) => P.skinnefarge80(s(k, 'lamellfarge'))[0]?.tekst,
      vis: (k) => [s(k, 'sideskinne_venstre'), s(k, 'sideskinne_hoyre')].some((x) => x === 'Enkel' || x === 'Dobbel'),
    }),
    valg('beinlengde', 'Beinlengde', P.beinlengde80, { plassering: 'standardvalg', standard: 'Std 4,5cm' }),
    valg('ekstra_beinlengde', 'Ekstra beinlengde', P.ekstraBeinlengde, { ebestFelt: 'EkstraBeinlengde', plassering: 'standardvalg', vis: (k) => k.verdi('beinlengde') === 'Std + ►' }),
    valg('beinfarge', 'Beinfarge', [], {
      plassering: 'standardvalg', valg: (k) => P.skinnefarge80(s(k, 'lamellfarge')),
      standard: (k) => P.skinnefarge80(s(k, 'lamellfarge'))[0]?.tekst,
    }),
    valg('endelokk', 'Endelokk', v('Ja', 'Nei'), { plassering: 'standardvalg' }),
  ],
);

export const standard50Produkt = utvPersienne(
  { id: 'standard-50', navn: 'Standard 50', trinn: standard50, minB: 30, maksB: 400, maksH: 300 },
  () => [
    valg('lamellfarge', 'Lamellfarge', P.lamellfarge50, { hjelp: 'Spesialfarge: skriv selv.' }),
    ...dekkasse50Steg(),
    ...vannbrettSteg(P.vannbrettDybdeStandard50, false),
    valg('linelengde', 'Rundragsline', P.linelengdeStandard50, { ebestFelt: 'Rundragsline' }),
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
  versjon: 3,
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
    valg('sprosser', 'Dekkasse sprosser', v('Ja', 'Nei'), { ebestFelt: 'DekkasseSprosser' }),
    valg('vendestav', 'Vendestav', P.vendestav, { ebestFelt: 'Vendestav' }),
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
  versjon: 3,
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
    valg('nisjebeslag', 'Nisjebeslag', M.vindusNisje, { standard: 'Nei' }),
    valg('sideforskyvning', 'Sideforskyvning', v('Nei', 'Ja')),
    valg('wireboks', 'Wireboks', v('Nei', 'Ja')),
    valg('betjening', 'Betjening', M.vindusBetjening),
    valg('betjening2', 'Fjernkontroll / bryter', [], { ebestFelt: 'Betjening2', valg: (k) => M.markiseUndervalg(s(k, 'betjening')), vis: motorVindus }),
    valg('stromkabel', 'Kabel', [], { ebestFelt: 'Kabel', valg: (k) => M.vindusKabel(s(k, 'betjening')), vis: motorVindus }),
    valg('regulering', 'Regulering (side)', v('Høyre', 'Venstre')),
    valg('underlag', 'Underlag', underlag4),
    ...etasjeOgLift(),
    valg('montor', 'Montering', v('Ja', 'Selvmontering'), { ebestFelt: 'Montering' }),
    valg('feste', 'Feste', v('Vegg'), { plassering: 'standardvalg', standard: 'Vegg' }),
  ],
};

// ---------- Fasademarkise ----------
export const fasademarkise: Produkt = {
  id: 'fasademarkise',
  navn: 'Fasademarkise',
  kategori: 'Eksteriør',
  versjon: 3,
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
    valg('innvendig_armfeste', 'Armfeste', v('Nei', 'Ja'), { ebestFelt: 'Armfeste' }),
    valg('nisjebeslag', 'Nisjebeslag', M.fasadeNisje, { standard: 'Nei' }),
    valg('betjening', 'Betjening', M.fasadeBetjening),
    valg('betjening2', 'Sveiv / fjernkontroll / bryter', [], { ebestFelt: 'Betjening2', valg: (k) => M.markiseUndervalg(s(k, 'betjening')) }),
    valg('stromkabel', 'Kabel', M.motorkabelPremium, { ebestFelt: 'Kabel', vis: motorVindus, standard: 'Standard kabel' }),
    valg('regulering', 'Regulering (side)', v('Høyre', 'Venstre')),
    valg('underlag', 'Underlag', underlag4),
    ...etasjeOgLift(),
    valg('feste', 'Feste', v('Vegg'), { plassering: 'standardvalg', standard: 'Vegg' }),
  ],
};

// Screen – Scandic Zipscreen V550 XS/S/M/L  (eBest: Eksteriør > Screen > Motorstyrt > Verano V550…)
import type { K, Produkt } from '../motor/typer';
import { antall, etasjeOgLift, valg } from './felles';
import { v, underlag4 } from '../valglister/felles';
import {
  RAL, bryterValg, fjernkontrollImove, fjernkontrollIo, kabellengdeFor, kassettfarge,
  motorerBryter, motorerEbest, motorerImove, motorerIo, screenduk,
} from '../valglister/screen';
import {
  SCREEN_STOR_BUNNLIST_OVER_CM, screenBredde, screenHoyde, screenOverMaks, screenStorBunnlistTvunget,
  type ScreenStorrelse,
} from '../regler/regler';

const storrelse = (k: K): ScreenStorrelse | null => {
  const s = String(k.verdi('storrelse') ?? '').replace('V550 ', '');
  return (['XS', 'S', 'M', 'L'] as const).find((x) => x === s) ?? null;
};
const motor = (k: K) => String(k.verdi('motor') ?? '');
const erImove = (k: K) => motorerImove.includes(motor(k));
const overMaks = (k: K) => screenOverMaks(storrelse(k), k.bestilt('bredde'), k.bestilt('hoyde'));
const storBunnlistMelding = `Bunnlist er satt til Large fordi bredden er over ${SCREEN_STOR_BUNNLIST_OVER_CM} cm.`;
const harUtbygging = (k: K) => {
  const u = k.verdi('utbygging');
  return u !== null && u !== 'Nei';
};

export const screenV550: Produkt = {
  id: 'screen-v550',
  navn: 'Screen (Zipscreen V550)',
  kategori: 'Eksteriør',
  versjon: 2,
  ebestSti: 'Eksteriør > Screen > Motorstyrt > Verano V550',
  antallFelt: 'antall',
  steg: [
    valg('storrelse', 'Størrelse', v('V550 XS', 'V550 S', 'V550 M', 'V550 L'), {
      ebestFelt: 'Artikkel',
      standard: 'V550 S',
      hjelp: 'Maks (bredde × høyde): XS 340 × 190 · S 340 × 300 · M 400 × 350 · L 600 × 500 cm.',
      varsler: overMaks,
    }),
    antall(),
    {
      id: 'bredde',
      ledetekst: 'Bredde',
      ebestFelt: 'Bredde',
      type: 'maal',
      maaltype: 'netto',
      hjelp: 'Mål nettobredde. Kryss av for å legge til sideskinner (+8,2 cm).',
      avkryssinger: [{ id: 'sideskinner', tekst: 'Legg til sideskinner (+8,2 cm)' }],
      regel: (m, _k, a) => screenBredde(m, a('sideskinner')),
      varsler: (k) => [
        ...overMaks(k),
        ...(screenStorBunnlistTvunget(k.bestilt('bredde'))
          ? [storBunnlistMelding]
          : []),
      ],
    },
    {
      id: 'hoyde',
      ledetekst: 'Høyde',
      ebestFelt: 'Høyde',
      type: 'maal',
      maaltype: 'netto',
      hjelp: 'Mål nettohøyde. Kryss av for å legge til kassett: XS +12, S +13, M +14, L +16 cm. Stor bunnlist gir +2 cm ekstra.',
      avkryssinger: [{ id: 'kassett', tekst: 'Legg til kassett' }],
      regel: (m, k, a) => screenHoyde(m, a('kassett'), storrelse(k), k.verdi('bunnlist') === 'Large'),
      varsler: overMaks,
    },
    valg('bunnlist', 'Bunnlist', v('Small', 'Large'), {
      standard: 'Small',
      tving: (k) =>
        screenStorBunnlistTvunget(k.bestilt('bredde'))
          ? { verdi: 'Large', melding: storBunnlistMelding }
          : null,
    }),
    {
      id: 'screenduk',
      ledetekst: 'Screenduk',
      ebestFelt: 'Screenduk',
      type: 'duk',
      gruppeLedetekst: 'Åpenhet',
      grupper: () => screenduk,
    },
    valg('kassettfarge', 'Kassettfarge', kassettfarge),
    {
      id: 'kassettfarge_ral',
      ledetekst: 'RAL-nummer for kassett',
      ebestFelt: 'Kassettfarge (RAL)',
      type: 'tekst',
      vis: (k) => k.verdi('kassettfarge') === RAL,
    },
    valg('motor', 'Betjening (motor)', v(...motorerEbest, ...motorerImove), {
      ebestFelt: 'Betjening',
      standard: 'Somfy Maestria+ 50 io',
      hjelp: 'iMove solcellemotor krever rett kassett (kassett settes til Rett).',
    }),
    valg('bryter_fjernkontroll', 'Bryter / fjernkontroll', [], {
      valg: (k) =>
        erImove(k) ? fjernkontrollImove : motorerIo.includes(motor(k)) ? fjernkontrollIo : motorerBryter.includes(motor(k)) ? bryterValg : [],
    }),
    valg('regulering', 'Regulering (side)', v('Høyre', 'Venstre')),
    // Solcellemotor (imove) har ikke strømkabel – disse skjules da.
    valg('stromkabel', 'Kabel (uttak)', v('Bak', 'Over', 'På siden'), { standard: 'På siden', vis: (k) => !erImove(k) }),
    valg('kabellengde', 'Kabellengde', [], { valg: (k) => kabellengdeFor(motor(k)), vis: (k) => !erImove(k) }),
    valg('stopsel', 'Støpsel', v('Nei', 'Ja'), { vis: (k) => !erImove(k) }),
    valg('utbygging', 'Utbygging', v('Utbyggingsben', 'Hylser', 'Nei')),
    {
      id: 'utbygging_avstand',
      ledetekst: 'Utbygging – avstand',
      ebestFelt: 'Utbygging avstand',
      type: 'tall',
      enhet: 'cm',
      vis: harUtbygging,
    },
    {
      id: 'utbygging_eget_lager',
      ledetekst: 'Utbygging fra eget lager?',
      type: 'avkryssing',
      standard: false,
      hjelp: 'Ja = tas fra eget lager og skal ikke bestilles i eBest.',
      vis: harUtbygging,
      merknadEksport: 'Ja betyr at utbyggingen tas fra eget lager og ikke skal bestilles.',
    },
    valg('feste', 'Feste', v('Vegg', 'Nisje')),
    valg('underlag', 'Underlag', underlag4),
    ...etasjeOgLift(),

    // ---- Standardvalg-skjermen ----
    valg('kassett_type', 'Kassett type', v('Rett', 'Skrå'), {
      plassering: 'standardvalg',
      standard: 'Skrå',
      tving: (k) => (erImove(k) ? { verdi: 'Rett', melding: 'Kassett er satt til Rett fordi imove solcellemotor er valgt.' } : null),
    }),
    valg('sideskinner', 'Sideskinner', v('Hel', '2-delt skruer'), { plassering: 'standardvalg', standard: '2-delt skruer' }),
    valg('forboret_venstre', 'Forboret venstre', v('Ja, Vegg', 'Ja, Nisje', 'Nei'), { plassering: 'standardvalg', standard: 'Ja, Vegg' }),
    valg('forboret_hoyre', 'Forboret høyre', v('Ja, Vegg', 'Ja, Nisje', 'Nei'), { plassering: 'standardvalg', standard: 'Ja, Vegg' }),
  ],
};

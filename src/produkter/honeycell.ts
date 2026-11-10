// Honeycell / Plissé  (eBest: Interiør > Plissegardiner)
import type { K, Produkt } from '../motor/typer';
import { antall, valg } from './felles';
import { v, underlag5 } from '../valglister/felles';
import { honeycellDuker, plisseDuker, plissetyperFlere, plissetyperHurtig } from '../valglister/honeycell';
import { plissetypeGrenser, plissetypeVarsler } from '../grenser/plissetyper';
import { honeycellBredde, ingenRegel } from '../regler/regler';
import { cmTekst } from '../regler/tall';

const erHoneycell = (k: K) => k.verdi('type') === 'Honeycell';
/** Snortyper: regulering og snorlengde vises bare for P17xx. */
const erSnortype = (k: K) => /^P17/.test(String(k.verdi('plissetype') ?? ''));

/** Størrelsesgrenser for Honeycell fra eBest. */
function honeycellMaks(k: K): string[] {
  if (!erHoneycell(k)) return [];
  const ut: string[] = [];
  const b = k.bestilt('bredde');
  const h = k.bestilt('hoyde');
  const maksB = k.verdi('prisgruppe') === '5' ? 260 : 300;
  if (b !== null && b > maksB) ut.push(`Bredde ${cmTekst(b)} cm er over maks for Honeycell gr. ${k.verdi('prisgruppe')} (${maksB} cm).`);
  if (h !== null && h > 300) ut.push(`Høyde ${cmTekst(h)} cm er over maks for Honeycell (300 cm).`);
  return ut;
}

function plissetypeVarsel(k: K): string[] {
  return plissetypeVarsler(String(k.verdi('plissetype') ?? ''), erHoneycell(k), k.bestilt('bredde'), k.bestilt('hoyde'));
}

const maalVarsler = (k: K) => [...honeycellMaks(k), ...plissetypeVarsel(k)];

export const honeycell: Produkt = {
  id: 'honeycell',
  navn: 'Honeycell / Plissé',
  kategori: 'Interiør',
  versjon: 2,
  ebestSti: 'Interiør > Plissegardiner',
  antallFelt: 'antall',
  steg: [
    valg('type', 'Type', v('Honeycell', 'Plissé'), { ebestFelt: 'Type', standard: 'Honeycell' }),
    valg('prisgruppe', 'Prisgruppe', [], {
      valg: (k) => (erHoneycell(k) ? v('1', '2', '3', '4', '5') : v('E', '1', '2')),
      hjelp: 'Honeycell gr. 5 = Ivrea.',
    }),
    antall(),
    valg('plissetype', 'Plissetype', v(...plissetyperHurtig, ...plissetyperFlere), {
      hurtig: plissetyperHurtig,
      hjelp: 'eBest viser bare typene som er mulige for målene. P1740 og P1751 er skråmodeller.',
      varsler: (k) => {
        const m = plissetypeGrenser[String(k.verdi('plissetype') ?? '')]?.merknad;
        return m ? [m] : [];
      },
    }),
    {
      id: 'bredde',
      ledetekst: 'Bredde',
      ebestFelt: 'Bredde (A)',
      type: 'maal',
      maaltype: 'netto',
      hjelp: 'Mål netto bredde. Appen trekker 4 mm.',
      regel: (m) => honeycellBredde(m),
      varsler: maalVarsler,
    },
    {
      id: 'hoyde',
      ledetekst: 'Høyde',
      ebestFelt: 'Høyde (B)',
      type: 'maal',
      maaltype: 'brutto',
      hjelp: 'Mål bruttohøyde. Ingen fratrekk.',
      regel: (m) => ingenRegel(m),
      varsler: maalVarsler,
    },
    valg('skravindu', 'Skråvindu?', v('Nei', 'Ja'), {
      ebestFelt: undefined, standard: 'Nei',
      hjelp: 'Ved skråvindu: mål alle sider og bestill bruttomål. Regulering er alltid på høyeste side.',
    }),
    {
      id: 'laveste_hoyde',
      ledetekst: 'Laveste høyde',
      ebestFelt: 'Laveste høyde (D)',
      type: 'maal',
      maaltype: 'brutto',
      hjelp: 'Kun ved skråvindu. Bruttomål, ingen fratrekk.',
      regel: (m) => ingenRegel(m),
      vis: (k) => k.verdi('skravindu') === 'Ja',
    },
    {
      id: 'skra_lengde',
      ledetekst: 'Lengde skrå side (C)',
      merknadEksport: 'Ikke eget felt i eBest – legg i kommentar.',
      type: 'maal',
      maaltype: 'brutto',
      hjelp: 'Kun ved skråvindu. Mål den skrå siden øverst. Bruttomål, ingen fratrekk.',
      regel: (m) => ingenRegel(m),
      vis: (k) => k.verdi('skravindu') === 'Ja',
      varsler: (k) => {
        const c = k.bestilt('skra_lengde');
        const t = String(k.verdi('plissetype') ?? '');
        return c !== null && (t === 'P1740' || t === 'P1751') && c > 220
          ? [`${t}: skråprofil ${String(c).replace('.', ',')} cm – maks 200 cm ved 60°, 220 cm ved 30°.`] : [];
      },
    },
    valg('profilfarge', 'Profilfarge', v('HVIT', 'GRÅ', 'SORT')),
    {
      id: 'duk',
      ledetekst: 'Duktype',
      ebestFelt: 'Duktype',
      type: 'duk',
      gruppeLedetekst: 'Kolleksjon',
      grupper: (k) => {
        const gr = String(k.verdi('prisgruppe') ?? '');
        return (erHoneycell(k) ? honeycellDuker[gr] : plisseDuker[gr]) ?? [];
      },
    },
    valg('regulering', 'Regulering', v('Venstre', 'Høyre'), { vis: erSnortype }),
    valg('feste', 'Feste', v('Vegg', 'Tak', 'Glasslistbeslag')),
    valg('underlag', 'Underlag', underlag5),

    // ---- Standardvalg-skjermen ----
    valg('system', 'System', v('Benthin (Ny)', 'Blöcker'), { plassering: 'standardvalg', standard: 'Benthin (Ny)' }),
    {
      id: 'monteringshoyde',
      ledetekst: 'Monteringshøyde',
      ebestFelt: 'Monteringshøyde',
      type: 'tall',
      enhet: 'cm',
      plassering: 'standardvalg',
      standard: 210,
    },
    valg('snorlengde', 'Snorlengde', v('Standard', 'Spesial ►'), { plassering: 'standardvalg', standard: 'Standard', vis: erSnortype }),
    {
      id: 'snorlengde_cm',
      ledetekst: 'Snorlengde, egen lengde',
      ebestFelt: 'Snorlengde',
      type: 'tall',
      enhet: 'cm',
      plassering: 'standardvalg',
      vis: (k) => erSnortype(k) && k.verdi('snorlengde') === 'Spesial ►',
    },
  ],
};

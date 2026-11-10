// Honeycell / Plissé  (eBest: Interiør > Plissegardiner)
import type { K, Produkt } from '../motor/typer';
import { antall, valg } from './felles';
import { v, underlag5 } from '../valglister/felles';
import { alleHoneycellDuker, allePlisseDuker, erLystett, plissetyperFlere, plissetyperHurtig, skraTyper } from '../valglister/honeycell';
import { muligePlissetyper, plissetypeGrenser, plissetypeVarsler } from '../grenser/plissetyper';
import { honeycellBredde, ingenRegel } from '../regler/regler';
import { cmTekst } from '../regler/tall';

const erHoneycell = (k: K) => String(k.verdi('type') ?? '').endsWith('Honeycell');
const erSkra = (k: K) => String(k.verdi('type') ?? '').startsWith('Skråvindu') || k.verdi('skravindu') === 'Ja';
const alleTyper = [...plissetyperHurtig, ...plissetyperFlere, ...skraTyper.filter((t) => !plissetyperHurtig.includes(t) && !plissetyperFlere.includes(t))];
const muligeTyper = (k: K) => muligePlissetyper(alleTyper, erHoneycell(k), erSkra(k), k.bestilt('bredde'), k.bestilt('hoyde'));
const dukerFor = (k: K) => (erHoneycell(k) ? alleHoneycellDuker : allePlisseDuker);
/** Prisgruppen følger valgt duk. */
const gruppeFraDuk = (k: K): string | null => {
  const d = k.verdi('duk');
  if (!d || typeof d !== 'object') return null;
  return dukerFor(k).find((g) => g.navn === d.kolleksjon)?.prisgruppe ?? null;
};
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
  versjon: 3,
  ebestSti: 'Interiør > Plissegardiner',
  antallFelt: 'antall',
  steg: [
    valg('type', 'Type', v('Honeycell', 'Plissé'), {
      ebestFelt: 'Type', standard: 'Honeycell',
      valg: [
        { tekst: 'Honeycell' }, { tekst: 'Plissé' },
        { tekst: 'Skråvindu – Honeycell', ebest: 'Honeycell' }, { tekst: 'Skråvindu – Plissé', ebest: 'Plissé' },
      ],
      hjelp: 'Skråvindu: mål alle sider og bestill bruttomål. Regulering er alltid på høyeste side.',
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
    {
      id: 'laveste_hoyde',
      ledetekst: 'Laveste høyde',
      ebestFelt: 'Laveste høyde (D)',
      type: 'maal',
      maaltype: 'brutto',
      hjelp: 'Skråvindu. Bruttomål, ingen fratrekk.',
      regel: (m) => ingenRegel(m),
      vis: erSkra,
    },
    {
      id: 'skra_lengde',
      ledetekst: 'Lengde skrå side (C)',
      merknadEksport: 'Ikke eget felt i eBest – legg i kommentar.',
      type: 'maal',
      maaltype: 'brutto',
      hjelp: 'Skråvindu. Mål den skrå siden øverst. Bruttomål, ingen fratrekk.',
      regel: (m) => ingenRegel(m),
      vis: erSkra,
      varsler: (k) => {
        const c = k.bestilt('skra_lengde');
        return c !== null && c > 220 ? [`Skråprofil ${cmTekst(c)} cm – maks 200 cm ved 60°, 220 cm ved 30°.`] : [];
      },
    },
    valg('plissetype', 'Plissetype', [], {
      valg: (k) => v(...muligeTyper(k)),
      hurtig: [...plissetyperHurtig, ...skraTyper],
      hjelp: 'Bare typene som passer målene vises (maksmål fra prisliste 2026). eBest avgjør endelig.',
      varsler: (k) => {
        const m = plissetypeGrenser[String(k.verdi('plissetype') ?? '')]?.merknad;
        const ingen = muligeTyper(k).length === 0 ? ['Ingen plissetype passer målene – sjekk målene eller skriv selv.'] : [];
        return [...ingen, ...(m ? [m] : [])];
      },
    }),
    {
      id: 'duk',
      ledetekst: 'Duktype',
      ebestFelt: 'Duktype',
      type: 'duk',
      gruppeLedetekst: 'Kolleksjon (prisgruppe)',
      grupper: dukerFor,
      filter: { tekst: 'Bare lystette duker (BO)', test: erLystett },
    },
    valg('profilfarge', 'Profilfarge', v('HVIT', 'GRÅ', 'SORT')),
    valg('regulering', 'Regulering', v('Venstre', 'Høyre'), { vis: erSnortype }),
    valg('feste', 'Feste', v('Vegg', 'Tak', 'Glasslistbeslag')),
    valg('underlag', 'Underlag', underlag5),

    // ---- Standardvalg-skjermen ----
    antall(),
    valg('prisgruppe', 'Prisgruppe', [], {
      plassering: 'standardvalg',
      valg: (k) => (erHoneycell(k) ? v('1', '2', '3', '4', '5') : v('E', '1', '2')),
      tving: (k) => {
        const gr = gruppeFraDuk(k);
        return gr ? { verdi: gr, melding: `Prisgruppe ${gr} følger valgt duk.` } : null;
      },
      hjelp: 'Settes automatisk fra duken. Honeycell gr. 5 = Ivrea.',
    }),
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

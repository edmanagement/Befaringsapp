// Import av befaringer.json (bookede befaringer fra CRM / befaringslisten).
// Godtar en liste, eller { "befaringer": [...] }. Duplikater (samme telefon + samme dato) hoppes over.
import type { Befaring } from '../motor/typer';
import { produktinteresser } from '../valglister/felles';
import { nyId, storForbokstav } from '../tekst';

export interface ImportRad {
  navn?: string;
  telefon?: string;
  adresse?: string;
  epost?: string;
  /** «2026-11-12T14:00», «2026-11-12 14:00» eller «2026-11-12». */
  dato?: string;
  produktinteresse?: string[] | string;
  kommentar?: string;
}

export const normTelefon = (t: string) => t.replace(/\D/g, '').replace(/^(0047|47)(?=\d{8}$)/, '');
const dag = (d: string) => d.slice(0, 10);

function normDato(d: string | undefined): string {
  if (!d) return '';
  const t = d.trim().replace(' ', 'T');
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t + 'T00:00';
  const m = t.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/);
  if (m) return m[1];
  // «12.11.2026 14:00»
  const n = d.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})(?:\s+(\d{1,2})[:.](\d{2}))?/);
  if (n) return `${n[3]}-${n[2].padStart(2, '0')}-${n[1].padStart(2, '0')}T${(n[4] ?? '00').padStart(2, '0')}:${n[5] ?? '00'}`;
  return '';
}

function normInteresse(p: ImportRad['produktinteresse']): string[] {
  const liste = Array.isArray(p) ? p : typeof p === 'string' ? p.split(/[,;/]/) : [];
  return liste
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => produktinteresser.find((k) => k.toLowerCase() === x.toLowerCase()) ?? x);
}

/** Dager etter en gjennomført/slettet befaring der samme telefonnummer regnes som samme sak. */
export const SPERRE_DAGER = 30;

export function lesImport(
  tekst: string,
  eksisterende: (Pick<Befaring, 'telefon' | 'dato'> & Partial<Pick<Befaring, 'fullfort' | 'eksportert'>>)[],
  slettede: Pick<Befaring, 'telefon' | 'dato'>[] = [],
): { nye: Befaring[]; duplikater: number; ugyldige: number; avsluttet: number } {
  const data = JSON.parse(tekst);
  const rader: ImportRad[] = Array.isArray(data) ? data : Array.isArray(data?.befaringer) ? data.befaringer : [];
  if (!rader.length) throw new Error('Fant ingen befaringer i filen.');
  const nokkel = (tlf: string, dato: string) => `${normTelefon(tlf)}|${dag(dato)}`;
  const sett = new Set(eksisterende.map((b) => nokkel(b.telefon, b.dato)));
  // Gjennomførte og slettede befaringer: samme telefon sperres fram til SPERRE_DAGER etter datoen.
  const sperret = new Map<string, number>();
  const sperr = (tlf: string, dato: string) => {
    const t = normTelefon(tlf);
    if (!t) return;
    const grense = (Date.parse(dag(dato) || '9999-12-31') || 0) + SPERRE_DAGER * 864e5;
    sperret.set(t, Math.max(sperret.get(t) ?? 0, grense));
  };
  for (const b of eksisterende) if (b.fullfort || (b.eksportert ?? null) !== null) sperr(b.telefon, b.dato);
  for (const b of slettede) sperr(b.telefon, b.dato);
  const nye: Befaring[] = [];
  let duplikater = 0;
  let avsluttet = 0;
  let ugyldige = 0;
  for (const r of rader) {
    if (!r || typeof r !== 'object' || (!r.navn && !r.telefon)) { ugyldige++; continue; }
    const dato = normDato(r.dato);
    const n = nokkel(r.telefon ?? '', dato);
    const grense = sperret.get(normTelefon(r.telefon ?? ''));
    if (grense !== undefined && (Date.parse(dag(dato)) || 0) <= grense) { avsluttet++; continue; }
    if (r.telefon && sett.has(n)) { duplikater++; continue; }
    sett.add(n);
    const naa = Date.now();
    nye.push({
      id: nyId(), navn: storForbokstav(r.navn ?? ''), telefon: (r.telefon ?? '').trim(), adresse: (r.adresse ?? '').trim(),
      epost: (r.epost ?? '').trim(), dato, produktinteresse: normInteresse(r.produktinteresse),
      sluttkommentar: (r.kommentar ?? '').trim(), fullfort: false, opprettet: naa, endret: naa, eksportert: null, kilde: 'import',
    });
  }
  return { nye, duplikater, ugyldige, avsluttet };
}

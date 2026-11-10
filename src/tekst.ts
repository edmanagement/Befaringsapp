// Små tekst- og datohjelpere.

/** «ola nordmann-hansen» → «Ola Nordmann-Hansen». */
export function storForbokstav(navn: string): string {
  return navn
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('nb')
    .replace(/(^|[\s-])(\p{L})/gu, (_m, skille: string, b: string) => skille + b.toLocaleUpperCase('nb'));
}

/** «Stue vest» → «stue-vest» (filnavn). */
export function slug(t: string): string {
  return (
    t
      .toLocaleLowerCase('nb')
      .replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'a')
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'post'
  );
}

/** Filsikkert navn som beholder æøå, f.eks. mappenavn. */
export function trygtFilnavn(t: string): string {
  return t.replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, ' ').trim();
}

const dager = ['søn.', 'man.', 'tir.', 'ons.', 'tor.', 'fre.', 'lør.'];
const mnd = ['jan.', 'feb.', 'mar.', 'apr.', 'mai', 'jun.', 'jul.', 'aug.', 'sep.', 'okt.', 'nov.', 'des.'];

export function lesDato(d: string): Date | null {
  if (!d) return null;
  const x = new Date(d.length === 10 ? d + 'T00:00' : d);
  return Number.isNaN(x.getTime()) ? null : x;
}

/** «tir. 10. nov. kl. 14:30» */
export function datoTekst(d: string): string {
  const x = lesDato(d);
  if (!x) return 'Uten dato';
  const kl = d.length > 10 ? ` kl. ${String(x.getHours()).padStart(2, '0')}:${String(x.getMinutes()).padStart(2, '0')}` : '';
  return `${dager[x.getDay()]} ${x.getDate()}. ${mnd[x.getMonth()]}${kl}`;
}

/** ÅÅÅÅ-MM-DD fra lokal dato-streng, eller dagens dato. */
export function isoDag(d: string | null): string {
  const x = (d && lesDato(d)) || new Date();
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
}

export const nyId = (): string =>
  (typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2));

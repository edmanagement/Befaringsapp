// Tallhåndtering. Alt regnes internt i hele millimeter for å unngå flyttallsfeil,
// og lagres/vises som cm med én desimal.

export const tilMm = (cm: number): number => Math.round(cm * 10);
export const fraMm = (mm: number): number => mm / 10;

/** Runder til én desimal (nærmeste mm). */
export const avrund = (cm: number): number => fraMm(tilMm(cm));

/** Summerer cm-verdier uten flyttallsfeil. */
export const sum = (...cm: number[]): number => fraMm(cm.reduce((a, b) => a + tilMm(b), 0));

/** «120,4» – komma som desimaltegn, alltid én desimal. */
export function cmTekst(cm: number | null | undefined): string {
  if (cm === null || cm === undefined || Number.isNaN(cm)) return '–';
  return avrund(cm).toFixed(1).replace('.', ',');
}

/** «+8,2» / «−0,4» med ekte minustegn. */
export function endringTekst(cm: number): string {
  const r = avrund(cm);
  if (r === 0) return '±0,0';
  return (r > 0 ? '+' : '−') + Math.abs(r).toFixed(1).replace('.', ',');
}

/** Leser «120,4», «120.4», « 120 » → 120.4. Tom/ugyldig → null. */
export function lesTall(tekst: string): number | null {
  const t = tekst.trim().replace(/\s/g, '').replace(',', '.');
  if (t === '' || t === '.' || t === '-') return null;
  if (!/^-?\d*\.?\d*$/.test(t)) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

/** Leser et mål i valgt enhet og gir cm (én desimal). */
export function lesMaal(tekst: string, enhet: 'cm' | 'mm'): number | null {
  const n = lesTall(tekst);
  if (n === null) return null;
  return enhet === 'mm' ? fraMm(Math.round(n)) : avrund(n);
}

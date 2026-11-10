// Eksport av en befaring: rett til Dropbox (utpakket mappe), eller som zip (reserve).
import JSZip from 'jszip';
import { db, posterFor, status } from '../db/db';
import { bildeFilnavn, byggEksport, byggOppsummering, mappenavn } from './format';
import { DROPBOX_ROT, DropboxFeil, erTilkoblet, lastOpp, slettMappe } from './dropbox';

interface Fil { sti: string; innhold: Blob | string }

/** Alle filene i eksporten, med sti relativt til befaringsmappen. */
export async function byggFiler(befaringId: string): Promise<{ mappe: string; filer: Fil[] }> {
  const b = await db.befaringer.get(befaringId);
  if (!b) throw new Error('Fant ikke befaringen');
  const poster = await posterFor(befaringId);
  // Status slik den blir etter eksporten.
  const e = byggEksport(b, poster, status({ ...b, fullfort: true, eksportert: Date.now(), endret: 0 }, poster.length));
  const filer: Fil[] = [
    { sti: 'befaring.json', innhold: JSON.stringify(e, null, 2) },
    { sti: 'oppsummering.md', innhold: byggOppsummering(e) },
  ];
  for (let i = 0; i < poster.length; i++) {
    const p = poster[i];
    for (let j = 0; j < p.bildeIder.length; j++) {
      const bilde = await db.bilder.get(p.bildeIder[j]);
      if (bilde) filer.push({ sti: `bilder/${bildeFilnavn(i + 1, p.navn, j)}`, innhold: bilde.blob });
    }
  }
  return { mappe: mappenavn(b), filer };
}

async function merkEksportert(befaringId: string): Promise<void> {
  const naa = Date.now();
  // eksportert settes etter endret, så status blir «eksportert»
  await db.befaringer.update(befaringId, { fullfort: true, endret: naa, eksportert: naa + 1, dropboxVenter: false, dropboxFeil: undefined });
}

// ---------- Dropbox ----------

export type DropboxResultat = { ok: true; mappe: string } | { ok: false; venter: boolean; melding: string };

/** Laster opp befaringen til /Scandic Markiser/Befaringer/<mappe>/. Uten nett: settes i kø. */
export async function lagreIDropbox(befaringId: string, vedFremdrift?: (ferdig: number, totalt: number) => void): Promise<DropboxResultat> {
  await db.befaringer.update(befaringId, { fullfort: true });
  const { mappe, filer } = await byggFiler(befaringId);
  const rot = `${DROPBOX_ROT}/${mappe}`;
  try {
    if (!navigator.onLine) throw new DropboxFeil('Uten nett', 'nett');
    // Fjern gamle bilder først, så en ny eksport ikke blander inn bilder som er slettet.
    await slettMappe(`${rot}/bilder`);
    for (let i = 0; i < filer.length; i++) {
      vedFremdrift?.(i, filer.length);
      await lastOpp(`${rot}/${filer[i].sti}`, filer[i].innhold);
    }
    vedFremdrift?.(filer.length, filer.length);
    await merkEksportert(befaringId);
    return { ok: true, mappe: rot };
  } catch (e) {
    const f = e instanceof DropboxFeil ? e : new DropboxFeil((e as Error).message, 'annet');
    const venter = f.type === 'nett';
    await db.befaringer.update(befaringId, { dropboxVenter: venter, dropboxFeil: venter ? undefined : f.message });
    return { ok: false, venter, melding: f.message };
  }
}

let kjorer = false;
/** Laster opp befaringer som venter på nett. Kalles ved oppstart og når nettet kommer tilbake. */
export async function lastOppVentende(): Promise<number> {
  if (kjorer || !navigator.onLine) return 0;
  if (!(await erTilkoblet()).tilkoblet) return 0;
  kjorer = true;
  let n = 0;
  try {
    const ventende = (await db.befaringer.toArray()).filter((b) => b.dropboxVenter);
    for (const b of ventende) if ((await lagreIDropbox(b.id)).ok) n++;
  } finally {
    kjorer = false;
  }
  return n;
}

// ---------- Zip (reserve) ----------

export async function lagZip(befaringId: string): Promise<{ fil: File; navn: string }> {
  const { mappe, filer } = await byggFiler(befaringId);
  const zip = new JSZip();
  const rot = zip.folder(mappe)!;
  for (const f of filer) rot.file(f.sti, f.innhold);
  const blob = await zip.generateAsync({ type: 'blob', compression: 'STORE' });
  const navn = `${mappe}.zip`;
  return { fil: new File([blob], navn, { type: 'application/zip' }), navn };
}

/** Deler filen. Returnerer 'delt', 'lastet ned' eller 'avbrutt'. */
export async function delFil(fil: File): Promise<'delt' | 'lastet ned' | 'avbrutt'> {
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.share && nav.canShare?.({ files: [fil] })) {
    try {
      await nav.share({ files: [fil], title: fil.name });
      return 'delt';
    } catch (e) {
      if ((e as DOMException).name === 'AbortError') return 'avbrutt';
    }
  }
  const url = URL.createObjectURL(fil);
  const a = document.createElement('a');
  a.href = url;
  a.download = fil.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return 'lastet ned';
}

export async function eksporterZip(befaringId: string): Promise<'delt' | 'lastet ned' | 'avbrutt'> {
  await db.befaringer.update(befaringId, { fullfort: true });
  const { fil } = await lagZip(befaringId);
  const r = await delFil(fil);
  if (r !== 'avbrutt') await merkEksportert(befaringId);
  return r;
}

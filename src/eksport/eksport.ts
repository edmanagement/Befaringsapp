// Pakker en befaring som zip og deler den via iOS-delingsarket (eller laster ned).
import JSZip from 'jszip';
import { db, posterFor, status } from '../db/db';
import { bildeFilnavn, byggEksport, byggOppsummering, mappenavn } from './format';

export async function lagZip(befaringId: string): Promise<{ fil: File; navn: string }> {
  const b = await db.befaringer.get(befaringId);
  if (!b) throw new Error('Fant ikke befaringen');
  const poster = await posterFor(befaringId);
  // Status slik den blir etter eksporten.
  const e = byggEksport(b, poster, status({ ...b, fullfort: true, eksportert: Date.now(), endret: 0 }, poster.length));
  const mappe = mappenavn(b);
  const zip = new JSZip();
  const rot = zip.folder(mappe)!;
  rot.file('befaring.json', JSON.stringify(e, null, 2));
  rot.file('oppsummering.md', byggOppsummering(e));
  const bilder = rot.folder('bilder')!;
  for (let i = 0; i < poster.length; i++) {
    const p = poster[i];
    for (let j = 0; j < p.bildeIder.length; j++) {
      const bilde = await db.bilder.get(p.bildeIder[j]);
      if (bilde) bilder.file(bildeFilnavn(i + 1, p.navn, j), bilde.blob);
    }
  }
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
      // Andre feil: fall tilbake til nedlasting
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

export async function eksporterBefaring(befaringId: string): Promise<'delt' | 'lastet ned' | 'avbrutt'> {
  const { fil } = await lagZip(befaringId);
  const r = await delFil(fil);
  if (r !== 'avbrutt') {
    const naa = Date.now();
    // eksportert settes etter endret, så status blir «eksportert»
    await db.befaringer.update(befaringId, { fullfort: true, endret: naa, eksportert: naa + 1 });
  }
  return r;
}

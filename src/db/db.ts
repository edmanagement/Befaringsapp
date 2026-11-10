// Lokal lagring i IndexedDB (via Dexie). Alt ligger på telefonen; ingenting sendes noe sted.
import Dexie, { type Table } from 'dexie';
import type { Befaring, Bilde, Post, Status } from '../motor/typer';
import { nyId } from '../tekst';

class BefaringDb extends Dexie {
  befaringer!: Table<Befaring, string>;
  poster!: Table<Post, string>;
  bilder!: Table<Bilde, string>;
  meta!: Table<{ nokkel: string; verdi: unknown }, string>;

  constructor() {
    super('scandic-befaring');
    this.version(1).stores({
      befaringer: 'id, dato, endret',
      poster: 'id, befaringId, rekkefolge',
      bilder: 'id, postId',
      meta: 'nokkel',
    });
  }
}

export const db = new BefaringDb();

export async function lagreBefaring(b: Befaring): Promise<void> {
  await db.befaringer.put({ ...b, endret: Date.now() });
}

/** Markerer befaringen som endret (f.eks. når en post endres). */
export async function befaringEndret(id: string): Promise<void> {
  await db.befaringer.update(id, { endret: Date.now() });
}

export async function lagrePost(p: Post): Promise<void> {
  const endret = Date.now();
  await db.transaction('rw', db.poster, db.befaringer, async () => {
    await db.poster.put({ ...p, endret });
    await db.befaringer.update(p.befaringId, { endret });
  });
}

export async function slettPost(p: Post): Promise<void> {
  await db.transaction('rw', db.poster, db.bilder, db.befaringer, async () => {
    await db.bilder.where('postId').equals(p.id).delete();
    await db.poster.delete(p.id);
    await db.befaringer.update(p.befaringId, { endret: Date.now() });
  });
}

export interface SlettetBefaring { telefon: string; dato: string; navn: string }

/** Befaringer som er slettet. Huskes, så de ikke kommer tilbake ved neste import. */
export async function hentSlettede(): Promise<SlettetBefaring[]> {
  return ((await db.meta.get('slettede'))?.verdi as SlettetBefaring[]) ?? [];
}

/** Sletter befaringen med poster og bilder fra telefonen (ikke fra Dropbox). */
export async function slettBefaring(b: Befaring): Promise<void> {
  await db.transaction('rw', db.befaringer, db.poster, db.bilder, db.meta, async () => {
    const poster = await db.poster.where('befaringId').equals(b.id).toArray();
    for (const p of poster) await db.bilder.where('postId').equals(p.id).delete();
    await db.poster.where('befaringId').equals(b.id).delete();
    await db.befaringer.delete(b.id);
    if (b.telefon) {
      const liste = await hentSlettede();
      liste.push({ telefon: b.telefon, dato: b.dato, navn: b.navn });
      await db.meta.put({ nokkel: 'slettede', verdi: liste });
    }
  });
}

export async function posterFor(befaringId: string): Promise<Post[]> {
  return (await db.poster.where('befaringId').equals(befaringId).toArray()).sort((a, b) => a.rekkefolge - b.rekkefolge);
}

export function nyPost(befaringId: string, rekkefolge: number): Post {
  const naa = Date.now();
  return {
    id: nyId(), befaringId, rekkefolge, kategori: null, produktId: null, navn: '', bildeIder: [],
    bildeHoppetOver: false, svar: {}, maal: {}, kommentar: '', skjerm: 'kategori', historikk: [],
    retur: null, modus: 'ny', ferdig: false, opprettet: naa, endret: naa,
  };
}

export function status(b: Befaring, antallPoster: number): Status {
  if (b.eksportert !== null) return b.eksportert >= b.endret ? 'eksportert' : 'endret etter eksport';
  if (b.fullfort) return 'ferdig';
  return antallPoster > 0 ? 'påbegynt' : 'planlagt';
}

/** Siste skjerm jeg var på, så appen kan åpne der jeg slapp. */
export async function settSisteRute(rute: string): Promise<void> {
  await db.meta.put({ nokkel: 'sisteRute', verdi: rute });
}
export async function hentSisteRute(): Promise<string | null> {
  const r = await db.meta.get('sisteRute');
  return (r?.verdi as string) ?? null;
}

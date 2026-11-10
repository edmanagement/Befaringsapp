// Generisk skjemamotor. Leser produktdefinisjoner og et Post-objekt,
// og svarer på: hva er gjeldende verdi, hvilke skjermer skal vises, hva mangler.

import type {
  DukGruppe, DukVerdi, Hoydetrinn, K, Kilde, Maaltype, MaalSteg, MaalSvar, Post, Produkt, RegelResultat, Steg, ValgSteg, Verdi,
} from './typer';
import { avrund, cmTekst } from '../regler/tall';

/** Minste trinn som er minst målt høyde + tillegg (dekkasse for trinnet, hvis valgt). */
export function foreslaTrinn(trinn: Hoydetrinn[], maalt: number, medDekkasse: boolean): Hoydetrinn | null {
  for (const t of trinn) if (t.cm + 1e-9 >= maalt + (medDekkasse ? t.dekkasse ?? 0 : 0)) return t;
  return null;
}

export function maaltypeFor(s: MaalSteg, avkrysset: (id: string) => boolean): Maaltype {
  return typeof s.maaltype === 'function' ? s.maaltype(avkrysset) : s.maaltype;
}

export interface Gjeldende {
  verdi: Verdi;
  kilde: Kilde | null;
  /** Melding når verdien er tvunget. */
  tvungetMelding?: string;
}

export interface MaalGjeldende {
  maalt_cm: number | null;
  beregnet: RegelResultat | null;
  bestilt_cm: number | null;
  manuelt_overstyrt: boolean;
}

export function valgListe(steg: ValgSteg, k: K): string[] {
  const v = typeof steg.valg === 'function' ? steg.valg(k) : steg.valg;
  return v.map((x) => x.tekst);
}

function erDuk(v: Verdi): v is DukVerdi {
  return typeof v === 'object' && v !== null && 'kolleksjon' in v;
}

/** Lager en lesekontekst for en post. Verdiene regnes ut ved behov (med syklusvern). */
export function lagKontekst(produkt: Produkt, post: Pick<Post, 'svar' | 'maal'>): K & {
  gjeldende(id: string): Gjeldende;
  maalGjeldende(id: string): MaalGjeldende;
} {
  const stegMap = new Map(produkt.steg.map((s) => [s.id, s]));
  const cache = new Map<string, Gjeldende>();
  const underArbeid = new Set<string>();

  const k = {
    verdi: (id: string) => gjeldende(id).verdi,
    bestilt: (id: string) => maalGjeldende(id).bestilt_cm,
    beregnet: (id: string) => maalGjeldende(id).beregnet?.bestilt_cm ?? null,
    maalt: (id: string) => post.maal[id]?.maalt_cm ?? null,
    avkrysset: (maalId: string, aid: string) => avkrysset(maalId, aid),
    gjeldende: (id: string) => gjeldende(id),
    maalGjeldende: (id: string) => maalGjeldende(id),
  };

  function avkrysset(maalId: string, aid: string): boolean {
    const m = post.maal[maalId];
    if (m && aid in m.avkryssinger) return m.avkryssinger[aid];
    const s = stegMap.get(maalId) as MaalSteg | undefined;
    return s?.avkryssinger?.find((a) => a.id === aid)?.standard ?? false;
  }

  function gjeldende(id: string): Gjeldende {
    const c = cache.get(id);
    if (c) return c;
    if (underArbeid.has(id)) return { verdi: null, kilde: null }; // syklus – gi opp stille
    underArbeid.add(id);
    const r = beregnGjeldende(id);
    underArbeid.delete(id);
    cache.set(id, r);
    return r;
  }

  function beregnGjeldende(id: string): Gjeldende {
    const s = stegMap.get(id);
    const svar = post.svar[id];
    if (!s) return svar ? { verdi: svar.verdi, kilde: svar.kilde } : { verdi: null, kilde: null };

    if (s.type === 'valg') {
      const t = s.tving?.(k);
      if (t) return { verdi: t.verdi, kilde: 'automatisk', tvungetMelding: t.melding };
      const lovlige = valgListe(s, k);
      if (svar && svar.kilde !== 'automatisk') {
        if (svar.kilde === 'skriv_selv' || lovlige.includes(String(svar.verdi))) return { ...svar };
      }
      const std = typeof s.standard === 'function' ? s.standard(k) : s.standard;
      if (std !== undefined && lovlige.includes(std)) return { verdi: std, kilde: 'standard' };
      return { verdi: null, kilde: null };
    }

    if (s.type === 'duk') {
      if (svar) {
        if (svar.kilde === 'skriv_selv') return { ...svar };
        const grupper = s.grupper(k);
        if (erDuk(svar.verdi) && dukGyldig(grupper, svar.verdi)) return { ...svar };
      }
      return { verdi: null, kilde: null };
    }

    if (svar) return { ...svar };
    if (s.type === 'maal') return { verdi: null, kilde: null };
    if (s.standard !== undefined) return { verdi: s.standard, kilde: 'standard' };
    return { verdi: null, kilde: null };
  }

  function maalGjeldende(id: string): MaalGjeldende {
    const s = stegMap.get(id);
    const m: MaalSvar | undefined = post.maal[id];
    const maalt = m?.maalt_cm ?? null;
    let beregnet: RegelResultat | null = null;
    if (s && s.type === 'maal' && s.trinn) {
      // Høydetrinn: forslaget er beregnet, bestillingsmålet er trinnet jeg valgte.
      if (maalt !== null) {
        const medKasse = s.trinnTilleggId ? avkrysset(id, s.trinnTilleggId) : false;
        const t = foreslaTrinn(s.trinn(k), maalt, medKasse);
        if (t) {
          beregnet = {
            bestilt_cm: t.cm,
            regel: medKasse && t.dekkasse !== undefined
              ? `Nærmeste trinn over målt ${cmTekst(maalt)} + dekkasse ${t.dekkasse} cm`
              : `Nærmeste trinn over målt ${cmTekst(maalt)}`,
          };
        }
      }
      const valgt = m?.trinn_cm ?? null;
      return { maalt_cm: maalt, beregnet, bestilt_cm: valgt, manuelt_overstyrt: false };
    }
    if (s && s.type === 'maal' && maalt !== null) {
      beregnet = s.regel(maalt, k, (aid) => avkrysset(id, aid));
    }
    const manuelt = m?.manuelt_cm ?? null;
    return {
      maalt_cm: maalt,
      beregnet,
      bestilt_cm: manuelt !== null ? avrund(manuelt) : beregnet?.bestilt_cm ?? null,
      manuelt_overstyrt: manuelt !== null,
    };
  }

  return k;
}

export function dukGyldig(grupper: DukGruppe[], v: DukVerdi): boolean {
  const g = grupper.find((x) => x.navn === v.kolleksjon);
  if (!g) return false;
  return g.numre.length === 0 ? v.nummer.trim() !== '' : g.numre.includes(v.nummer);
}

export function erSynlig(s: Steg, k: K): boolean {
  return s.vis ? s.vis(k) : true;
}

export function harVerdi(s: Steg, k: ReturnType<typeof lagKontekst>): boolean {
  if (s.type === 'maal') return k.bestilt(s.id) !== null;
  const v = k.gjeldende(s.id).verdi;
  if (v === null || v === undefined) return false;
  if (typeof v === 'string') return v.trim() !== '';
  return true;
}

/** Felt som er synlige men mangler verdi (og ikke er valgfrie). */
export function mangler(produkt: Produkt, post: Pick<Post, 'svar' | 'maal'>): Steg[] {
  const k = lagKontekst(produkt, post);
  return produkt.steg.filter((s) => erSynlig(s, k) && !s.valgfri && !harVerdi(s, k));
}

export function alleVarsler(produkt: Produkt, post: Pick<Post, 'svar' | 'maal'>): { felt: string; tekst: string }[] {
  const k = lagKontekst(produkt, post);
  const ut: { felt: string; tekst: string }[] = [];
  const sett = new Set<string>();
  for (const s of produkt.steg) {
    if (!erSynlig(s, k)) continue;
    const g = s.type === 'valg' ? k.gjeldende(s.id) : null;
    const liste = [...(s.varsler?.(k) ?? []), ...(g?.tvungetMelding ? [g.tvungetMelding] : [])];
    for (const t of liste) {
      if (sett.has(t)) continue;
      sett.add(t);
      ut.push({ felt: s.id, tekst: t });
    }
  }
  return ut;
}

/** Tekst slik den skal inn i eBest. */
export function ebestTekst(s: Steg, k: ReturnType<typeof lagKontekst>): string {
  if (s.type === 'maal') {
    const b = k.bestilt(s.id);
    return b === null ? '' : b.toFixed(1).replace('.', ',');
  }
  const v = k.gjeldende(s.id).verdi;
  if (v === null) return '';
  if (typeof v === 'boolean') return v ? 'Ja' : 'Nei';
  if (erDuk(v)) {
    const g = s.type === 'duk' ? s.grupper(k).find((x) => x.navn === v.kolleksjon) : undefined;
    return g && !g.navnIEbest ? v.nummer : `${v.kolleksjon} ${v.nummer}`.trim();
  }
  if (typeof v === 'number') return String(v).replace('.', ',');
  return v;
}

// ---------- Skjermer i en post ----------

export const FAST_FOR = ['kategori', 'produkt', 'navn', 'bilde'] as const;
export const FAST_ETTER = ['standardvalg', 'kommentar', 'ferdig'] as const;

export const feltSkjerm = (id: string) => `felt:${id}`;
export const feltFraSkjerm = (skjerm: string) => (skjerm.startsWith('felt:') ? skjerm.slice(5) : null);

/** Full rekkefølge av skjermer for produktet (før filtrering). */
export function skjermRekkefolge(produkt: Produkt | null): string[] {
  const steg = produkt ? produkt.steg.filter((s) => (s.plassering ?? 'steg') === 'steg').map((s) => feltSkjerm(s.id)) : [];
  return [...FAST_FOR, ...steg, ...FAST_ETTER];
}

/** Om en skjerm skal vises i flyten nå. */
export function skjermAktiv(skjerm: string, produkt: Produkt | null, post: Post): boolean {
  if (skjerm === 'standardvalg') {
    if (!produkt) return false;
    const k = lagKontekst(produkt, post);
    return produkt.steg.some((s) => s.plassering === 'standardvalg' && erSynlig(s, k));
  }
  const id = feltFraSkjerm(skjerm);
  if (id === null) {
    if (post.modus === 'kopi' && (skjerm === 'kategori' || skjerm === 'produkt')) return false;
    return true;
  }
  if (!produkt) return false;
  const s = produkt.steg.find((x) => x.id === id);
  if (!s) return false;
  const k = lagKontekst(produkt, post);
  if (!erSynlig(s, k)) return false;
  if (post.modus === 'kopi') {
    // Kopi: vis målene på nytt, og felt som mangler svar. Resten er beholdt.
    return s.type === 'maal' || (!s.valgfri && !harVerdi(s, k));
  }
  return true;
}

export function nesteSkjerm(naa: string, produkt: Produkt | null, post: Post): string {
  const r = skjermRekkefolge(produkt);
  let i = r.indexOf(naa);
  if (i === -1) i = r.length - 1;
  for (let j = i + 1; j < r.length; j++) if (skjermAktiv(r[j], produkt, post)) return r[j];
  return 'ferdig';
}

export function fremdrift(naa: string, produkt: Produkt | null, post: Post): { nr: number; av: number } {
  const aktive = skjermRekkefolge(produkt).filter((s) => s === naa || skjermAktiv(s, produkt, post));
  const i = aktive.indexOf(naa);
  return { nr: i === -1 ? aktive.length : i + 1, av: aktive.length };
}

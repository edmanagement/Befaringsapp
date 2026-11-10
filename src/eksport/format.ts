// Bygger befaring.json og oppsummering.md. Rene funksjoner (ingen DB), testes i tests/eksport.test.ts.
// Endrer du formatet: øk SKJEMAVERSJON og oppdater EKSPORTFORMAT.md.
import type { Befaring, Kilde, Maaltype, Post, Status, Verdi } from '../motor/typer';
import { alleVarsler, ebestTekst, erSynlig, lagKontekst, mangler } from '../motor/motor';
import { finnProdukt } from '../produkter';
import { cmTekst, endringTekst } from '../regler/tall';
import { isoDag, slug, trygtFilnavn } from '../tekst';

export const SKJEMAVERSJON = 1;

export interface FeltUt {
  id: string;
  ledetekst: string;
  ebest_felt: string | null;
  verdi: Verdi;
  ebest_tekst: string;
  kilde: Kilde | null;
  plassering: 'steg' | 'standardvalg';
  merknad?: string;
}

export interface MaalUt {
  id: string;
  ledetekst: string;
  ebest_felt: string | null;
  maalt_cm: number | null;
  maaltype: Maaltype;
  avkryssinger: { id: string; tekst: string; avkrysset: boolean }[];
  regel: string | null;
  beregnet_cm: number | null;
  bestillingsmaal_cm: number | null;
  manuelt_overstyrt: boolean;
}

export interface PostUt {
  nr: number;
  postnavn: string;
  kategori: string | null;
  produkt: { id: string | null; navn: string; skjemaversjon: number | null; ebest_sti: string | null; enkelt_skjema: boolean };
  antall: number | null;
  felt: FeltUt[];
  maal: MaalUt[];
  varsler: { felt: string; tekst: string }[];
  mangler: string[];
  kommentar: string;
  bilder: string[];
  bilde_hoppet_over: boolean;
  ferdig: boolean;
}

export interface EksportUt {
  skjemaversjon: number;
  app: string;
  eksportert: string;
  befaring: {
    id: string;
    kunde: { navn: string; telefon: string; adresse: string; epost: string };
    dato: string;
    produktinteresse: string[];
    sluttkommentar: string;
    status: Status;
    kilde: Befaring['kilde'];
  };
  poster: PostUt[];
}

/** Bildefilnavn: «01-stue-vest-1.jpg». */
export function bildeFilnavn(nr: number, postnavn: string, i: number): string {
  return `${String(nr).padStart(2, '0')}-${slug(postnavn)}-${i + 1}.jpg`;
}

export function mappenavn(b: Befaring): string {
  return trygtFilnavn(`${isoDag(b.dato)} ${b.navn || 'Uten navn'}`);
}

function lokalIso(d: Date): string {
  const off = -d.getTimezoneOffset();
  const p = (n: number) => String(Math.floor(Math.abs(n))).padStart(2, '0');
  return (
    `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}` +
    `${off >= 0 ? '+' : '-'}${p(off / 60)}:${p(off % 60)}`
  );
}

export function byggPost(p: Post, nr: number): PostUt {
  const produkt = finnProdukt(p.produktId);
  const bilder = p.bildeIder.map((_, i) => bildeFilnavn(nr, p.navn, i));
  const base = {
    nr,
    postnavn: p.navn,
    kategori: p.kategori,
    produkt: {
      id: p.produktId,
      navn: produkt?.navn ?? '(ikke valgt)',
      skjemaversjon: produkt?.versjon ?? null,
      ebest_sti: produkt?.ebestSti ?? null,
      enkelt_skjema: produkt?.enkelt ?? false,
    },
    kommentar: p.kommentar,
    bilder,
    bilde_hoppet_over: p.bildeHoppetOver,
    ferdig: p.ferdig,
  };
  if (!produkt) return { ...base, antall: null, felt: [], maal: [], varsler: [], mangler: ['produkt'] };

  const k = lagKontekst(produkt, p);
  const felt: FeltUt[] = [];
  const maal: MaalUt[] = [];
  for (const s of produkt.steg) {
    if (!erSynlig(s, k) || s.id === produkt.antallFelt) continue;
    if (s.type === 'maal') {
      const g = k.maalGjeldende(s.id);
      maal.push({
        id: s.id,
        ledetekst: s.ledetekst,
        ebest_felt: s.ebestFelt ?? null,
        maalt_cm: g.maalt_cm,
        maaltype: s.maaltype,
        avkryssinger: (s.avkryssinger ?? [])
          .filter((a) => (a.vis ? a.vis(k) : true))
          .map((a) => ({ id: a.id, tekst: a.tekst, avkrysset: k.avkrysset(s.id, a.id) })),
        regel: g.beregnet?.regel ?? null,
        beregnet_cm: g.beregnet?.bestilt_cm ?? null,
        bestillingsmaal_cm: g.bestilt_cm,
        manuelt_overstyrt: g.manuelt_overstyrt,
      });
    } else {
      const g = k.gjeldende(s.id);
      felt.push({
        id: s.id,
        ledetekst: s.ledetekst,
        ebest_felt: s.ebestFelt ?? null,
        verdi: g.verdi,
        ebest_tekst: ebestTekst(s, k),
        kilde: g.kilde,
        plassering: s.plassering ?? 'steg',
        ...(s.merknadEksport ? { merknad: s.merknadEksport } : {}),
      });
    }
  }
  const antall = k.verdi(produkt.antallFelt);
  return {
    ...base,
    antall: typeof antall === 'number' ? antall : null,
    felt,
    maal,
    varsler: alleVarsler(produkt, p),
    mangler: mangler(produkt, p).map((s) => s.id),
  };
}

export function byggEksport(b: Befaring, poster: Post[], st: Status, naa = new Date()): EksportUt {
  return {
    skjemaversjon: SKJEMAVERSJON,
    app: 'Scandic Markiser befaringsapp',
    eksportert: lokalIso(naa),
    befaring: {
      id: b.id,
      kunde: { navn: b.navn, telefon: b.telefon, adresse: b.adresse, epost: b.epost },
      dato: b.dato,
      produktinteresse: b.produktinteresse,
      sluttkommentar: b.sluttkommentar,
      status: st,
      kilde: b.kilde,
    },
    poster: poster.map((p, i) => byggPost(p, i + 1)),
  };
}

const kildeMerke = (k: Kilde | null) =>
  k === 'standard' ? ' _(standard)_' : k === 'automatisk' ? ' _(satt automatisk)_' : k === 'skriv_selv' ? ' _(skrevet selv)_' : '';

export function byggOppsummering(e: EksportUt): string {
  const b = e.befaring;
  const l: string[] = [];
  l.push(`# Befaring – ${b.kunde.navn}`, '');
  l.push(`- **Dato:** ${b.dato.replace('T', ' kl. ')}`);
  if (b.kunde.telefon) l.push(`- **Telefon:** ${b.kunde.telefon}`);
  if (b.kunde.adresse) l.push(`- **Adresse:** ${b.kunde.adresse}`);
  if (b.kunde.epost) l.push(`- **E-post:** ${b.kunde.epost}`);
  if (b.produktinteresse.length) l.push(`- **Produktinteresse:** ${b.produktinteresse.join(', ')}`);
  l.push(`- **Antall poster:** ${e.poster.length}`, '');

  for (const p of e.poster) {
    l.push(`## ${p.nr}. ${p.postnavn || '(uten navn)'} – ${p.produkt.navn}${p.antall !== null ? ` – ${p.antall} stk` : ''}`, '');
    if (p.produkt.enkelt_skjema) l.push('_Generelt skjema (produktet har ikke eget skjema ennå)._', '');
    if (!p.ferdig) l.push('**⚠ Posten er ikke fullført.**', '');
    if (p.maal.length) {
      l.push('**Mål (cm)**', '');
      for (const m of p.maal) {
        const av = m.avkryssinger.filter((a) => a.avkrysset).map((a) => a.tekst);
        const diff = m.maalt_cm !== null && m.bestillingsmaal_cm !== null ? ` (${endringTekst(m.bestillingsmaal_cm - m.maalt_cm)})` : '';
        l.push(
          `- ${m.ledetekst}: målt ${cmTekst(m.maalt_cm)} (${m.maaltype}) → **bestilles ${cmTekst(m.bestillingsmaal_cm)}**${diff}` +
            (m.manuelt_overstyrt ? ` – _manuelt overstyrt, beregnet var ${cmTekst(m.beregnet_cm)}_` : '') +
            (m.regel ? ` – regel: ${m.regel}` : '') +
            (av.length ? ` – avkrysset: ${av.join(', ')}` : ''),
        );
      }
      l.push('');
    }
    const steg = p.felt.filter((f) => f.plassering === 'steg');
    const std = p.felt.filter((f) => f.plassering === 'standardvalg');
    if (steg.length) {
      l.push('**Valg**', '');
      for (const f of steg) l.push(`- ${f.ebest_felt ?? f.ledetekst}: ${f.ebest_tekst || '–'}${kildeMerke(f.kilde)}${f.merknad ? ` (${f.merknad})` : ''}`);
      l.push('');
    }
    if (std.length) {
      l.push('**Standardvalg**', '');
      for (const f of std) l.push(`- ${f.ebest_felt ?? f.ledetekst}: ${f.ebest_tekst || '–'}${kildeMerke(f.kilde)}`);
      l.push('');
    }
    if (p.varsler.length) {
      l.push('**Varsler**', '');
      for (const v of p.varsler) l.push(`- ⚠ ${v.tekst}`);
      l.push('');
    }
    if (p.mangler.length) l.push(`**Mangler svar:** ${p.mangler.join(', ')}`, '');
    l.push(`**Kommentar:** ${p.kommentar.trim() || '–'}`, '');
    l.push(`**Bilder:** ${p.bilder.length ? p.bilder.join(', ') : p.bilde_hoppet_over ? 'hoppet over' : 'ingen'}`, '');
  }
  l.push('## Sluttkommentar', '', b.sluttkommentar.trim() || '–', '');
  return l.join('\n');
}

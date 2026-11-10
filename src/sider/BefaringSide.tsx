import { useEffect, useState } from 'react';
import type { Gaa } from '../App';
import { db, lagreBefaring, lagrePost, nyPost, posterFor, slettPost, status } from '../db/db';
import type { Befaring, Post } from '../motor/typer';
import { lagKontekst, mangler } from '../motor/motor';
import { finnProdukt } from '../produkter';
import { eksporterBefaring } from '../eksport/eksport';
import { datoTekst, nyId } from '../tekst';
import { Topp } from '../ui';

export function postTittel(p: Post): string {
  const produkt = finnProdukt(p.produktId);
  const deler = [p.navn || '(uten navn)', produkt?.navn ?? 'produkt ikke valgt'];
  if (produkt) {
    const a = lagKontekst(produkt, p).verdi(produkt.antallFelt);
    if (typeof a === 'number') deler.push(`${a} stk`);
  }
  return deler.join(' – ');
}

/** Kopi beholder alle valg, men tømmer navn, bilde, mål og kommentar. */
export function kopierPost(p: Post, rekkefolge: number): Post {
  const naa = Date.now();
  const maal: Post['maal'] = {};
  for (const [id, m] of Object.entries(p.maal)) maal[id] = { maalt_cm: null, manuelt_cm: null, avkryssinger: { ...m.avkryssinger } };
  return {
    ...structuredClone(p),
    id: nyId(), rekkefolge, navn: '', bildeIder: [], bildeHoppetOver: false, maal, kommentar: '',
    skjerm: 'navn', historikk: [], retur: null, modus: 'kopi', ferdig: false, opprettet: naa, endret: naa,
  };
}

export function BefaringSide({ gaa, id }: { gaa: Gaa; id: string }) {
  const [b, setB] = useState<Befaring | null>(null);
  const [poster, setPoster] = useState<Post[]>([]);
  const [melding, setMelding] = useState('');
  const [jobber, setJobber] = useState(false);

  async function last() {
    const x = await db.befaringer.get(id);
    if (!x) return gaa({ side: 'liste' });
    setB(x);
    setPoster(await posterFor(id));
  }
  useEffect(() => { last(); }, [id]);
  if (!b) return null;

  const neste = poster.length ? Math.max(...poster.map((p) => p.rekkefolge)) + 1 : 1;
  const st = status(b, poster.length);

  async function leggTil() {
    const p = nyPost(id, neste);
    await lagrePost(p);
    gaa({ side: 'post', id, postId: p.id });
  }
  async function kopier(p: Post) {
    const k = kopierPost(p, neste);
    await lagrePost(k);
    gaa({ side: 'post', id, postId: k.id });
  }
  async function rediger(p: Post) {
    if (p.ferdig) await lagrePost({ ...p, modus: 'rediger', skjerm: 'oversikt', historikk: [], retur: null });
    gaa({ side: 'post', id, postId: p.id });
  }
  async function slett(p: Post) {
    if (!confirm(`Slette «${postTittel(p)}»?`)) return;
    await slettPost(p);
    last();
  }
  async function eksporter() {
    const uferdige = poster.filter((p) => !p.ferdig || (finnProdukt(p.produktId) && mangler(finnProdukt(p.produktId)!, p).length));
    if (uferdige.length && !confirm(`${uferdige.length} post(er) er ikke fullført. Eksportere likevel?`)) return;
    setJobber(true);
    setMelding('');
    try {
      await lagreBefaring({ ...b!, fullfort: true });
      const r = await eksporterBefaring(id);
      setMelding(r === 'avbrutt' ? 'Eksport avbrutt.' : r === 'delt' ? 'Eksportert.' : 'Zip-filen er lastet ned.');
    } catch (e) {
      setMelding('Eksport feilet: ' + (e as Error).message);
    } finally {
      setJobber(false);
      last();
    }
  }

  return (
    <div className="side">
      <Topp tilbake={() => gaa({ side: 'liste' })} tittel={b.navn || 'Uten navn'}
        hoyre={<button className="knapp tekstknapp" onClick={() => gaa({ side: 'rediger', id })}>Endre</button>} />
      <div className="kunde">
        <div>{datoTekst(b.dato)} · <span className={`merke ${st === 'endret etter eksport' ? 'endret' : st}`}>{st}</span></div>
        {b.adresse && <div><a href={`https://maps.apple.com/?q=${encodeURIComponent(b.adresse)}`} target="_blank" rel="noreferrer">📍 {b.adresse}</a></div>}
        {b.telefon && <div><a href={`tel:${b.telefon.replace(/\s/g, '')}`}>📞 {b.telefon}</a></div>}
        {b.epost && <div><a href={`mailto:${b.epost}`}>✉︎ {b.epost}</a></div>}
        {b.produktinteresse.length > 0 && <div className="liten">Interesse: {b.produktinteresse.join(', ')}</div>}
      </div>

      <h3>Poster ({poster.length})</h3>
      {poster.map((p) => (
        <div className="postkort" key={p.id}>
          <div className="tittel">{postTittel(p)}</div>
          {!p.ferdig && <div className="feil liten">Ikke fullført – trykk «Fortsett»</div>}
          <div className="handlinger">
            <button className="knapp lav" onClick={() => rediger(p)}>{p.ferdig ? 'Rediger' : 'Fortsett'}</button>
            <button className="knapp lav" onClick={() => kopier(p)} disabled={!p.produktId}>Kopier</button>
            <button className="knapp lav fare" onClick={() => slett(p)}>Slett</button>
          </div>
        </div>
      ))}
      <button className="knapp hoved" onClick={leggTil}>+ Legg til post</button>

      <h3>Sluttkommentar</h3>
      <textarea className="inn" value={b.sluttkommentar} placeholder="Kommentar til hele befaringen"
        onChange={(e) => setB({ ...b, sluttkommentar: e.target.value })}
        onBlur={() => lagreBefaring(b).then(last)} />

      <div className="bunn">
        {melding && <div className="info">{melding}</div>}
        <button className="knapp hoved" onClick={eksporter} disabled={jobber || !poster.length}>
          {jobber ? 'Lager zip …' : st === 'eksportert' ? 'Eksporter på nytt' : 'Fullfør og eksporter'}
        </button>
      </div>
    </div>
  );
}

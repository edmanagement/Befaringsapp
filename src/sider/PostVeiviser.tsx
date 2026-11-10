// Registrering av én post, ett spørsmål per skjerm. Alt lagres fortløpende.
import { useEffect, useRef, useState } from 'react';
import type { Gaa } from '../App';
import { db, lagrePost, nyPost } from '../db/db';
import type { Kategori, MaalSvar, Post, Produkt, Svar } from '../motor/typer';
import {
  alleVarsler, ebestTekst, erSynlig, feltFraSkjerm, feltSkjerm, fremdrift, harVerdi, lagKontekst, mangler, nesteSkjerm,
} from '../motor/motor';
import { finnProdukt, kategorier, produkter } from '../produkter';
import { romForslag } from '../valglister/felles';
import { komprimer } from '../eksport/bilder';
import { FeltSkjerm } from '../skjermer/FeltSkjerm';
import { cmTekst } from '../regler/tall';
import { nyId } from '../tekst';
import { kopierPost, postTittel } from './BefaringSide';
import { Varsler } from '../ui';

interface Props { gaa: Gaa; befaringId: string; postId: string }

export function PostVeiviser({ gaa, befaringId, postId }: Props) {
  const [post, setPost] = useState<Post | null>(null);
  const siste = useRef<Post | null>(null);

  useEffect(() => {
    db.poster.get(postId).then((p) => {
      if (!p) return gaa({ side: 'befaring', id: befaringId });
      siste.current = p;
      setPost(p);
    });
  }, [postId]);

  if (!post) return null;
  const produkt = finnProdukt(post.produktId);

  function oppdater(endring: (p: Post) => Post) {
    const ny = endring(siste.current!);
    siste.current = ny;
    setPost(ny);
    lagrePost(ny);
  }

  function gaaTil(skjerm: string, retur: string | null = null) {
    oppdater((p) => ({ ...p, historikk: [...p.historikk, p.skjerm], skjerm, retur }));
    window.scrollTo(0, 0);
  }

  function neste() {
    const p = siste.current!;
    if (p.retur) return gaaTil(p.retur);
    gaaTil(nesteSkjerm(p.skjerm, finnProdukt(p.produktId), p));
  }

  function tilbake() {
    const p = siste.current!;
    if (!p.historikk.length) return gaa({ side: 'befaring', id: befaringId });
    const h = [...p.historikk];
    const forrige = h.pop()!;
    oppdater((x) => ({ ...x, historikk: h, skjerm: forrige, retur: null }));
  }

  const settSvar = (id: string) => (svar: Svar | null, videre: boolean) => {
    oppdater((p) => {
      const s = { ...p.svar };
      if (svar) s[id] = svar; else delete s[id];
      return { ...p, svar: s };
    });
    if (videre) neste();
  };
  const settMaal = (id: string) => (m: MaalSvar) => oppdater((p) => ({ ...p, maal: { ...p.maal, [id]: m } }));

  const skjerm = post.skjerm;
  const feltId = feltFraSkjerm(skjerm);
  const steg = feltId && produkt ? produkt.steg.find((s) => s.id === feltId) : undefined;
  const fr = fremdrift(skjerm, produkt, post);

  let innhold: JSX.Element;
  if (skjerm === 'kategori') innhold = <KategoriSkjerm post={post} velg={(kat) => { oppdater((p) => (p.kategori === kat ? p : { ...p, kategori: kat, produktId: null, svar: {}, maal: {} })); neste(); }} neste={neste} />;
  else if (skjerm === 'produkt') innhold = (
    <ProduktSkjerm post={post} neste={neste} velg={(pr) => {
      oppdater((p) => (p.produktId === pr.id ? p : { ...p, produktId: pr.id, svar: {}, maal: {} }));
      neste();
    }} />
  );
  else if (skjerm === 'navn') innhold = <NavnSkjerm post={post} lagre={(navn) => { oppdater((p) => ({ ...p, navn })); neste(); }} />;
  else if (skjerm === 'bilde') innhold = <BildeSkjerm post={post} oppdater={oppdater} neste={neste} />;
  else if (steg && produkt) innhold = (
    <FeltSkjerm key={steg.id} produkt={produkt} post={post} steg={steg} settSvar={settSvar(steg.id)} settMaal={settMaal(steg.id)} neste={neste} />
  );
  else if (skjerm === 'standardvalg' && produkt) innhold = (
    <ListeSkjerm tittel="Standardvalg" produkt={produkt} post={post} filter="standardvalg" gaaTil={(s) => gaaTil(s, 'standardvalg')}
      knappTekst="Godkjenn alle" vedKnapp={neste} />
  );
  else if (skjerm === 'oversikt' && produkt) innhold = (
    <ListeSkjerm tittel={postTittel(post)} produkt={produkt} post={post} filter="alle" gaaTil={(s) => gaaTil(s, 'oversikt')}
      knappTekst="Ferdig" vedKnapp={() => { oppdater((p) => ({ ...p, ferdig: mangler(produkt, p).length === 0, skjerm: 'oversikt', historikk: [] })); gaa({ side: 'befaring', id: befaringId }); }} />
  );
  else if (skjerm === 'kommentar') innhold = <KommentarSkjerm post={post} lagre={(kommentar) => { oppdater((p) => ({ ...p, kommentar })); neste(); }} />;
  else innhold = (
    <FerdigSkjerm post={post} produkt={produkt} gaaTil={(s) => gaaTil(s, 'ferdig')}
      ferdig={async (valg) => {
        const p = siste.current!;
        const ok = !!produkt && mangler(produkt, p).length === 0;
        const lagret: Post = { ...p, ferdig: ok, modus: ok ? 'rediger' : p.modus, skjerm: ok ? 'oversikt' : p.skjerm, historikk: ok ? [] : p.historikk, retur: null };
        await lagrePost(lagret);
        if (valg === 'ferdig') return gaa({ side: 'befaring', id: befaringId });
        const alle = await db.poster.where('befaringId').equals(befaringId).toArray();
        const nr = Math.max(0, ...alle.map((x) => x.rekkefolge)) + 1;
        const ny = valg === 'kopi' ? kopierPost(lagret, nr) : nyPost(befaringId, nr);
        await lagrePost(ny);
        gaa({ side: 'post', id: befaringId, postId: ny.id });
      }} />
  );

  return (
    <div className="side">
      <div className="topp">
        <button className="knapp tekstknapp" onClick={tilbake}>‹ Tilbake</button>
        <div className="fremdrift" aria-label={`Steg ${fr.nr} av ${fr.av}`}><div style={{ width: `${(fr.nr / fr.av) * 100}%` }} /></div>
        <button className="knapp tekstknapp" onClick={() => gaa({ side: 'befaring', id: befaringId })} aria-label="Lukk">✕</button>
      </div>
      {post.navn && skjerm !== 'navn' && <p className="liten" style={{ margin: '0 0 4px' }}>{post.navn}{produkt ? ` · ${produkt.navn}` : ''}</p>}
      {innhold}
    </div>
  );
}

// ---------- Faste skjermer ----------

function KategoriSkjerm({ post, velg, neste }: { post: Post; velg: (k: Kategori) => void; neste: () => void }) {
  return (
    <>
      <h2>Kategori</h2>
      <div className="valg">
        {kategorier.map((k) => (
          <button key={k} className={`knapp ${post.kategori === k ? 'valgt' : ''}`} onClick={() => velg(k)}>{k}</button>
        ))}
      </div>
      {post.kategori && <div className="bunn"><button className="knapp hoved" onClick={neste}>Neste</button></div>}
    </>
  );
}

function ProduktSkjerm({ post, velg, neste }: { post: Post; velg: (p: Produkt) => void; neste: () => void }) {
  const liste = produkter.filter((p) => p.kategori === post.kategori);
  return (
    <>
      <h2>Produkt</h2>
      <div className="valg">
        {liste.map((p) => (
          <button key={p.id} className={`knapp stablet ${post.produktId === p.id ? 'valgt' : ''}`} onClick={() => {
            if (post.produktId && post.produktId !== p.id && Object.keys(post.svar).length + Object.keys(post.maal).length > 0
              && !confirm('Bytte produkt? Valg og mål for denne posten nullstilles.')) return;
            velg(p);
          }}>
            {p.navn}
            {p.enkelt && <span className="under">enkelt skjema inntil videre</span>}
          </button>
        ))}
      </div>
      {post.produktId && <div className="bunn"><button className="knapp hoved" onClick={neste}>Neste</button></div>}
    </>
  );
}

function NavnSkjerm({ post, lagre }: { post: Post; lagre: (n: string) => void }) {
  const [t, setT] = useState(post.navn);
  return (
    <>
      <h2>Navn på post</h2>
      <input className="inn" autoFocus value={t} placeholder="F.eks. Stue vest" onChange={(e) => setT(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && t.trim() && lagre(t.trim())} aria-label="Navn på post" />
      <div className="valg to" style={{ marginTop: 12 }}>
        {romForslag.map((r) => (
          <button key={r} className={`knapp lav ${t === r ? 'valgt' : ''}`} onClick={() => setT(r)}>{r}</button>
        ))}
      </div>
      <div className="bunn">
        <button className="knapp hoved" disabled={!t.trim()} onClick={() => lagre(t.trim())}>Neste</button>
      </div>
    </>
  );
}

function BildeSkjerm({ post, oppdater, neste }: { post: Post; oppdater: (f: (p: Post) => Post) => void; neste: () => void }) {
  const [urler, setUrler] = useState<Record<string, string>>({});
  const [jobber, setJobber] = useState(false);
  const [feil, setFeil] = useState('');
  const inn = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let aktiv = true;
    const laget: string[] = [];
    (async () => {
      const u: Record<string, string> = {};
      for (const id of post.bildeIder) {
        const b = await db.bilder.get(id);
        if (b) { u[id] = URL.createObjectURL(b.blob); laget.push(u[id]); }
      }
      if (aktiv) setUrler(u);
    })();
    return () => { aktiv = false; laget.forEach(URL.revokeObjectURL); };
  }, [post.bildeIder.join(',')]);

  async function leggTil(filer: FileList | null) {
    if (!filer?.length) return;
    setJobber(true);
    setFeil('');
    try {
      const nye: string[] = [];
      for (const f of Array.from(filer)) {
        const { blob, bredde, hoyde } = await komprimer(f);
        const id = nyId();
        await db.bilder.put({ id, postId: post.id, blob, bredde, hoyde, opprettet: Date.now() });
        nye.push(id);
      }
      oppdater((p) => ({ ...p, bildeIder: [...p.bildeIder, ...nye], bildeHoppetOver: false }));
    } catch (e) {
      setFeil('Kunne ikke lagre bildet: ' + (e as Error).message);
    } finally {
      setJobber(false);
      if (inn.current) inn.current.value = '';
    }
  }

  async function fjern(id: string) {
    await db.bilder.delete(id);
    oppdater((p) => ({ ...p, bildeIder: p.bildeIder.filter((x) => x !== id) }));
  }

  return (
    <>
      <h2>Bilde</h2>
      {post.bildeIder.length > 0 && (
        <div className="bilder">
          {post.bildeIder.map((id) => (
            <div className="b" key={id}>
              {urler[id] && <img src={urler[id]} alt="" />}
              <button onClick={() => fjern(id)} aria-label="Fjern bilde">×</button>
            </div>
          ))}
        </div>
      )}
      <input ref={inn} className="skjult" type="file" accept="image/*" capture="environment" data-testid="kamera" onChange={(e) => leggTil(e.target.files)} />
      <button className={`knapp ${post.bildeIder.length ? '' : 'hoved'}`} disabled={jobber} onClick={() => inn.current?.click()}>
        {jobber ? 'Lagrer …' : post.bildeIder.length ? '📷 Ta ett bilde til' : '📷 Ta bilde'}
      </button>
      {feil && <p className="feil">{feil}</p>}
      <div className="bunn">
        {post.bildeIder.length > 0 ? (
          <button className="knapp hoved" onClick={neste}>Neste</button>
        ) : (
          <button className="knapp" onClick={() => { oppdater((p) => ({ ...p, bildeHoppetOver: true })); neste(); }}>Hopp over bilde</button>
        )}
      </div>
    </>
  );
}

function KommentarSkjerm({ post, lagre }: { post: Post; lagre: (k: string) => void }) {
  const [t, setT] = useState(post.kommentar);
  return (
    <>
      <h2>Kommentar til posten</h2>
      <textarea className="inn" autoFocus value={t} onChange={(e) => setT(e.target.value)} placeholder="Kan stå tomt" aria-label="Kommentar" />
      <div className="bunn">
        <button className="knapp hoved" onClick={() => lagre(t)}>{t.trim() ? 'Neste' : 'Hopp over'}</button>
      </div>
    </>
  );
}

// ---------- Standardvalg / oversikt ----------

function ListeSkjerm({ tittel, produkt, post, filter, gaaTil, knappTekst, vedKnapp }: {
  tittel: string; produkt: Produkt; post: Post; filter: 'standardvalg' | 'alle';
  gaaTil: (skjerm: string) => void; knappTekst: string; vedKnapp: () => void;
}) {
  const k = lagKontekst(produkt, post);
  const steg = produkt.steg.filter((s) => erSynlig(s, k) && (filter === 'alle' || s.plassering === 'standardvalg'));
  const mangel = steg.filter((s) => !s.valgfri && !harVerdi(s, k));
  const alleMangler = filter === 'alle' ? mangler(produkt, post) : mangel;

  const vis = (s: (typeof steg)[number]) => {
    if (s.type === 'maal') {
      const g = k.maalGjeldende(s.id);
      return g.bestilt_cm === null ? '' : `${cmTekst(g.bestilt_cm)} cm`;
    }
    return ebestTekst(s, k);
  };
  return (
    <>
      <h2>{tittel}</h2>
      {filter === 'standardvalg' && <p className="liten">Trykk på en linje for å endre.</p>}
      {filter === 'alle' && (
        <>
          <button className="liste-linje" onClick={() => gaaTil('navn')}><span>Navn</span><span className="v">{post.navn}</span></button>
          <button className="liste-linje" onClick={() => gaaTil('bilde')}><span>Bilder</span><span className="v">{post.bildeIder.length || (post.bildeHoppetOver ? 'hoppet over' : '0')}</span></button>
        </>
      )}
      {steg.map((s) => {
        const g = s.type === 'maal' ? null : k.gjeldende(s.id);
        const mangl = mangel.includes(s);
        return (
          <button key={s.id} className={`liste-linje ${mangl ? 'mangler' : ''}`} onClick={() => gaaTil(feltSkjerm(s.id))}>
            <span>{s.ledetekst}</span>
            <span className="v">
              {mangl ? 'Må velges' : vis(s) || '–'}
              {g?.kilde === 'standard' && <span className="k">standard</span>}
              {g?.kilde === 'automatisk' && <span className="k">automatisk</span>}
            </span>
          </button>
        );
      })}
      {filter === 'alle' && (
        <button className="liste-linje" onClick={() => gaaTil('kommentar')}><span>Kommentar</span><span className="v">{post.kommentar || '–'}</span></button>
      )}
      <Varsler liste={steg.flatMap((s) => (s.type === 'valg' ? [k.gjeldende(s.id).tvungetMelding ?? ''] : [])).filter(Boolean)} />
      <div className="bunn">
        {alleMangler.length > 0 && <p className="feil">Mangler: {alleMangler.map((s) => s.ledetekst).join(', ')}</p>}
        <button className="knapp hoved" disabled={filter === 'standardvalg' && mangel.length > 0} onClick={vedKnapp}>{knappTekst}</button>
      </div>
    </>
  );
}

function FerdigSkjerm({ post, produkt, gaaTil, ferdig }: {
  post: Post; produkt: Produkt | null; gaaTil: (s: string) => void; ferdig: (v: 'kopi' | 'ny' | 'ferdig') => void;
}) {
  const mangel = produkt ? mangler(produkt, post) : [];
  return (
    <>
      <h2>{mangel.length ? 'Noe mangler' : 'Posten er klar'}</h2>
      <div className="info">{postTittel(post)}</div>
      {!produkt && <p className="feil">Produkt er ikke valgt.</p>}
      {mangel.length > 0 && (
        <>
          <p>Disse feltene må besvares før posten er fullført:</p>
          {mangel.map((s) => (
            <button key={s.id} className="liste-linje mangler" onClick={() => gaaTil(feltSkjerm(s.id))}>
              <span>{s.ledetekst}</span><span className="v">Svar ›</span>
            </button>
          ))}
        </>
      )}
      {produkt && <Varsler liste={alleVarsler(produkt, post).map((v) => v.tekst)} />}
      <div className="bunn">
        <button className="knapp hoved" disabled={!produkt || mangel.length > 0} onClick={() => ferdig('kopi')}>Kopier denne til nytt vindu</button>
        <button className="knapp" disabled={!produkt || mangel.length > 0} onClick={() => ferdig('ny')}>Ny post</button>
        <button className="knapp" onClick={() => ferdig('ferdig')}>{mangel.length ? 'Lagre og avslutt senere' : 'Ferdig'}</button>
      </div>
    </>
  );
}

// Én skjerm per felt. Velger riktig komponent ut fra felttypen.
import { useEffect, useMemo, useRef, useState } from 'react';
import type {
  AvkryssingSteg, DukGruppe, DukSteg, DukVerdi, MaalSteg, MaalSvar, Post, Produkt, Steg, Svar, TallSteg, TekstSteg, ValgSteg,
} from '../motor/typer';
import { lagKontekst, maaltypeFor } from '../motor/motor';
import { cmTekst, endringTekst, lesMaal, lesTall } from '../regler/tall';
import { Varsler } from '../ui';

export interface FeltProps {
  produkt: Produkt;
  post: Post;
  steg: Steg;
  /** Lagre svar. neste=true går videre til neste skjerm. */
  settSvar: (svar: Svar | null, neste: boolean) => void;
  settMaal: (m: MaalSvar) => void;
  neste: () => void;
}

export function FeltSkjerm(p: FeltProps) {
  const k = lagKontekst(p.produkt, p.post);
  const g = p.steg.type === 'valg' ? k.gjeldende(p.steg.id) : null;
  const varsler = [...(p.steg.varsler?.(k) ?? []), ...(g?.tvungetMelding ? [g.tvungetMelding] : [])];
  return (
    <>
      <h2>{p.steg.ledetekst}</h2>
      {p.steg.hjelp && <div className="info">{p.steg.hjelp}</div>}
      <Varsler liste={varsler} />
      {p.steg.type === 'valg' && <ValgFelt {...p} steg={p.steg} />}
      {p.steg.type === 'tall' && <TallFelt {...p} steg={p.steg} />}
      {p.steg.type === 'tekst' && <TekstFelt {...p} steg={p.steg} />}
      {p.steg.type === 'avkryssing' && <AvkryssingFelt {...p} steg={p.steg} />}
      {p.steg.type === 'duk' && <DukFelt {...p} steg={p.steg} />}
      {p.steg.type === 'maal' && <MaalFelt {...p} steg={p.steg} />}
    </>
  );
}

// ---------- Skriv selv ----------

function SkrivSelv({ start, vedOk, etikett = 'Skriv selv' }: { start: string; vedOk: (t: string) => void; etikett?: string }) {
  const [aapen, setAapen] = useState(start !== '');
  const [t, setT] = useState(start);
  if (!aapen)
    return <button className="knapp lav" onClick={() => setAapen(true)}>✎ {etikett}</button>;
  return (
    <div className="felt">
      <label>{etikett}</label>
      <input className="inn" autoFocus value={t} onChange={(e) => setT(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && t.trim() && vedOk(t.trim())} />
      <button className="knapp hoved" disabled={!t.trim()} onClick={() => vedOk(t.trim())}>OK</button>
    </div>
  );
}

// ---------- Valg ----------

function ValgFelt({ produkt, post, steg, settSvar, neste }: FeltProps & { steg: ValgSteg }) {
  const k = lagKontekst(produkt, post);
  const g = k.gjeldende(steg.id);
  const alle = typeof steg.valg === 'function' ? steg.valg(k) : steg.valg;
  const hurtig = steg.hurtig ? alle.filter((x) => steg.hurtig!.includes(x.tekst)) : alle;
  const flere = steg.hurtig ? alle.filter((x) => !steg.hurtig!.includes(x.tekst)) : [];
  const valgt = g.verdi === null ? null : String(g.verdi);
  const [visFlere, setVisFlere] = useState(flere.some((x) => x.tekst === valgt));
  const tvunget = g.kilde === 'automatisk';
  const kolonner = alle.every((x) => x.tekst.length <= 4) ? 'valg tre' : alle.every((x) => x.tekst.length <= 12) ? 'valg to' : 'valg';
  const skrevet = g.kilde === 'skriv_selv' ? String(g.verdi) : '';

  const knapp = (x: { tekst: string; under?: string }) => (
    <button key={x.tekst} className={`knapp ${x.under ? 'stablet' : ''} ${valgt === x.tekst ? 'valgt' : ''}`}
      disabled={tvunget && valgt !== x.tekst}
      onClick={() => settSvar({ verdi: x.tekst, kilde: 'valgt' }, true)}>
      {x.tekst}
      {x.under && <span className="under">{x.under}</span>}
    </button>
  );

  return (
    <>
      {!alle.length && !steg.hjelp && <div className="info">Ingen valg her – skriv selv.</div>}
      <div className={kolonner}>{hurtig.map(knapp)}</div>
      {flere.length > 0 && (
        <div style={{ marginTop: 10 }}>
          {!visFlere ? (
            <button className="knapp lav" onClick={() => setVisFlere(true)}>Flere ({flere.length}) ▾</button>
          ) : (
            <div className={kolonner}>{flere.map(knapp)}</div>
          )}
        </div>
      )}
      {!tvunget && steg.skrivSelv !== false && (
        <div style={{ marginTop: 10 }}>
          <SkrivSelv start={skrevet} vedOk={(t) => settSvar({ verdi: t, kilde: 'skriv_selv' }, true)} />
        </div>
      )}
      {valgt !== null && (
        <div className="bunn">
          <button className="knapp hoved" onClick={neste}>
            Neste{g.kilde === 'standard' ? ` (${valgt})` : ''}
          </button>
        </div>
      )}
      {valgt === null && steg.valgfri && (
        <div className="bunn">
          <button className="knapp" onClick={neste}>Hopp over</button>
        </div>
      )}
    </>
  );
}

// ---------- Tall ----------

function TallFelt({ produkt, post, steg, settSvar, neste }: FeltProps & { steg: TallSteg }) {
  const k = lagKontekst(produkt, post);
  const g = k.gjeldende(steg.id);
  const [t, setT] = useState(g.verdi === null ? '' : String(g.verdi).replace('.', ','));
  const n = lesTall(t);
  const gyldig = n !== null && (!steg.heltall || Number.isInteger(n)) && (steg.min === undefined || n >= steg.min) && (steg.max === undefined || n <= steg.max);
  const erStd = g.kilde === 'standard' && n === g.verdi;

  function videre() {
    if (!gyldig) return;
    if (!erStd) settSvar({ verdi: n, kilde: 'valgt' }, true);
    else neste();
  }
  return (
    <>
      <div className="maalrad">
        <input className="inn stor" autoFocus inputMode={steg.heltall ? 'numeric' : 'decimal'} pattern={steg.heltall ? '[0-9]*' : undefined}
          value={t} onChange={(e) => setT(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && videre()} aria-label={steg.ledetekst} />
        {steg.enhet && <div style={{ alignSelf: 'center', fontSize: 24, fontWeight: 700 }}>{steg.enhet}</div>}
      </div>
      {steg.enhet === 'stk' && (
        <div className="valg tre" style={{ marginTop: 10 }}>
          {[1, 2, 3, 4, 5, 6].map((x) => (
            <button key={x} className={`knapp ${n === x ? 'valgt' : ''}`} onClick={() => settSvar({ verdi: x, kilde: 'valgt' }, true)}>{x}</button>
          ))}
        </div>
      )}
      {t !== '' && !gyldig && <p className="feil">Ugyldig tall.</p>}
      <div className="bunn">
        <button className="knapp hoved" disabled={!gyldig} onClick={videre}>Neste</button>
      </div>
    </>
  );
}

// ---------- Tekst ----------

function TekstFelt({ produkt, post, steg, settSvar }: FeltProps & { steg: TekstSteg }) {
  const g = lagKontekst(produkt, post).gjeldende(steg.id);
  const [t, setT] = useState(g.verdi === null ? '' : String(g.verdi));
  const ok = steg.valgfri || t.trim() !== '';
  const videre = () => ok && settSvar(t.trim() === '' ? null : { verdi: t.trim(), kilde: 'valgt' }, true);
  return (
    <>
      <input className="inn" autoFocus value={t} onChange={(e) => setT(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && videre()} aria-label={steg.ledetekst} />
      <div className="bunn">
        <button className="knapp hoved" disabled={!ok} onClick={videre}>{t.trim() === '' && steg.valgfri ? 'Hopp over' : 'Neste'}</button>
      </div>
    </>
  );
}

// ---------- Avkryssing (Ja/Nei) ----------

function AvkryssingFelt({ produkt, post, steg, settSvar, neste }: FeltProps & { steg: AvkryssingSteg }) {
  const g = lagKontekst(produkt, post).gjeldende(steg.id);
  return (
    <>
      <div className="valg to">
        {[false, true].map((b) => (
          <button key={String(b)} className={`knapp ${g.verdi === b ? 'valgt' : ''}`} onClick={() => settSvar({ verdi: b, kilde: 'valgt' }, true)}>
            {b ? 'Ja' : 'Nei'}
          </button>
        ))}
      </div>
      {g.verdi !== null && (
        <div className="bunn">
          <button className="knapp hoved" onClick={neste}>Neste{g.kilde === 'standard' ? ` (${g.verdi ? 'Ja' : 'Nei'})` : ''}</button>
        </div>
      )}
    </>
  );
}

// ---------- Duk: kolleksjon → nummer ----------

function DukFelt({ produkt, post, steg, settSvar, neste }: FeltProps & { steg: DukSteg }) {
  const k = lagKontekst(produkt, post);
  const g = k.gjeldende(steg.id);
  const alleGrupper: DukGruppe[] = steg.grupper(k);
  const naa = g.verdi && typeof g.verdi === 'object' ? (g.verdi as DukVerdi) : null;
  const [filterPaa, setFilterPaa] = useState(() =>
    !!steg.filter && !!naa && alleGrupper.some((x) => x.navn === naa.kolleksjon && steg.filter!.test(x)));
  const grupper = steg.filter && filterPaa ? alleGrupper.filter(steg.filter.test) : alleGrupper;
  const [gruppe, setGruppe] = useState<DukGruppe | null>(
    naa ? grupper.find((x) => x.navn === naa.kolleksjon) ?? null : grupper.length === 1 ? grupper[0] : null,
  );
  const [sokGruppe, setSokGruppe] = useState('');
  const [sok, setSok] = useState('');
  const skrevet = g.kilde === 'skriv_selv' ? String(g.verdi) : '';

  const treff = useMemo(() => {
    if (!sok.trim()) return [];
    const s = sok.trim().toLowerCase();
    return grupper.flatMap((gr) => gr.numre.filter((n) => n.toLowerCase().includes(s)).map((n) => ({ gr, n })));
  }, [sok, grupper]);

  const velg = (gr: DukGruppe, n: string) => settSvar({ verdi: { kolleksjon: gr.navn, nummer: n }, kilde: 'valgt' }, true);

  if (!grupper.length)
    return (
      <>
        <div className="info">Ingen dukliste for dette valget. Velg prisgruppe først, eller skriv selv.</div>
        <SkrivSelv start={skrevet} vedOk={(t) => settSvar({ verdi: t, kilde: 'skriv_selv' }, true)} />
      </>
    );

  if (!gruppe)
    return (
      <>
        {steg.filter && (
          <button className={`sjekk ${filterPaa ? 'paa' : ''}`} aria-pressed={filterPaa} onClick={() => setFilterPaa(!filterPaa)}>
            <span className="boks">{filterPaa ? '✓' : ''}</span>{steg.filter.tekst}
          </button>
        )}
        <p className="liten">{steg.gruppeLedetekst ?? 'Kolleksjon'}</p>
        <input className="inn sok" placeholder="Søk fargenummer …" inputMode="search" value={sok} onChange={(e) => setSok(e.target.value)} />
        {treff.length > 0 && (
          <div className="valg to" style={{ marginBottom: 14 }}>
            {treff.slice(0, 30).map(({ gr, n }) => (
              <button key={gr.navn + n} className="knapp stablet" onClick={() => velg(gr, n)}>
                {n}<span className="under">{gr.navn}</span>
              </button>
            ))}
          </div>
        )}
        <div className="valg">
          {grupper.map((gr) => (
            <button key={gr.navn} className={`knapp ${naa?.kolleksjon === gr.navn ? 'valgt' : ''}`} onClick={() => { setGruppe(gr); setSok(''); }}>
              {gr.navn}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 10 }}>
          <SkrivSelv start={skrevet} vedOk={(t) => settSvar({ verdi: t, kilde: 'skriv_selv' }, true)} />
        </div>
        {naa && <div className="bunn"><button className="knapp hoved" onClick={neste}>Neste ({naa.kolleksjon} {naa.nummer})</button></div>}
      </>
    );

  return (
    <>
      {grupper.length > 1 && <button className="knapp lav" onClick={() => setGruppe(null)}>‹ {gruppe.navn} – bytt</button>}
      {grupper.length === 1 && <p className="liten">{gruppe.navn}</p>}
      {gruppe.merknad && <div className="info">{gruppe.merknad}</div>}
      <div style={{ height: 12 }} />
      {gruppe.numre.length > 30 && (
        <input className="inn sok" placeholder="Skriv fargenummer …" inputMode="search" autoFocus value={sokGruppe}
          onChange={(e) => setSokGruppe(e.target.value)} aria-label="Søk fargenummer" />
      )}
      {gruppe.numre.length > 0 ? (
        <div className={`valg ${Math.max(...gruppe.numre.map((x) => x.length)) > 6 ? 'to' : 'tre'}`}>
          {gruppe.numre.filter((n) => n.toLowerCase().replace(/\s/g, '').includes(sokGruppe.toLowerCase().replace(/\s/g, ''))).map((n) => (
            <button key={n} className={`knapp lav ${naa?.kolleksjon === gruppe.navn && naa.nummer === n ? 'valgt' : ''}`} onClick={() => velg(gruppe, n)}>{n}</button>
          ))}
        </div>
      ) : (
        <SkrivSelv etikett="Fargenummer" start={naa?.kolleksjon === gruppe.navn ? naa.nummer : ''} vedOk={(t) => velg(gruppe, t)} />
      )}
      {gruppe.numre.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <SkrivSelv etikett="Annet nummer (skriv selv)" start="" vedOk={(t) => velg({ ...gruppe, numre: [] }, t)} />
        </div>
      )}
    </>
  );
}

// ---------- Mål ----------

function MaalFelt({ produkt, post, steg, settMaal, neste }: FeltProps & { steg: MaalSteg }) {
  const k = lagKontekst(produkt, post);
  const lagret: MaalSvar = post.maal[steg.id] ?? { maalt_cm: null, avkryssinger: {}, manuelt_cm: null };
  const [enhet, setEnhet] = useState<'cm' | 'mm'>('cm');
  const [t, setT] = useState(lagret.maalt_cm === null ? '' : cmTekst(lagret.maalt_cm));
  const [overstyr, setOverstyr] = useState(lagret.manuelt_cm !== null);
  const [ot, setOt] = useState(lagret.manuelt_cm === null ? '' : cmTekst(lagret.manuelt_cm));
  const inn = useRef<HTMLInputElement>(null);
  useEffect(() => { inn.current?.focus(); }, []);

  function oppdater(d: Partial<MaalSvar>) {
    settMaal({ ...lagret, ...d });
  }
  function endreTekst(v: string) {
    setT(v);
    oppdater({ maalt_cm: lesMaal(v, enhet) });
  }
  function byttEnhet(e: 'cm' | 'mm') {
    if (e === enhet) return;
    setEnhet(e);
    const cm = lagret.maalt_cm;
    setT(cm === null ? '' : e === 'mm' ? String(Math.round(cm * 10)) : cmTekst(cm));
    inn.current?.focus();
  }

  const g = k.maalGjeldende(steg.id);
  const ok = g.bestilt_cm !== null;

  return (
    <>
      <div className="maalrad">
        <input ref={inn} className="inn stor" inputMode="decimal" value={t} placeholder="0" aria-label={`${steg.ledetekst} i ${enhet}`}
          onChange={(e) => endreTekst(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && ok && neste()} />
        <div className="enhet" role="group" aria-label="Enhet">
          <button className={enhet === 'cm' ? 'valgt' : ''} onClick={() => byttEnhet('cm')}>cm</button>
          <button className={enhet === 'mm' ? 'valgt' : ''} onClick={() => byttEnhet('mm')}>mm</button>
        </div>
      </div>
      <p className="liten">
        {steg.trinn ? 'Målt høyde er valgfri – brukes til å markere forslag. ' : ''}
        Måltype: <b>{maaltypeFor(steg, (a) => k.avkrysset(steg.id, a))}</b> · tastes i <b>{enhet}</b>{enhet === 'mm' ? ', lagres i cm' : ''}
      </p>

      {(steg.avkryssinger ?? []).filter((a) => (a.vis ? a.vis(k) : true)).map((a) => {
        const paa = k.avkrysset(steg.id, a.id);
        return (
          <button key={a.id} className={`sjekk ${paa ? 'paa' : ''}`} aria-pressed={paa}
            onClick={() => oppdater({ avkryssinger: { ...lagret.avkryssinger, [a.id]: !paa } })}>
            <span className="boks">{paa ? '✓' : ''}</span>{a.tekst}
          </button>
        );
      })}

      {steg.trinn && <TrinnListe steg={steg} k={k} forslag={g.beregnet?.bestilt_cm ?? null} valgt={g.bestilt_cm}
        velg={(cm) => { settMaal({ ...lagret, trinn_cm: cm }); neste(); }} />}

      {!steg.trinn && g.maalt_cm !== null && g.beregnet && (
        <div className="resultat" aria-live="polite">
          Målt {cmTekst(g.maalt_cm)} cm → bestilles
          <strong>{cmTekst(g.bestilt_cm)} cm</strong>
          {!g.manuelt_overstyrt && <>({endringTekst(g.beregnet.bestilt_cm - g.maalt_cm)} cm)</>}
          {g.manuelt_overstyrt && <span className="feil"> Manuelt overstyrt (beregnet {cmTekst(g.beregnet.bestilt_cm)} cm)</span>}
          <div className="regel">Regel: {g.beregnet.regel}</div>
        </div>
      )}

      {!steg.trinn && g.maalt_cm !== null && (
        <button className={`sjekk ${overstyr ? 'paa' : ''}`} onClick={() => {
          const ny = !overstyr;
          setOverstyr(ny);
          if (!ny) { setOt(''); oppdater({ manuelt_cm: null }); }
        }}>
          <span className="boks">{overstyr ? '✓' : ''}</span>Overstyr bestillingsmål
        </button>
      )}
      {overstyr && (
        <div className="felt">
          <label>Bestillingsmål (cm)</label>
          <input className="inn stor" inputMode="decimal" value={ot}
            onChange={(e) => { setOt(e.target.value); oppdater({ manuelt_cm: lesMaal(e.target.value, 'cm') }); }} />
        </div>
      )}

      <div className="bunn">
        <button className="knapp hoved" disabled={!ok} onClick={neste}>Neste</button>
      </div>
    </>
  );
}

// ---------- Høydetrinn ----------

function TrinnListe({ steg, k, forslag, valgt, velg }: {
  steg: MaalSteg; k: ReturnType<typeof lagKontekst>; forslag: number | null; valgt: number | null; velg: (cm: number) => void;
}) {
  const trinn = steg.trinn!(k);
  const boks = useRef<HTMLDivElement>(null);
  const maal = valgt ?? forslag;
  useEffect(() => {
    const el = boks.current?.querySelector<HTMLElement>(`[data-cm="${maal}"]`);
    if (el && boks.current) boks.current.scrollTop = el.offsetTop - boks.current.offsetTop - 60;
  }, [maal]);
  return (
    <>
      {forslag !== null && <div className="resultat">Forslag: <strong>{cmTekst(forslag)} cm</strong><div className="regel">Trykk på trinnet du vil bestille.</div></div>}
      <div className="trinnliste" ref={boks} role="listbox" aria-label="Høydetrinn">
        {trinn.map((t) => (
          <button key={t.cm} data-cm={t.cm} role="option" aria-selected={valgt === t.cm}
            className={`trinn ${valgt === t.cm ? 'valgt' : ''} ${forslag === t.cm ? 'forslag' : ''}`} onClick={() => velg(t.cm)}>
            <span>{cmTekst(t.cm)} cm</span>
            <span className="k">{forslag === t.cm ? '★ forslag' : ''}{t.dekkasse !== undefined ? ` dekkasse ${t.dekkasse}` : ''}</span>
          </button>
        ))}
      </div>
    </>
  );
}

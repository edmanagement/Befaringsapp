import { useEffect, useRef, useState } from 'react';
import { lesImport } from '../db/import';
import type { Gaa } from '../App';
import { db, hentSlettede, slettBefaring, status } from '../db/db';
import type { Befaring, Status } from '../motor/typer';
import { datoTekst, lesDato } from '../tekst';
import { Logo, Topp } from '../ui';

interface Rad { b: Befaring; st: Status; antall: number }

export function Liste({ gaa }: { gaa: Gaa }) {
  const [rader, setRader] = useState<Rad[] | null>(null);
  const [fane, setFane] = useState<'kommende' | 'gjennomfort'>('kommende');
  const [melding, setMelding] = useState('');
  const [teller, setTeller] = useState(0);
  const fil = useRef<HTMLInputElement>(null);

  async function importer(f: File | undefined) {
    if (!f) return;
    try {
      const eks = await db.befaringer.toArray();
      const r = lesImport(await f.text(), eks, await hentSlettede());
      await db.befaringer.bulkAdd(r.nye);
      setMelding(`Importert ${r.nye.length} befaring${r.nye.length === 1 ? '' : 'er'}.` +
        (r.duplikater ? ` ${r.duplikater} fantes fra før.` : '') +
        (r.avsluttet ? ` ${r.avsluttet} er gjennomført eller slettet.` : '') + (r.ugyldige ? ` ${r.ugyldige} rader manglet navn og telefon.` : ''));
      setFane('kommende');
      setTeller((x) => x + 1);
    } catch (e) {
      setMelding('Kunne ikke importere: ' + (e as Error).message);
    } finally {
      if (fil.current) fil.current.value = '';
    }
  }

  useEffect(() => {
    (async () => {
      const bef = await db.befaringer.toArray();
      const ut: Rad[] = [];
      for (const b of bef) {
        const antall = await db.poster.where('befaringId').equals(b.id).count();
        ut.push({ b, st: status(b, antall), antall });
      }
      setRader(ut);
    })();
  }, [teller]);

  async function slett(b: Befaring) {
    if (!confirm(`Slette befaringen «${b.navn || 'Uten navn'}»?\n\nPoster og bilder slettes fra telefonen. Den kommer ikke tilbake ved import.`)) return;
    await slettBefaring(b);
    setMelding(`«${b.navn || 'Uten navn'}» er slettet.`);
    setTeller((x) => x + 1);
  }

  if (!rader) return null;
  const tid = (b: Befaring) => lesDato(b.dato)?.getTime() ?? Number.MAX_SAFE_INTEGER;
  const gjennomfort = (r: Rad) => r.b.fullfort || r.st === 'eksportert' || r.st === 'endret etter eksport';
  const idagStart = new Date(); idagStart.setHours(0, 0, 0, 0);

  const aktive = rader.filter((r) => !gjennomfort(r)).sort((a, b) => tid(a.b) - tid(b.b));
  const kommende = aktive.filter((r) => tid(r.b) >= idagStart.getTime());
  const passert = aktive.filter((r) => tid(r.b) < idagStart.getTime());
  const ferdige = rader.filter(gjennomfort).sort((a, b) => tid(b.b) - tid(a.b));

  return (
    <div className="side">
      <Topp
        tittel={<Logo />}
        hoyre={<button className="knapp tekstknapp" onClick={() => gaa({ side: 'innstillinger' })} aria-label="Innstillinger">⚙︎</button>}
      />
      <button className="knapp hoved" onClick={() => gaa({ side: 'ny' })}>+ Ny befaring</button>
      <div style={{ height: 10 }} />
      <input ref={fil} className="skjult" type="file" accept=".json,application/json" data-testid="import" onChange={(e) => importer(e.target.files?.[0])} />
      <button className="knapp lav" onClick={() => fil.current?.click()}>Importer befaringer.json</button>
      {melding && <div className="info" style={{ marginTop: 10 }}>{melding}</div>}
      <div style={{ height: 14 }} />
      <div className="faner">
        <button className={`knapp lav ${fane === 'kommende' ? 'valgt' : ''}`} onClick={() => setFane('kommende')}>
          Kommende ({aktive.length})
        </button>
        <button className={`knapp lav ${fane === 'gjennomfort' ? 'valgt' : ''}`} onClick={() => setFane('gjennomfort')}>
          Gjennomført ({ferdige.length})
        </button>
      </div>

      {fane === 'kommende' && (
        <>
          {kommende.map((r) => <Kort key={r.b.id} r={r} gaa={gaa} slett={slett} />)}
          {!aktive.length && <p className="liten midt">Ingen bookede befaringer. Trykk «Ny befaring».</p>}
          {passert.length > 0 && (
            <>
              <h3>Passert dato, ikke fullført</h3>
              {passert.map((r) => <Kort key={r.b.id} r={r} gaa={gaa} slett={slett} />)}
            </>
          )}
        </>
      )}
      {fane === 'gjennomfort' && (
        <>
          {ferdige.map((r) => <Kort key={r.b.id} r={r} gaa={gaa} slett={slett} />)}
          {!ferdige.length && <p className="liten midt">Ingen gjennomførte befaringer ennå.</p>}
        </>
      )}
    </div>
  );
}

function Kort({ r, gaa, slett }: { r: Rad; gaa: Gaa; slett: (b: Befaring) => void }) {
  const klasse = r.st === 'endret etter eksport' ? 'endret' : r.st;
  return (
    <div className="kort-ramme">
    <button className="kort-slett" onClick={() => slett(r.b)} aria-label={`Slett ${r.b.navn}`}>✕</button>
    <button className="kort" onClick={() => gaa({ side: 'befaring', id: r.b.id })}>
      <div className="linje">{datoTekst(r.b.dato)}</div>
      <div className="navn">{r.b.navn || 'Uten navn'}</div>
      {r.b.adresse && <div className="linje">{r.b.adresse}</div>}
      {r.b.produktinteresse.length > 0 && <div className="linje">{r.b.produktinteresse.join(', ')}</div>}
      <span className={`merke ${klasse}`}>{r.st}{r.antall ? ` · ${r.antall} poster` : ''}</span>
    </button>
    </div>
  );
}

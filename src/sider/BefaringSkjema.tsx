// Ny befaring / endre kundeinfo.
import { useEffect, useState } from 'react';
import type { Gaa } from '../App';
import { db, lagreBefaring } from '../db/db';
import type { Befaring } from '../motor/typer';
import { produktinteresser } from '../valglister/felles';
import { nyId, storForbokstav } from '../tekst';
import { Topp } from '../ui';

function tom(): Befaring {
  const naa = Date.now();
  const d = new Date();
  const dato = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:00`;
  return {
    id: nyId(), navn: '', telefon: '', adresse: '', epost: '', dato, produktinteresse: [], sluttkommentar: '',
    fullfort: false, opprettet: naa, endret: naa, eksportert: null, kilde: 'manuell',
  };
}

export function BefaringSkjema({ gaa, id }: { gaa: Gaa; id?: string }) {
  const [b, setB] = useState<Befaring | null>(id ? null : tom());
  const [annet, setAnnet] = useState('');

  useEffect(() => {
    if (id) db.befaringer.get(id).then((x) => x && setB(x));
  }, [id]);
  if (!b) return null;

  const sett = (d: Partial<Befaring>) => setB({ ...b, ...d });
  const veksle = (p: string) =>
    sett({ produktinteresse: b.produktinteresse.includes(p) ? b.produktinteresse.filter((x) => x !== p) : [...b.produktinteresse, p] });

  async function lagre() {
    const ekstra = annet.trim() ? [annet.trim()] : [];
    const ny = { ...b!, navn: storForbokstav(b!.navn), produktinteresse: [...b!.produktinteresse, ...ekstra] };
    await lagreBefaring(ny);
    gaa({ side: 'befaring', id: ny.id });
  }

  return (
    <div className="side">
      <Topp tilbake={() => (id ? gaa({ side: 'befaring', id }) : gaa({ side: 'liste' }))} tittel={id ? 'Kundeinfo' : 'Ny befaring'} />
      <div className="felt">
        <label htmlFor="navn">Navn</label>
        <input id="navn" className="inn" value={b.navn} autoComplete="off" autoCapitalize="words"
          onChange={(e) => sett({ navn: e.target.value })} onBlur={() => sett({ navn: storForbokstav(b.navn) })} />
      </div>
      <div className="felt">
        <label htmlFor="tlf">Telefon</label>
        <input id="tlf" className="inn" type="tel" inputMode="tel" value={b.telefon} onChange={(e) => sett({ telefon: e.target.value })} />
      </div>
      <div className="felt">
        <label htmlFor="adr">Adresse</label>
        <input id="adr" className="inn" value={b.adresse} onChange={(e) => sett({ adresse: e.target.value })} />
      </div>
      <div className="felt">
        <label htmlFor="epost">E-post</label>
        <input id="epost" className="inn" type="email" inputMode="email" autoCapitalize="none" value={b.epost} onChange={(e) => sett({ epost: e.target.value })} />
      </div>
      <div className="felt">
        <label htmlFor="dato">Dato og tid</label>
        <input id="dato" className="inn" type="datetime-local" value={b.dato} onChange={(e) => sett({ dato: e.target.value })} />
      </div>
      <div className="felt">
        <label>Produktinteresse</label>
        <div className="valg to">
          {[...produktinteresser.filter((p) => p !== 'Annet'), ...b.produktinteresse.filter((p) => !produktinteresser.includes(p))].map((p) => (
            <button key={p} className={`knapp lav ${b.produktinteresse.includes(p) ? 'valgt' : ''}`} onClick={() => veksle(p)}>{p}</button>
          ))}
        </div>
        <input className="inn" placeholder="Annet (skriv selv)" value={annet} onChange={(e) => setAnnet(e.target.value)} />
      </div>
      <div className="bunn">
        <button className="knapp hoved" onClick={lagre}>{id ? 'Lagre' : 'Opprett befaring'}</button>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import type { Gaa } from '../App';
import { Logo, Topp } from '../ui';
import { SKJEMAVERSJON } from '../eksport/format';
import { DROPBOX_ROT, erTilkoblet, kobleFra, startInnlogging } from '../eksport/dropbox';

export function Innstillinger({ gaa }: { gaa: Gaa }) {
  const [tema, setTema] = useState(document.documentElement.dataset.tema === 'lys' ? 'lys' : 'mork');
  const [dbx, setDbx] = useState<{ tilkoblet: boolean; konto?: string } | null>(null);
  const [melding] = useState(() => sessionStorage.getItem('dropbox-melding'));

  useEffect(() => {
    erTilkoblet().then(setDbx);
    sessionStorage.removeItem('dropbox-melding');
  }, []);

  function velg(t: 'mork' | 'lys') {
    setTema(t);
    document.documentElement.dataset.tema = t;
    localStorage.setItem('tema', t);
  }
  return (
    <div className="side">
      <Topp tilbake={() => gaa({ side: 'liste' })} tittel="Innstillinger" />

      <h3>Dropbox</h3>
      {melding && <div className={melding.startsWith('OK') ? 'info' : 'varsel'}>{melding.replace(/^(OK|FEIL): /, '')}</div>}
      {dbx?.tilkoblet ? (
        <>
          <div className="info">
            ✓ Koblet til{dbx.konto ? ` som ${dbx.konto}` : ''}.<br />
            Befaringer lagres i <b>{DROPBOX_ROT}</b>.
          </div>
          <button className="knapp lav fare" onClick={async () => { await kobleFra(); setDbx({ tilkoblet: false }); }}>Koble fra Dropbox</button>
        </>
      ) : dbx && (
        <>
          <p className="liten">Koble til én gang. Da lagres befaringene rett i {DROPBOX_ROT} når du trykker «Fullfør og lagre i Dropbox».</p>
          <button className="knapp hoved" onClick={startInnlogging}>Koble til Dropbox</button>
        </>
      )}

      <h3>Utseende</h3>
      <div className="valg to">
        <button className={`knapp ${tema === 'mork' ? 'valgt' : ''}`} onClick={() => velg('mork')}>Mørk</button>
        <button className={`knapp ${tema === 'lys' ? 'valgt' : ''}`} onClick={() => velg('lys')}>Lys</button>
      </div>
      <h3>Om appen</h3>
      <p className="liten">
        Alle data lagres på denne telefonen, og befaringene kopieres til Dropbox når du lagrer.
        Eksportformat versjon {SKJEMAVERSJON}.
      </p>
      <div className="midt" style={{ marginTop: 30 }}><Logo /></div>
    </div>
  );
}

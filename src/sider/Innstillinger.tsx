import { useState } from 'react';
import type { Gaa } from '../App';
import { Logo, Topp } from '../ui';
import { SKJEMAVERSJON } from '../eksport/format';

export function Innstillinger({ gaa }: { gaa: Gaa }) {
  const [tema, setTema] = useState(document.documentElement.dataset.tema === 'lys' ? 'lys' : 'mork');
  function velg(t: 'mork' | 'lys') {
    setTema(t);
    document.documentElement.dataset.tema = t;
    localStorage.setItem('tema', t);
  }
  return (
    <div className="side">
      <Topp tilbake={() => gaa({ side: 'liste' })} tittel="Innstillinger" />
      <h3>Utseende</h3>
      <div className="valg to">
        <button className={`knapp ${tema === 'mork' ? 'valgt' : ''}`} onClick={() => velg('mork')}>Mørk</button>
        <button className={`knapp ${tema === 'lys' ? 'valgt' : ''}`} onClick={() => velg('lys')}>Lys</button>
      </div>
      <h3>Om appen</h3>
      <p className="liten">
        Alle data lagres bare på denne telefonen. Eksporter befaringen til Dropbox når du er ferdig.
        Eksportformat versjon {SKJEMAVERSJON}.
      </p>
      <div className="midt" style={{ marginTop: 30 }}><Logo /></div>
    </div>
  );
}

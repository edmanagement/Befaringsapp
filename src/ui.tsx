// Felles UI-biter.
import type { ReactNode } from 'react';

export function Logo() {
  const lys = document.documentElement.dataset.tema === 'lys';
  return <img className="logo" src={lys ? './logo-farge.svg' : './logo-hvit.svg'} alt="Scandic Markiser" />;
}

export function Topp({ tilbake, tittel, hoyre }: { tilbake?: () => void; tittel?: ReactNode; hoyre?: ReactNode }) {
  return (
    <div className="topp">
      {tilbake && (
        <button className="knapp tekstknapp" onClick={tilbake} aria-label="Tilbake">
          ‹ Tilbake
        </button>
      )}
      {typeof tittel === 'string' ? <h1>{tittel}</h1> : <div className="fyll">{tittel}</div>}
      {hoyre}
    </div>
  );
}

export function Varsler({ liste }: { liste: string[] }) {
  if (!liste.length) return null;
  return (
    <>
      {liste.map((t) => (
        <div className="varsel" key={t} role="alert">
          ⚠ {t}
        </div>
      ))}
    </>
  );
}

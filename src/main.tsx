import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './stil.css';

const tema = localStorage.getItem('tema') === 'lys' ? 'lys' : 'mork';
document.documentElement.dataset.tema = tema;

// Be om varig lagring, så iOS ikke rydder bort data.
navigator.storage?.persist?.().catch(() => {});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Byggeklosser som brukes av flere produktfiler.
import type { Steg, TallSteg, ValgSteg, Valg } from '../motor/typer';
import { etasje, lift } from '../valglister/felles';

export const antall = (): TallSteg => ({
  id: 'antall',
  ledetekst: 'Antall',
  ebestFelt: 'Antall',
  type: 'tall',
  enhet: 'stk',
  heltall: true,
  min: 1,
  standard: 1,
});

export const valg = (id: string, ledetekst: string, valgListe: Valg[], ekstra: Partial<ValgSteg> = {}): ValgSteg => ({
  id,
  ledetekst,
  ebestFelt: ledetekst,
  type: 'valg',
  valg: valgListe,
  ...ekstra,
});

export const etasjeOgLift = (): Steg[] => [
  valg('etasje', 'Etasje', etasje),
  valg('lift', 'Lift', lift),
];

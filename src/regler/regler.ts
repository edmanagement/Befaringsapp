// Måleregler. Rene funksjoner – testes i tests/regler.test.ts.
// Endrer du en regel her, endre også testen. Det er her feil koster penger.

import { avrund, cmTekst, sum } from './tall';
import type { RegelResultat } from '../motor/typer';

export const ingenRegel = (maalt: number): RegelResultat => ({
  bestilt_cm: avrund(maalt),
  regel: 'Ingen fratrekk eller tillegg',
});

/** Honeycell / plissé, bredde: nettomål −0,4 cm (4 mm). */
export function honeycellBredde(maalt: number): RegelResultat {
  return { bestilt_cm: sum(maalt, -0.4), regel: 'Nettomål −0,4 cm (4 mm)' };
}

// ---------- Screen V550 ----------

export type ScreenStorrelse = 'XS' | 'S' | 'M' | 'L';

/** Maks bestillingsmål (bredde × høyde) i cm per størrelse. Fra eBest. */
export const screenMaks: Record<ScreenStorrelse, { bredde: number; hoyde: number }> = {
  XS: { bredde: 340, hoyde: 190 },
  S: { bredde: 340, hoyde: 300 },
  M: { bredde: 400, hoyde: 350 },
  L: { bredde: 600, hoyde: 500 },
};

export const SCREEN_SIDESKINNER_CM = 8.2;

/** Kassett-tillegg i høyden med liten bunnlist. */
export const screenKassettTillegg: Record<ScreenStorrelse, number> = { XS: 12, S: 13, M: 14, L: 16 };

/** Ekstra kassett-tillegg med stor bunnlist. */
export const SCREEN_STOR_BUNNLIST_EKSTRA_CM = 2;

/** Over denne bestilte bredden er Large bunnlist tvunget (prisliste 2026: «large benyttes over 3000 mm bredde»). */
export const SCREEN_STOR_BUNNLIST_OVER_CM = 300;

export function screenBredde(maalt: number, leggTilSideskinner: boolean): RegelResultat {
  if (!leggTilSideskinner) return { bestilt_cm: avrund(maalt), regel: 'Nettomål, ingen tillegg' };
  return {
    bestilt_cm: sum(maalt, SCREEN_SIDESKINNER_CM),
    regel: `Nettomål +${cmTekst(SCREEN_SIDESKINNER_CM)} cm (sideskinner)`,
  };
}

export function screenHoyde(
  maalt: number,
  leggTilKassett: boolean,
  storrelse: ScreenStorrelse | null,
  storBunnlist: boolean,
): RegelResultat {
  if (!leggTilKassett) return { bestilt_cm: avrund(maalt), regel: 'Nettomål, ingen tillegg' };
  if (!storrelse) return { bestilt_cm: avrund(maalt), regel: 'Kassett-tillegg ukjent (størrelse ikke valgt)' };
  const kassett = screenKassettTillegg[storrelse];
  if (!storBunnlist) {
    return { bestilt_cm: sum(maalt, kassett), regel: `Nettomål +${kassett} cm (kassett ${storrelse}, liten bunnlist)` };
  }
  return {
    bestilt_cm: sum(maalt, kassett, SCREEN_STOR_BUNNLIST_EKSTRA_CM),
    regel: `Nettomål +${kassett} cm (kassett ${storrelse}) +${SCREEN_STOR_BUNNLIST_EKSTRA_CM} cm (stor bunnlist)`,
  };
}

export function screenStorBunnlistTvunget(bestiltBredde: number | null): boolean {
  return bestiltBredde !== null && bestiltBredde > SCREEN_STOR_BUNNLIST_OVER_CM;
}

/** Varsler når bestillingsmålet er over størrelsens maks. */
export function screenOverMaks(
  storrelse: ScreenStorrelse | null,
  bredde: number | null,
  hoyde: number | null,
): string[] {
  if (!storrelse) return [];
  const m = screenMaks[storrelse];
  const v: string[] = [];
  if (bredde !== null && bredde > m.bredde)
    v.push(`Bredde ${cmTekst(bredde)} cm er over maks for ${storrelse} (${m.bredde} cm).`);
  if (hoyde !== null && hoyde > m.hoyde)
    v.push(`Høyde ${cmTekst(hoyde)} cm er over maks for ${storrelse} (${m.hoyde} cm).`);
  return v;
}

// ---------- Vindusmarkise (brukes i etappe 2, testes nå) ----------

/** armlengde = rund opp til nærmeste 10 cm (mål / 2). */
export function vindusmarkiseArmlengde(maalt: number): number {
  return Math.ceil(avrund(maalt / 2) / 10 - 1e-9) * 10;
}

// ---------- Etappe 2 ----------

/** Persienne 25 mm, bredde: nettomål −0,4 cm (4 mm). */
export const persienne25Bredde = (m: number): RegelResultat => ({ bestilt_cm: sum(m, -0.4), regel: 'Nettomål −0,4 cm (4 mm)' });

/** Lamellgardin, bredde: nettomål −1 cm. */
export const lamellBredde = (m: number): RegelResultat => ({ bestilt_cm: sum(m, -1), regel: 'Nettomål −1 cm' });

/** Lamellgardin, høyde: til gulv −2 cm, i vinduskarm −1 cm. */
export function lamellHoyde(m: number, til: 'gulv' | 'karm' | null): RegelResultat {
  if (til === 'gulv') return { bestilt_cm: sum(m, -2), regel: 'Til gulv −2 cm' };
  if (til === 'karm') return { bestilt_cm: sum(m, -1), regel: 'I vinduskarm −1 cm' };
  return { bestilt_cm: avrund(m), regel: 'Velg «til gulv» eller «i vinduskarm» for fratrekk' };
}

/** Insektsnetting, bredde: −0,2 cm (standard) eller −0,1 cm. */
export const insektBredde = (m: number, bare1mm: boolean): RegelResultat =>
  bare1mm ? { bestilt_cm: sum(m, -0.1), regel: '−0,1 cm (1 mm)' } : { bestilt_cm: sum(m, -0.2), regel: '−0,2 cm (2 mm)' };

/** Zipscreen Mini, bredde: målt i lysåpning −1 cm. */
export const miniBredde = (m: number, lysaapning: boolean): RegelResultat =>
  lysaapning ? { bestilt_cm: sum(m, -1), regel: 'Lysåpning −1 cm' } : { bestilt_cm: avrund(m), regel: 'Ingen fratrekk (ikke målt i lysåpning)' };

/** Utvendige persienner (Scandic 80/50, Standard 50): +5 cm per side = +10 cm på vindusmålet. */
export const utvPersienneBredde = (m: number): RegelResultat => ({ bestilt_cm: sum(m, 10), regel: 'Vindusmål +5 cm per side (+10 cm)' });

/** Vindusmarkise, bredde: +10 cm per side (+20), eller +5 per side (+10) ved «vannrett». */
export const vindusmarkiseBredde = (m: number, vannrett: boolean): RegelResultat =>
  vannrett
    ? { bestilt_cm: sum(m, 10), regel: 'Vannrett: vindusmål +5 cm per side (+10 cm)' }
    : { bestilt_cm: sum(m, 20), regel: 'Vindusmål +10 cm per side (+20 cm)' };

export const vindusmarkiseArmRegel = (m: number): RegelResultat => ({
  bestilt_cm: vindusmarkiseArmlengde(m),
  regel: 'Mål / 2, rundet opp til nærmeste 10 cm',
});

/** Continent 50: bestillingsbredden skal slutte på ,5 (millimeteren). */
export const slutterPaaFem = (cm: number): boolean => Math.round(cm * 10) % 10 === 5;

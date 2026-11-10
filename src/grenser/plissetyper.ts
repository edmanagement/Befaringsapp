// Min/maks-mål per plissetype (bestillingsmål i cm). eBest avgjør dette på serveren,
// og grensene er ikke kjent ennå. Fyll inn etter hvert. Tom fil = ingen varsler.
//
// Eksempel:
//   P1600: { minBredde: 20, maksBredde: 200, minHoyde: 20, maksHoyde: 220 },

export interface Grense {
  minBredde?: number;
  maksBredde?: number;
  minHoyde?: number;
  maksHoyde?: number;
}

export const plissetypeGrenser: Record<string, Grense> = {
  // TODO: fyll inn fra eBest
};

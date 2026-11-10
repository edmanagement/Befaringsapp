// Maksmål per plissetype (bestillingsmål i cm), fra Prisliste 2026 side 84–85 («Plisségardiner (Modeller)»).
// Maksmål er alternativer: f.eks. P1600 kan være inntil 120 × 220 ELLER inntil 150 × 160 (bredde × høyde).
// Grensene gir bare varsel – eBest avgjør endelig hvilke typer som er mulige.

export interface Grense {
  /** Maksmål for plissé: liste av [bredde, høyde]. Målene må passe innenfor minst én. */
  plisse?: [number, number][];
  /** Maksmål for Honeycell. */
  honeycell?: [number, number][];
  /** Maks areal i m². */
  maksAreal?: number;
  minBredde?: number;
  maksHoyde?: number;
  /** Ekstra informasjon som vises når typen er valgt. */
  merknad?: string;
}

const fritt: Grense = { plisse: [[220, 260]], honeycell: [[250, 260]], maksAreal: 5.7, minBredde: 30 };
const kjede: Grense = { plisse: [[220, 260]], honeycell: [[290, 260]], maksAreal: 7, minBredde: 40 };
const motor: Grense = { plisse: [[220, 260]], honeycell: [[290, 260]], maksAreal: 7, minBredde: 70 };

export const plissetypeGrenser: Record<string, Grense> = {
  // Betjening: håndtak (forspente)
  P1600: { plisse: [[120, 220], [150, 160]], honeycell: [[120, 220], [150, 160]], maksAreal: 2.4, minBredde: 20 },
  P1610: { plisse: [[120, 220], [150, 150]], honeycell: [[120, 220], [150, 150]], maksAreal: 2.4, minBredde: 20 },
  P1615: { plisse: [[120, 220], [150, 160]], honeycell: [[120, 220], [150, 160]], maksAreal: 2.4, minBredde: 20 },
  P1616: {
    plisse: [[150, 220], [210, 160]], honeycell: [[150, 220], [210, 160]], maksAreal: 3.3, minBredde: 20,
    merknad: 'Anbefales fra 120 cm bredde.',
  },
  P1634: { plisse: [[150, 200]], honeycell: [[150, 200]] },
  P1636: { plisse: [[120, 200]], honeycell: [[120, 200]] },
  // Betjening: snor (fritthengende)
  P1700: fritt,
  P1705: fritt,
  P1710: fritt,
  P1715: fritt,
  // Fritthengende skråmodeller
  P1740: { maksHoyde: 170, minBredde: 50, merknad: 'Maks lengde skråprofil: 200 cm ved 60°, 220 cm ved 30°.' },
  P1751: { maksHoyde: 260, minBredde: 30, merknad: 'Maks lengde skråprofil: 200 cm ved 60°, 220 cm ved 30°.' },
  // Kjede og motor
  P1800: kjede,
  P1805: kjede,
  P1900: motor,
  P1905: motor,
  P1900Z: motor,
};

/** Varsler for valgt plissetype og bestillingsmål. */
export function plissetypeVarsler(type: string, erHoneycell: boolean, bredde: number | null, hoyde: number | null): string[] {
  const g = plissetypeGrenser[type];
  if (!g) return [];
  const ut: string[] = [];
  const navn = erHoneycell ? 'Honeycell' : 'plissé';
  const maks = erHoneycell ? g.honeycell : g.plisse;
  if (maks && bredde !== null && hoyde !== null && !maks.some(([b, h]) => bredde <= b && hoyde <= h)) {
    ut.push(`${type}: ${bredde} × ${hoyde} cm er over maksmål for ${navn} (${maks.map(([b, h]) => `${b} × ${h}`).join(' eller ')}).`);
  }
  if (maks && bredde !== null && hoyde === null && !maks.some(([b]) => bredde <= b)) {
    ut.push(`${type}: bredde ${bredde} cm er over maks for ${navn}.`);
  }
  if (g.maksAreal && bredde !== null && hoyde !== null && (bredde * hoyde) / 10000 > g.maksAreal + 1e-9) {
    ut.push(`${type}: areal ${((bredde * hoyde) / 10000).toFixed(2).replace('.', ',')} m² er over maks ${String(g.maksAreal).replace('.', ',')} m².`);
  }
  if (g.minBredde && bredde !== null && bredde < g.minBredde) ut.push(`${type}: bredde under min ${g.minBredde} cm.`);
  if (g.maksHoyde && hoyde !== null && hoyde > g.maksHoyde) ut.push(`${type}: høyde over maks ${g.maksHoyde} cm.`);
  return ut;
}

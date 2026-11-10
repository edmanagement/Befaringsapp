// Markiser: terrasse-, vindus- og fasademarkise. Ordrett fra eBest (ebest-felt-og-valg.md).
// Markisedukene har bare nummer i eBest – vises som søkbar liste.
import type { DukGruppe } from '../motor/typer';
import { v, bryterliste, ioFjernkontroller, telisRts, sveiv3, motorkabel3 } from './felles';

const standard = [
  '107', '107/515', '1078/24', '1080/5', '1081/12', '1081/151', '1081/24', '1081/305', '1081/392', '1081/7', '1081/79', '1081/84', '1081/90', '1081/92', '1081/98',
  '13', '1330/505', '1330/512', '15', '15/515', '24', '30A 734', '314 006', '314 030', '314 402', '314 403', '314 941', '314-030',
  '320 103', '320 186', '320 190', '320 837', '320 923', '320 925', '320 937', '320 959', '320493', '330 039',
  '407/11', '407/151', '407/16', '407/305', '407/307', '407/324', '407/392', '407/51', '407/52', '407/75', '407/79', '407/926', '407/94',
  '4215/24', '4215/92', '5001/12', '5167/2', '5173/12', '5173/24', '5173/75', '5173/94', '5173/97', '5326/24', '5356/24', '5356/58', '5357/7',
  '5359/75', '5360/107', '5374', '5379/24', '5380/107', '5380/24', '5380/327', '5380/727', '5380/97', '5396/107', '5396/151', '5396/701', '5396/929',
  '5398/107', '5398/78', '5400/102', '5400/24', '5400/327', '5400/727', '5400/81', '5400/94', '5400/97', '5400107', '5405/87',
  '5407/102', '5407/106', '5407/107', '5407/24', '5407/306', '5407/397', '5407/5', '5407/81', '5407/84', '5407/92',
  '641/10', '641/24', '67', '727/15', '727/515', '729/24', '75', '79', '792/97', '873/17', '873/78', '873/87', '873/926',
  '920 493', '94/15', '951/92', '97', '986/15', '986/727', '991/24', '991/97',
];
const lumera = [
  '30A 734', '320 039', '320 103', '320 186', '320 493', '320 925', '320 937', '320 959',
  '338 001', '338 003', '338 011', '338 020', '338 028', '338 033', '338 038', '338 089', '338 132', '338 136', '338 144', '338 154',
  '338 306', '338 362', '338 398', '338 406', '338 620', '338 621', '338 623', '338 627', '338 639', '338 640', '338 643', '338 644',
  '338 655', '338 656', '338 658', '338 659', '338 661', '338 662', '338 665', '338 710', '338 711', '338 712', '338 713', '338 714',
  '338 715', '338 802', '338 808', '338 809', '338 810', '338 811', '338 812', '338 814', '338 910', '338/144', '338/910',
];

export const markiseDuker: Record<string, DukGruppe[]> = {
  Standard: [{ navn: 'Standard', numre: standard, navnIEbest: false }],
  Lumera: [{ navn: 'Lumera', numre: lumera, navnIEbest: false }],
};

export const duktype = v('Standard', 'Lumera', 'Spesial');
export const kappe = v('Bølget', 'Rett');
export const kantbandFarge = v('05', '07', '08', '10', '11', '12', '14', '15', '15/1', '24', '54', '73', '75', '79', '81', '84', '87', '94', '97');

/** Betjening2 for markiser, ut fra betjeningsteksten i eBest. */
export function markiseUndervalg(b: string) {
  if (b === 'Standard m/ sveiv') return sveiv3;
  if (b.includes(' io') || b.includes('Sunilus') || b.includes('Sunea')) return ioFjernkontroller;
  if (b.includes('RTS')) return telisRts;
  if (b.includes('bryter') || b.includes('Bryter') || b.includes('LT50') || b.includes('Orea WT')) return bryterliste;
  return [];
}

// ---------- Terrassemarkise ----------
export const terrasseModellHurtig = ['Premium', 'Premium Pluss'];
export const terrasseModellFlere = ['Premium Pluss cross-over', 'Trendline', 'Trendline cross-over'];
export const erPremium = (m: string) => m.startsWith('Premium');
export const erPremiumPluss = (m: string) => m.startsWith('Premium Pluss');
export const erTrendline = (m: string) => m.startsWith('Trendline');

export const stativfargePremium = v('Hvit (RAL 9010)', 'Strukturert grå', 'Sort (VS 905)');
export const stativfargeTrendline = v('Hvit (RAL 9010)', 'Grå (RAL 9006)', 'Sort (VS905)', 'Valgfri RAL');
export const stativfargeTrendlineCross = v('Hvit (9010)', 'Grå (9006)', 'Sort (VS905)', 'Valgfri RAL');

export const utfall = v('150', '200', '250', '300', '350');

export const frontPremium = v('SOLTIS 86-2047 ANTRASITT', 'SOLTIS 86-2167 GRÅ', 'SOLTIS 92-2047 ANTRASITT', 'SOLTIS 92-2167 GRÅ');
const soltis = ['2043 BRUN', '2044 HVIT', '2045 SØLV', '2046 SAND', '2047 GRÅKULL', '2135 BEIGE', '2167 GRÅ'];
export const frontTrendline = v('Lik markiseduk', ...soltis.map((f) => `SOLTIS 86-${f}`), ...soltis.map((f) => `SOLTIS 92-${f}`));

export const TERRASSE_SVEIV = 'Standard m/ sveiv';
export const terrasseBetjening = v(TERRASSE_SVEIV, 'Somfy Sunilus io 30/17', 'Somfy LT50 Helios 30/17 - Bryter');
export const EOLIS = 'Ja, Eolis 3D sensor io';
export function vindsikring(modell: string, betjening: string) {
  const sunilus = betjening.includes('Sunilus');
  const liste = erTrendline(modell)
    ? ['Nei', 'Ja, vindsikringsstag 80-100cm', 'Ja, vindsikringsstag 150-220cm', 'Ja, vindsikringsstag eksklusiv']
    : ['Nei', 'Ja - Sort vindsikringsstag', 'Ja - Grå vindsikringsstag'];
  return v(...liste, ...(sunilus ? [EOLIS] : []));
}
export const motorkabelPremium = motorkabel3;
export const motorkabelTrendline = v('Standard kabel', 'Tillegg, 10m Sort', 'Tillegg, 10m Hvit');
export const takfargePremium = v('Grå', 'Hvit', 'Sort');
export const takfargeTrendline = v('Grå', 'Hvit', 'Antrasitt', 'Sort');
/** Takfarge = samme farge som markisen (stativfargen). null = må velges (f.eks. valgfri RAL). */
export function takfargeFraStativ(stativ: string): string | null {
  const t = stativ.toLowerCase();
  if (t.includes('hvit')) return 'Hvit';
  if (t.includes('grå')) return 'Grå';
  if (t.includes('sort')) return 'Sort';
  return null;
}
export const festeTrendline = v('Vegg', 'Tak, rett', 'Tak, skrått');

// ---------- Kassettmarkise (Verano) ----------
export const kassettModell = v('Ipanema (V280)', 'Santander (V460)', 'Palermo (V490)');
export const RAL_KASSETT = 'RAL ►';
export const kassettFargeIpanema = v(RAL_KASSETT, 'Hvit', '9001 - Ivory', 'VS716 - Strukturert antrasite', 'VS905 - Strukturert sort');
export const kassettFargeSantander = v('Hvit', '9001 - Ivory', 'VS716 - Strukturert antrasite', 'VS905 - Strukturert sort');
const nr = (l: number[]) => l.map((x) => `70.${x}`);
export const kassettDuker: Record<string, DukGruppe[]> = {
  'Trend Colors': [{ navn: 'Trend Colors', navnIEbest: false, numre: nr([2516, 2601, 2602, 2603, 2604, 2618, 2623, 2624, 2625, 2648, 2658, 2739, 2740, 2741, 2742, 2744, 2746, 2747, 2749, 2750, 2751, 2752, 2753, 2754, 2756, 2801]) }],
  'Urban Colors': [{ navn: 'Urban Colors', navnIEbest: false, numre: nr([2500, 2501, 2502, 2503, 2504, 2505, 2506, 2507, 2509, 2510, 2511, 2513, 2515, 2519, 2526, 2527, 2529, 2532, 2533, 2535, 2537, 2549, 2605, 2644, 2645, 2649, 2650, 2651, 2652, 2653, 2654, 2657, 2659, 2708, 2709, 2710, 2712, 2715, 2716, 2717, 2745, 2757, 2758, 2759, 2760, 2761, 2767, 2769, 2774, 2775, 2776, 2777, 2779, 2782, 2783, 2785, 2786, 2787, 2788, 2789, 2791, 2793, 2794, 2795, 2796, 2797, 2798, 2799, 2800]) }],
};
export const kassettBetjening = v('Somfy Sunea io motor', 'Somfy Orea WT - Bryter');
export const kassettKabel = v('Standard kabel', 'Tillegg, 3m Sort', 'Tillegg, 5m Sort', 'Tillegg, 10m Sort', 'Tillegg, 5m Hvit', 'Tillegg, 10m Hvit');
export const kassettBrakett = v('Vegg - medium', 'Vegg - large', 'Vegg - XL (Tillegg)', 'Tak (Tillegg)');

// ---------- Vindusmarkise ----------
export const vindusStativ = v('RAL 9010 - Hvit', 'RAL 9006 - Grå', 'RAL 9005 - Sort');
export const armlengder = v('50', '60', '70', '80', '90', '100');
export const vindusNisje = v('Nei', 'Ja, dybde 45 mm', 'Ja, dybde 65 mm', 'Ja, dybde 100 mm', 'Ja, dybde 130 mm', 'Ja, dybde 185 mm');
export const vindusBetjening = v('Standard m/ snorbetjening', 'Tillegg for io', 'Tillegg for RTS', 'Tillegg for brytermotor');
export function vindusKabel(b: string) {
  if (b === 'Tillegg for io') return v('5m Hvit', '5m Sort');
  if (b === 'Tillegg for RTS') return v('5m Hvit', '3m Sort');
  if (b === 'Tillegg for brytermotor') return v('2,5m Hvit', '2,5m Sort');
  return [];
}

// ---------- Fasade-/balkongmarkise ----------
export const fasadeModell = v('Fasademarkise', 'Balkongmarkise');
export const fasadeStativ: Record<string, ReturnType<typeof v>> = {
  Fasademarkise: v('RAL 9010 - Hvit', 'RAL 9006 - Grå', 'RAL 9005 - Sort'),
  Balkongmarkise: v('RAL 9010 - Hvit', 'RAL 9006 - Grå'),
};
export const fasadeNisje = v('Nei', 'Ja, dybde 6cm', 'Ja, dybde 8cm', 'Ja, dybde 11cm', 'Ja, dybde 15cm');
export const fasadeBetjening = v('Standard m/ sveiv', 'Tillegg for io', 'Tillegg for RTS', 'Tillegg for brytermotor');

// ---------- Kurvmarkise ----------
export const kurvType = v('Kvartbuet', 'Avtrappet', 'Rundbuet (pristillegg)');
export const pyntelist = v('Spesial ►', '52 BEIGE', '79 GRÅ', '81 BRUN');
export const kurvBetjening = v('Snortrekk', 'Oppspent', 'Motorstyring m/ innfelt bryter', 'Motorstyring m/ utenpåliggende bryter');

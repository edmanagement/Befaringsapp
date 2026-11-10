// Markiser: terrasse-, vindus- og fasademarkise. Ordrett fra eBest (ebest-felt-og-valg.md).
// Markisedukene har bare nummer i eBest – vises som søkbar liste.
import type { DukGruppe } from '../motor/typer';
import { v } from './felles';

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

// ---------- Terrassemarkise ----------
export const terrasseModellHurtig = ['Premium', 'Premium Pluss'];
export const terrasseModellFlere = ['Premium Pluss cross-over', 'Trendline', 'Trendline cross-over', 'Ipanema V280', 'Palermo V490', 'Santander V460'];
export const erPremium = (m: string) => m.startsWith('Premium');
export const erTrendline = (m: string) => m.startsWith('Trendline');

export const stativfargePremium = v('Hvit RAL 9010', 'Strukturert grå', 'Sort VS905');
export const stativfargeTrendline = v('Hvit 9010', 'Grå 9006', 'Sort VS905', 'Valgfri RAL');
// TODO: fyll inn fra eBest – stativfarger for Verano kassettmarkiser (Ipanema, Palermo, Santander).

export const utfall = v('150', '200', '250', '300', '350');

export const frontPremium = v('Soltis 86-2047 Antrasitt', 'Soltis 86-2167 Grå', 'Soltis 92-2047 Antrasitt', 'Soltis 92-2167 Grå');
const soltis = ['2043 Brun', '2044 Hvit', '2045 Sølv', '2046 Sand', '2047 Gråkull', '2135 Beige', '2167 Grå'];
export const frontTrendline = v('Lik markiseduk', ...soltis.map((f) => `Soltis 86 ${f}`), ...soltis.map((f) => `Soltis 92 ${f}`));

export const terrasseBetjening = v('Standard m/ sveiv', 'Somfy Sunilus io 30/17', 'Somfy LT50 Helios 30/17 – bryter');
export const sveivlengde = v('110', '140', '180');
export const fjernkontrollIo = v('Ingen, benytter eksisterende', 'Smoove Origin IO', 'Situo IO Pure', 'Situo IO Pure 5 kanals');
export const bryterValg = v('Ingen, benytter eksisterende', 'innfelt', 'utenpåliggende');
export const motorkabel = v('Standard kabel', '5 m sort', '10 m hvit');
export const takfargePremium = v('Grå', 'Hvit', 'Sort');
export const takfargeTrendline = v('Grå', 'Hvit', 'Sort', 'Antrasitt');

// ---------- Vindusmarkise ----------
export const vindusStativ = v('RAL 9010 Hvit', '9006 Grå', '9005 Sort');
export const armlengder = v('50', '60', '70', '80', '90', '100');
export const vindusNisjeDybde = v('45', '65', '100', '130', '185');
export const vindusBetjening = v('Standard m/ snorbetjening', 'Tillegg for io', 'Tillegg for RTS', 'Tillegg for brytermotor');

// ---------- Fasademarkise ----------
export const fasadeModell = v('Fasademarkise', 'Balkongmarkise', 'Kurvmarkise');
export const fasadeStativ: Record<string, ReturnType<typeof v>> = {
  Fasademarkise: v('Hvit', 'Grå', 'Sort'),
  Balkongmarkise: v('Hvit', 'Grå'),
  // TODO: fyll inn fra eBest – stativfarger for Kurvmarkise.
};
export const fasadeNisjeDybde = v('6', '8', '11', '15');
export const fasadeBetjening = v('Standard m/ sveiv', 'Tillegg for io', 'Tillegg for RTS', 'Tillegg for brytermotor');

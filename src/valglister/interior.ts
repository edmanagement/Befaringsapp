// Interiør: Persienne 25, Lamellgardin, Rullegardin (Verano), Insektsnetting. Ordrett fra eBest (hentet 10.11.2026).
import type { DukGruppe } from '../motor/typer';
import { v, telisRts, ingenEksisterende, bryterliste } from './felles';

// ---------- Persienne 25 mm (Roulette 25) ----------
export const persienne25Lamellfarge = v(
  'Opl 0001 = 0001', 'Opl 0002 = 0065', 'Opl 0002 PF = P-65', 'Opl 0017 = 0258', 'Opl 0019 = 0049', 'Opl 0019 PF = P-49',
  'Opl 0038 = 0058', 'Opl 0038 PF = P-58', 'Opl 0061 = 0010', 'Opl 0285 = 0285', 'Opl 0285 PF = P-285', 'Opl 0522 = 0061',
  'Opl 0611 = 0012', 'Opl 0717 = 0717', 'Opl 0896 = 0147', 'Opl 1030 = 0017', 'Opl 2901 = 1901', 'Opl 5104 = 0104',
  'Opl 8003 = 8003', 'Opl 9001 = 9800', 'Opl 9007 = 9007',
);
export const P25_STANDARD = 'Standard m/ Snortrekk og vendestav';
export const persienne25Betjening = v(P25_STANDARD, 'Somfy Tilt & Lift m/batterilader', 'Somfy Tilt & Lift u/batterilader');
export const persienne25Vendestav = v('Lengde vendestav, 20cm', 'Lengde vendestav, 40cm', 'Lengde vendestav, 70cm', 'Lengde vendestav, 100cm');
export const persienne25Fjernkontroll = v('Benytter eksisterende fjernkontroll');

// ---------- Lamellgardin (alltid 89 mm) ----------
/** eBest-tekst: «BERLIN - 0100». */
const lamell = (navn: string, numre: string[]): DukGruppe => ({ navn, numre, navnIEbest: true, ebestMal: '{k} - {n}' });
export const lamellFarger: Record<string, DukGruppe[]> = {
  '1': [
    lamell('BERLIN', ['01', '0100', '0120', '0130', '0150', '0600', '0610', '1300', '1320']),
    lamell('MIAMI', ['000', '001', '002', '051']),
    lamell('SHANTUNG', ['000', '001', '003', '005', '058']),
  ],
  '2': [
    lamell('BERLIN C BO', ['5100', '5120', '5130', '5150', '5600', '5610', '6300', '6320']),
    lamell('LIMA', ['10690', '10691', '10696', '10697', '10983', '7425', '8203', '8204']),
    lamell('LUNA', ['1039', '2323', '9192', '9193', '9197']),
    lamell('REVIVAL', ['2323', '9190', '9196', '9197']),
  ],
  '3': [
    lamell('ESSENTIAL', ['301', '302', '303', '306']),
    lamell('PORTOFINO C BO', ['51', '52', '53', '54', '55', '56']),
    lamell('SILKSHADE 3% ALU', ['10940', '10943', '7033', '7172', '7183']),
    lamell('TECNO', ['100', '6078', '6083']),
  ],
  '4': [{ navn: 'Gruppe 4', numre: [], navnIEbest: false, merknad: 'Gruppe 4 har ikke målskjema i eBest – skriv farge og nummer.' }],
};
export const FORINGSSTAV = 'Føringsstav ►';
export const SPESIAL_SNOR = 'Spesial snor/kjede ►';
export const lamellBetjening = v(FORINGSSTAV, 'Motorpakke 1', 'Motorpakke 2', 'Motorpakke 3', 'Standard snor/kjede', SPESIAL_SNOR);
export const stavlengde = v('60 cm', '80 cm', '100 cm', '120 cm', '150 cm');
export const lamellSkra = v('Nei', 'Ja, fra V ► H', 'Ja, fra H ► V');

// ---------- Rullegardin (Verano medium / large) ----------
/** eBest-tekst: «72.1322 - BASIC - BO PLUS» (nummer først). */
const gv = (navn: string, numre: string[]): DukGruppe => ({ navn, numre, navnIEbest: true, ebestMal: '{n} - {k}' });
const r = (fra: number, til: number) => Array.from({ length: til - fra + 1 }, (_, i) => `72.${fra + i}`);

/** Verano-duker per prisgruppe. Lik for medium og large (large har ikke gr. 1). */
export const veranoDuker: Record<string, DukGruppe[]> = {
  '0': [
    gv('CLASSIC - SEMI-TRANSPARENT', r(1208, 1215)),
    gv('BASIC - SEMI-TRANSPARENT', [...r(1250, 1259), '72.1402', '72.1403', '72.1408', '72.1431', '72.1448', '72.1458', '72.1481', '72.1482']),
  ],
  '1': [
    gv('CLASSIC - BO PLUS', r(1314, 1321)),
    gv('ESSENCE - TRANSPARENT', r(1600, 1606)),
    gv('PURE - TRANSPARENT', r(2600, 2606)),
    gv('ORIGIN - SEMI-TRANSPARENT', r(2630, 2635)),
  ],
  '2': [
    gv('BASIC - BO PLUS', [...r(1322, 1329), '72.1502', '72.1503', '72.1507', '72.1517', '72.1522', '72.1526', '72.1532', '72.1544', '72.1545', '72.1546', '72.1588']),
    gv('VELVET - BO PLUS', r(2607, 2613)),
    gv('RUSTIC - TRANSPARENT', r(2614, 2618)),
    gv('LINEN - BO PLUS', r(2619, 2623)),
  ],
  '3': [gv('SCREEN', [...r(1731, 1737), ...r(1751, 1757)])],
  '5': [
    gv('NATURAL - BO PLUS', ['72.1667', '72.1668', '72.1669', '72.1671']),
    gv('SCREEN', ['72.1761', '72.1762', '72.1763', '72.1903', '72.1912', '72.1913', '72.1921', '72.1922', '72.1923']),
  ],
};
export const KJEDE = 'Kjedetrekk med stålkjede';
export const veranoBetjeningMedium = v(KJEDE, 'Somfy Roll up 28 RTS Li-Ion', 'Sonesse 2 ultra 30 Zigbee Li-Ion');
export const veranoBetjeningLarge = v(KJEDE, 'Sonesse 30 RTS Li-Ion - Batterimotor', 'Somfy Sonesse 40 WT 230V', 'Somfy Sonesse IO 230V');
/** Betjening2 for Verano. Tom liste = ingen undervalg. */
export function veranoUndervalg(b: string) {
  if (b === 'Somfy Roll up 28 RTS Li-Ion' || b === 'Sonesse 30 RTS Li-Ion - Batterimotor') return telisRts;
  if (b === 'Sonesse 2 ultra 30 Zigbee Li-Ion') return v(ingenEksisterende, 'Ysia 1 Zigbee', 'Ysia 5 Zigbee');
  if (b === 'Somfy Sonesse 40 WT 230V') return bryterliste;
  return [];
}
export const veranoKassett = v('Nei', 'Rund kasett', 'Rett kasett');
export const veranoProfilfarge = v('HVIT', 'NATURELL ALU', 'SORT');
export const veranoRegulering = v('Høyre (sett forfra)', 'Venstre (sett forfra)');

// ---------- Insektsnetting ----------
export const insektModell = v('Altho for Vindu - Hvit', 'Altho for Vindu - Sort', 'Altho for Dør - Hvit', 'Altho for Dør - Sort');

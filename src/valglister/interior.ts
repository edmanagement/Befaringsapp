// Interiør: Persienne 25, Lamellgardin, Rullegardin (Verano), Insektsnetting. Ordrett fra eBest (ebest-felt-og-valg.md).
import type { DukGruppe } from '../motor/typer';
import { v } from './felles';

// ---------- Persienne 25 mm (Roulette 25) ----------
export const persienne25Lamellfarge = v(
  '0001=0001', '0002=0065', '0002 PF=P-65', '0017=0258', '0019=0049', '0019 PF=P-49', '0038=0058', '0038 PF=P-58',
  '0061=0010', '0285=0285', '0285 PF=P-285', '0522=0061', '0611=0012', '0717=0717', '0896=0147', '1030=0017',
  '2901=1901', '5104=0104', '8003=8003', '9001=9800', '9007=9007',
);
export const persienne25Betjening = v(
  'Standard m/ snortrekk og vendestav', 'Somfy Tilt & Lift m/ batterilader', 'Somfy Tilt & Lift u/ batterilader',
);

// ---------- Lamellgardin (alltid 89 mm) ----------
const lamell = (navn: string, numre: string[]): DukGruppe => ({ navn, numre, navnIEbest: true });
const lamellTodo = (gr: string): DukGruppe[] => [{
  navn: `Gruppe ${gr}`, numre: [], navnIEbest: false,
  merknad: 'Fargelisten for denne prisgruppen mangler i appen – skriv farge og nummer.', // TODO: fyll inn fra eBest
}];
export const lamellFarger: Record<string, DukGruppe[]> = {
  '1': [
    lamell('Berlin', ['01', '0100', '0120', '0130', '0150', '0600', '0610', '1300', '1320']),
    lamell('Miami', ['000', '001', '002', '051']),
    lamell('Shantung', ['000', '001', '003', '005', '058']),
  ],
  '2': lamellTodo('2'),
  '3': lamellTodo('3'),
  '4': lamellTodo('4'),
};
export const lamellBetjening = v(
  'Føringsstav', 'Motorpakke 1', 'Motorpakke 2', 'Motorpakke 3', 'Standard snor/kjede', 'Spesial snor/kjede',
);

// ---------- Rullegardin (Verano medium / large) ----------
const gv = (navn: string, numre: string[]): DukGruppe => ({ navn, numre, navnIEbest: true });
const r = (fra: number, til: number) => Array.from({ length: til - fra + 1 }, (_, i) => `72.${fra + i}`);

/** Verano-duker per prisgruppe. Lik for medium og large (large har ikke gr. 1). */
export const veranoDuker: Record<string, DukGruppe[]> = {
  '0': [
    gv('CLASSIC semi-transparent', r(1208, 1215)),
    gv('BASIC semi-transparent', [...r(1250, 1259), '72.1402', '72.1403', '72.1408', '72.1431', '72.1448', '72.1458', '72.1481', '72.1482']),
  ],
  '1': [
    gv('CLASSIC BO Plus', r(1314, 1321)),
    gv('ESSENCE transparent', r(1600, 1606)),
    gv('PURE transparent', r(2600, 2606)),
    gv('ORIGIN semi-transparent', r(2630, 2635)),
  ],
  '2': [
    gv('BASIC BO Plus', [...r(1322, 1329), '72.1502', '72.1503', '72.1507', '72.1517', '72.1522', '72.1526', '72.1532', '72.1544', '72.1545', '72.1546', '72.1588']),
    gv('VELVET BO Plus', r(2607, 2613)),
    gv('RUSTIC transparent', r(2614, 2618)),
    gv('LINEN BO Plus', r(2619, 2623)),
  ],
  '3': [gv('SCREEN', [...r(1731, 1737), ...r(1751, 1757)])],
  '5': [
    gv('NATURAL BO Plus', ['72.1667', '72.1668', '72.1669', '72.1671']),
    gv('SCREEN', ['72.1761', '72.1762', '72.1763', '72.1903', '72.1912', '72.1913', '72.1921', '72.1922', '72.1923']),
  ],
};
export const veranoBetjening = v('Kjedetrekk med stålkjede', 'Somfy Roll up 28 RTS Li-Ion', 'Sonesse 2 ultra 30 Zigbee Li-Ion');

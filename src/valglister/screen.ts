// Screen – Scandic Zipscreen V550. Ordrett fra eBest (ebest-felt-og-valg.md, hentet 10.11.2026).
import type { DukGruppe } from '../motor/typer';
import { v } from './felles';

const g = (navn: string, numre: string[]): DukGruppe => ({ navn, numre, navnIEbest: false });

export const screenduk: DukGruppe[] = [
  g('1 %', ['71.1010', '71.1012', '71.1101', '71.1105', '71.1106', '71.1111', '71.1201', '71.1202', '71.1204']),
  g('3 %', ['19.1106', '19.1111', '19.1202', '19.1204', '19.1303', '19.1304', '19.1305']),
  g('5 %', ['71.0100', '71.0101', '71.0102', '71.0103', '71.0104', '71.0105', '71.1101', '71.1105', '71.1106', '71.1111', '71.1201', '71.1202', '71.1204', '71.1205', '71.1206', '71.1207', '71.1218', '71.1220']),
];

export const kassettfarge = v('RAL (egen)', 'Hvit', '9001 Ivory', 'VS716 Strukturert antrasitt', 'VS905 Strukturert sort', 'Eloksert aluminium', 'RAL 7016');

/** Motorer fra eBest-listen for V550, i eBest-rekkefølge. Bryter-motorer og io-motorer har ulike undervalg. */
export const motorerEbest = ['Somfy LT 50', 'LT 50 hull i kasse', 'Maestria WT 50', 'Sunilus 50 io', 'Sunilus 50 io Safeguard', 'Maestria+ 50 io', 'LS 40 Short', 'Sunea 40 io'];
export const motorerBryter = ['Somfy LT 50', 'LT 50 hull i kasse', 'Maestria WT 50', 'LS 40 Short'];
export const motorerIo = ['Sunilus 50 io', 'Sunilus 50 io Safeguard', 'Maestria+ 50 io', 'Sunea 40 io'];
/** Solcellemotor – står IKKE i eBest-listen for V550. Kan bare velges med rett kassett. */
export const motorerImove = ['Solcellemotor imove – hvitt panel', 'Solcellemotor imove – sort panel'];

export const bryterValg = v('Ingen, benytter eksisterende', 'Bryter innfelt', 'Bryter utenpåliggende');
export const fjernkontrollIo = v('Ingen, benytter eksisterende', 'Smoove Origin IO', 'Situo IO Pure', 'Situo IO Pure 5 kanals');
export const fjernkontrollImove = v('Ingen fjernkontroll', 'imove 1-kanal', 'imove 15-kanalers fjernkontroll');

export const kabellengde = v('30 cm med støpt Hirschmann', 'Standard 2,5 m hvit', '5 m hvit', '3 m sort', '5 m sort', '10 m hvit');

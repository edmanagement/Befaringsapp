// Screen – Scandic Zipscreen V550. Ordrett fra eBest (hentet 10.11.2026).
import type { DukGruppe } from '../motor/typer';
import { v, bryterliste, ioFjernkontroller } from './felles';

/** eBest-tekst: «19.1106-3%». */
const g = (navn: string, numre: string[]): DukGruppe => ({ navn, numre, navnIEbest: false, ebestMal: '{n}-{k}' });

export const screenduk: DukGruppe[] = [
  g('1%', ['71.1010', '71.1012', '71.1101', '71.1105', '71.1106', '71.1111', '71.1201', '71.1202', '71.1204']),
  g('3%', ['19.1106', '19.1111', '19.1202', '19.1204', '19.1303', '19.1304', '19.1305']),
  g('5%', ['71.0100', '71.0101', '71.0102', '71.0103', '71.0104', '71.0105', '71.1101', '71.1105', '71.1106', '71.1111', '71.1201', '71.1202', '71.1204', '71.1205', '71.1206', '71.1207', '71.1218', '71.1220']),
];

export const RAL = 'RAL ►';
export const kassettfarge = v(RAL, 'Hvit', '9001 - Ivory', 'VS716 - Strukturert antrasite', 'VS905 - Strukturert sort', 'Eloksert aluminium', 'RAL – 7016');

/** Motorer i eBest-rekkefølge. */
export const motorerBryter = ['Somfy LT 50', 'Somfy LT 50 hull i kasse', 'Somfy Maestria WT 50', 'Somfy LS 40 Short'];
export const motorerIo = ['Somfy Sunilus 50 io', 'Somfy Sunilus 50 io Safeguard', 'Somfy Maestria+ 50 io', 'Somfy Sunea 40 io'];
export const motorerEbest = [
  'Somfy LT 50', 'Somfy LT 50 hull i kasse', 'Somfy Maestria WT 50', 'Somfy Sunilus 50 io',
  'Somfy Sunilus 50 io Safeguard', 'Somfy Maestria+ 50 io', 'Somfy LS 40 Short', 'Somfy Sunea 40 io',
];
/** Solcellemotor – vises i eBest bare når Kassettype = Rett. */
export const motorerImove = ['iMove solar sort panel', 'iMove solar hvit panel'];

export const bryterValg = bryterliste;
export const fjernkontrollIo = ioFjernkontroller;
export const fjernkontrollImove = v('Ingen fjernkontroll', 'iMove fjernkontroll', 'iMove 15 kanalers fjernkontroll');

/** Kabellengde avhenger av motor (eBest). */
const H = '30 cm med støpt Hirchmann';
export function kabellengdeFor(motor: string) {
  if (motor === 'Somfy LT 50' || motor === 'Somfy LT 50 hull i kasse')
    return v(H, 'Standard 2,5m Hvit', 'Tillegg, 5m Hvit', 'Tillegg, 3m Sort', 'Tillegg, 5m Sort', 'Tillegg, 10m Hvit', 'Tillegg, 10m Sort');
  if (motor === 'Somfy Maestria WT 50' || motor === 'Somfy Sunea 40 io')
    return v(H, 'Standard 2,5m Hvit', 'Tillegg, 5m Hvit', 'Tillegg, 3m Sort', 'Tillegg, 5m Sort', 'Tillegg, 10m Hvit');
  if (motor === 'Somfy LS 40 Short') return v(H, 'Tillegg, 3m Sort', 'Tillegg, 5m Sort', 'Tillegg, 10m Hvit');
  if (motorerIo.includes(motor)) return v(H, 'Standard 5m hvit', 'Tillegg, 3m Sort', 'Tillegg, 5m Sort', 'Tillegg, 10m Hvit');
  return [];
}

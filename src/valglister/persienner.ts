// Utvendige persienner: Scandic 80, Scandic 50, Standard 50, Continent 50. Ordrett fra eBest (hentet 10.11.2026).
import { v, bryterliste, ingenEksisterende } from './felles';

export const lamellfarge50 = v('0001', '0010', '0011', '0012', '0049', '0058', '0060', '0065', '0104', '0285', '0717', '1900', '1901', '7016', '9007');
export const lamellfarge80 = v('0001', '0058', '0060', '0285', '0611', '0617', '0619', '0620', '0717', '0734', '0868', '1900', '1901', '7016', '9007');

export const dekkasse50 = v('Ja', 'Nei', 'Nei, kun brakett - dybde 10', 'Nei, kun brakett - dybde 12', 'Nei, kun brakett - dybde 14', 'Nei, kun brakett - dybde 16');
export const dekkassefarge = v('022 - Lys grå', '020 - Hvit', '015 - Sort', '244 - Sink grå', '044M - Antrasitt metallic matt', '035 - Grafittgrå', '045M - Sølv metallic matt');
export const dekkassefarge80 = v('RAL ►', ...dekkassefarge.map((x) => x.tekst));
export const vannbrett = v('Ingen', 'Under', 'Over ►');
export const vannbrettDybde50 = v('0,1 - 1,5cm', '1,6 - 3,5cm', '3,6 - 5,5cm', '5,6 - 7,5cm');
export const vannbrettDybdeStandard50 = v('0,1 - 1,5cm', '1,6 - 3,5cm', '3,6 - 5,5cm');
export const vannbrettDybde80 = v(...Array.from({ length: 9 }, (_, i) =>
  i === 0 ? '0,1 - 0,9cm' : `${i},0 - ${i},9cm`));

export const scandicBetjening = v(
  'Rundragsline (max. 3m²)', 'Sveiv 45 grader', 'Sveiv 90 grader',
  'Persiennemotor 6m²', 'Persiennemotor 10m²', 'Persiennemotor 18m²',
  'Persiennemotor IO 6m²', 'Persiennemotor IO 10m²', 'Persiennemotor IO 18m²',
  'Ingen betjening - Kobles med annen persienne',
);
export const erLine = (b: string) => b.startsWith('Rundragsline');
export const erSveiv = (b: string) => b.startsWith('Sveiv');
export const erLineEllerSveiv = (b: string) => erLine(b) || erSveiv(b);
export const erIoMotor = (b: string) => b.startsWith('Persiennemotor IO');
export const erMotor = (b: string) => b.startsWith('Persiennemotor') && !erIoMotor(b);

const lengder = (l: number[]) => v(...l.map((x) => `Lengde ${x}cm`));
export const linelengde = lengder([75, 100, 125, 150, 175, 200, 250, 300, 400]);
export const sveivlengde = lengder([75, 100, 125, 150, 175, 200]);
export const linelengdeStandard50 = v(...[75, 100, 125, 150, 175, 200, 250, 300, 400].map((x) => `Lengde, ${x}cm`));

export const persienneBryter = bryterliste;
export const persienneFjernkontroll = v(
  ingenEksisterende, 'Smoove Origin IO fjernkontroll', 'Situo IO Pure fjernkontroll', 'Situo IO Pure 5 kanals fjernkontroll',
  'Situo IO Pure fjernkontroll scroll', 'Situo IO Pure 5 kanals fjernkontroll scroll',
);
export const persienneKabel = v(
  'Standard - 3m hvit med koblet hirschmann', 'Standard - 3m sort med koblet hirschmann',
  '10m hvit med koblet hirschmann', '10m sort med koblet hirschmann', '15m hvit med koblet hirschmann', '15m sort med koblet hirschmann',
);

export const reguleringLine = v('Standard regulering, Venstre', 'Standard regulering, Høyre', 'Innfelt regulering, fra Venstre ►', 'Innfelt regulering, fra Høyre ►');
export const reguleringSveiv = v('Standard regulering, Venstre', 'Standard regulering, Midten', 'Standard regulering, Høyre', 'Innfelt regulering, fra Venstre ►', 'Innfelt regulering, fra Høyre ►');
export const reguleringMotor = v('Venstre', 'Midten', 'Høyre');
export const reguleringStandard50 = v('Standard Venstre', 'Standard Høyre', 'Innfelt, fra Venstre', 'Innfelt, fra Høyre');

export const kobles = v('Nei, Frittstående', 'Ja, Venstre ► Rett', 'Ja, Venstre ► Ledd', 'Ja, Høyre ► Rett', 'Ja, Høyre ► Ledd', 'Ja, Begge ► Rett', 'Ja, Begge ► Ledd');
export const koblesAvstand = v('10', '20', '30', '40', '50');

// Scandic 80
export const sideskinne80 = v('Ingen', 'Enkel', 'Dobbel');
/** Skinne- og beinfarge avhenger av lamellfarge. */
export function skinnefarge80(lamell: string) {
  if (['0060', '0717', '0734', '1900', '1901'].includes(lamell)) return v('BRUN', 'RAL ►');
  if (lamell === '0619') return v('SORT');
  if (lamell === '7016') return v('ANTRASITT');
  return v('GRÅ', 'RAL ►');
}
export const beinlengde80 = v('Std 4,5cm', 'Std + ►');
export const ekstraBeinlengde = v(...Array.from({ length: 20 }, (_, i) => `+ ${i + 1}cm`));
export const dekkasse80 = v(
  'Ingen dekkasse', 'Ingen dekkasse, kun brakett', 'Dekkasse [1] - 45º vinkel', 'Dekkasse [2] - 90º vinkel',
  'Dekkasse [1] - 45º m/ Oppbrett', 'Dekkasse [2] - 90º m/ Oppbrett',
);

// Continent 50
export const vendestav = v('Lengde, 25cm', 'Lengde, 55cm', 'Lengde, 75cm');

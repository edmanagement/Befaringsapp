// Utvendige persienner: Scandic 80, Scandic 50, Standard 50, Continent 50. Ordrett fra eBest (ebest-felt-og-valg.md).
import { v } from './felles';

export const lamellfarge50 = v('0001', '0010', '0011', '0012', '0049', '0058', '0060', '0065', '0104', '0285', '0717', '1900', '1901', '7016', '9007');
export const dekkasse50 = v('Ja', 'Nei', 'Nei, kun brakett');
export const dekkasseDybde = v('10', '12', '14', '16');
export const dekkassefarge = v('022 Lys grå', '020 Hvit', '015 Sort', '244 Sink grå', '044M Antrasitt metallic matt', '035 Grafittgrå', '045M Sølv metallic matt');
export const vannbrett = v('Ingen', 'Under', 'Over');
export const vannbrettDybde50 = v('0,1–1,5', '1,6–3,5', '3,6–5,5', '5,6–7,5');
export const vannbrettDybdeStandard50 = v('0,1–1,5', '1,6–3,5', '3,6–5,5');

export const scandicBetjening = v(
  'Rundragsline (maks 3 m²)', 'Sveiv 45°', 'Sveiv 90°',
  'Persiennemotor 6 m²', 'Persiennemotor 10 m²', 'Persiennemotor 18 m²',
  'Persiennemotor IO 6 m²', 'Persiennemotor IO 10 m²', 'Persiennemotor IO 18 m²',
  'Ingen – kobles med annen persienne',
);
export const erLineEllerSveiv = (b: string) => b.startsWith('Rundragsline') || b.startsWith('Sveiv');
export const erIoMotor = (b: string) => b.startsWith('Persiennemotor IO');
export const erMotor = (b: string) => b.startsWith('Persiennemotor') && !erIoMotor(b);

/** Rundragsline-/sveivlengder. Standard 50 har listen ordrett; sveiv går til 200 cm. */
export const linelengde = v('75', '100', '125', '150', '175', '200', '250', '300', '400');
export const sveivlengde = v('75', '100', '125', '150', '175', '200');

export const persienneBryter = v('Ingen, eksisterende', 'innfelt', 'utenpåliggende');
export const persienneFjernkontroll = v('Ingen', 'Smoove Origin IO', 'Situo IO Pure', '5 kanals'); // + scroll-varianter: skriv selv
export const ioKabel = v('3 m hvit', '3 m sort', '10 m hvit', '10 m sort', '15 m hvit', '15 m sort'); // alle med koblet Hirschmann

export const reguleringScandic = v('Standard Venstre', 'Midten', 'Høyre', 'Innfelt fra Venstre', 'Innfelt fra Høyre');
export const reguleringStandard50 = v('Standard Venstre', 'Standard Høyre', 'Innfelt fra Venstre', 'Innfelt fra Høyre');

export const sammenkobling = v('Nei, frittstående', 'Ja – Venstre', 'Ja – Høyre', 'Ja – Begge');
export const sammenkoblingType = v('Rett', 'Ledd');

// Scandic 80
export const sideskinne80 = v('Ingen', 'Enkel', 'Dobbel');
export const beinlengde80 = v('Std 4,5 cm', 'Std + ekstra');
export const dekkasse80 = v('Ingen', 'Ingen, kun brakett', 'Dekkasse [1] 45°', 'Dekkasse [2] 90°', 'Dekkasse [1] 45° m/ oppbrett', 'Dekkasse [2] 90° m/ oppbrett');


// Continent 50
export const vendestav = v('25', '55', '75');

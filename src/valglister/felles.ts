// Valg som går igjen i flere produkter. Tekstene er ordrett fra eBest (ebest-felt-og-valg.md).
import type { Valg } from '../motor/typer';

export const v = (...tekster: string[]): Valg[] => tekster.map((tekst) => ({ tekst }));

export const underlag5 = v('Panel', 'Leca', 'Mur', 'Plater', 'Gips');
export const underlag4 = v('Panel', 'Leca', 'Mur', 'Plater');
export const etasje = v('1', '2', '3', '4', '5', '6', '7', '8', '9', '10+');
export const lift = v('Ja', 'Nei');
export const profilfarge3 = v('Hvit', 'Grå', 'Sort');

/** Hurtigknapper for navn på post. */
export const romForslag = [
  'Stue', 'Stue vest', 'Stue sør', 'Kjøkken', 'Soverom', 'Soverom 2', 'Soverom 3', 'Bad', 'Kontor',
  'Gang', 'Barnerom', 'Vaskerom', 'Terrasse', 'Balkong', 'Veranda', 'Garasje',
];

/** Produktinteresse – samme som i CRM. */
export const produktinteresser = [
  'Dukskift', 'Garasjeport', 'Interiørgardin', 'Markise', 'Pergola', 'Utvendig persienne',
  'Varmepumpe', 'Vindskjerming', 'Zipscreen', 'Annet',
];

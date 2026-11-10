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

// ---------- Somfy-undervalg (Betjening2) – ordrett fra eBest, brukes av mange produkter ----------
export const ingenEksisterende = 'Ingen, benytter eksisterende';
export const bryterliste = v(ingenEksisterende, 'Bryter innfelt', 'Bryter utenpåliggende');
export const ioFjernkontroller = v(ingenEksisterende, 'Smoove Origin IO fjernkontroll', 'Situo IO Pure fjernkontroll', 'Situo IO Pure 5 kanals fjernkontroll');
export const telisRts = v(ingenEksisterende, 'Telis 1 Pure RTS fjernkontroll', 'Telis 4 Pure RTS fjernkontroll', 'Smoove Origin RTS fjernkontroll');
export const sveiv3 = v('Lengde 110cm', 'Lengde 140cm', 'Lengde 180cm');
export const motorkabel3 = v('Standard kabel', 'Tillegg, 5m Sort', 'Tillegg, 10m Hvit');
export const regulering2 = v('Høyre', 'Venstre');
export const vegg = v('Vegg');
export const veggTak = v('Vegg', 'Tak');
export const neiJa = v('Nei', 'Ja');
export const etasje5 = v('1', '2', '3', '4', '5+');

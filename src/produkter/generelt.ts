// Generelt skjema – brukes for produkter som ikke har eget skjema ennå.
import type { Kategori, Produkt } from '../motor/typer';
import { antall, etasjeOgLift, valg } from './felles';
import { v, underlag5 } from '../valglister/felles';
import { ingenRegel } from '../regler/regler';

export function generelt(id: string, navn: string, kategori: Kategori): Produkt {
  return {
    id,
    navn,
    kategori,
    versjon: 1,
    enkelt: true,
    antallFelt: 'antall',
    steg: [
      antall(),
      {
        id: 'bredde', ledetekst: 'Bredde', ebestFelt: 'Bredde', type: 'maal', maaltype: 'ikke angitt',
        hjelp: 'Generelt skjema: målet lagres som tastet, uten regler.', regel: (m) => ingenRegel(m),
      },
      {
        id: 'hoyde', ledetekst: 'Høyde', ebestFelt: 'Høyde', type: 'maal', maaltype: 'ikke angitt',
        hjelp: 'Generelt skjema: målet lagres som tastet, uten regler.', regel: (m) => ingenRegel(m),
      },
      { id: 'farge', ledetekst: 'Farge', type: 'tekst', valgfri: true },
      { id: 'betjening', ledetekst: 'Betjening', type: 'tekst', valgfri: true },
      valg('feste', 'Feste', v('Vegg', 'Tak')),
      valg('underlag', 'Underlag', underlag5),
      ...etasjeOgLift(),
    ],
  };
}

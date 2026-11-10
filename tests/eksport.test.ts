import { describe, expect, it } from 'vitest';
import { byggEksport, byggOppsummering, bildeFilnavn, mappenavn } from '../src/eksport/format';
import { storForbokstav, slug } from '../src/tekst';
import type { Befaring, Post } from '../src/motor/typer';

const b: Befaring = {
  id: 'b1', navn: 'Ola Nordmann', telefon: '900 00 000', adresse: 'Gata 1, 7000 Trondheim', epost: 'ola@eks.no',
  dato: '2026-11-12T14:00', produktinteresse: ['Zipscreen'], sluttkommentar: 'Ring før', fullfort: true,
  opprettet: 0, endret: 0, eksportert: null, kilde: 'manuell',
};
const p: Post = {
  id: 'p1', befaringId: 'b1', rekkefolge: 1, kategori: 'Eksteriør', produktId: 'screen-v550', navn: 'Stue vest',
  bildeIder: ['x', 'y'], bildeHoppetOver: false,
  svar: { storrelse: { verdi: 'V550 M', kilde: 'valgt' }, bunnlist: { verdi: 'Small', kilde: 'valgt' }, motor: { verdi: 'Solcellemotor imove – sort panel', kilde: 'valgt' } },
  maal: { bredde: { maalt_cm: 330, avkryssinger: { sideskinner: true }, manuelt_cm: null }, hoyde: { maalt_cm: 200, avkryssinger: { kassett: true }, manuelt_cm: null } },
  kommentar: 'Husk stige', skjerm: 'ferdig', historikk: [], retur: null, modus: 'ny', ferdig: false, opprettet: 0, endret: 0,
};

describe('eksport', () => {
  const e = byggEksport(b, [p], 'eksportert', new Date('2026-11-12T15:00:00'));
  const post = e.poster[0];
  it('har skjemaversjon og kunde', () => {
    expect(e.skjemaversjon).toBe(1);
    expect(e.befaring.kunde.navn).toBe('Ola Nordmann');
  });
  it('mål har målt, måltype, regel og bestillingsmål', () => {
    const br = post.maal.find((m) => m.id === 'bredde')!;
    expect(br).toMatchObject({ maalt_cm: 330, maaltype: 'netto', bestillingsmaal_cm: 338.2, manuelt_overstyrt: false });
    expect(br.regel).toContain('8,2');
    const h = post.maal.find((m) => m.id === 'hoyde')!;
    expect(h.bestillingsmaal_cm).toBe(216); // M +14, stor bunnlist +2 (tvunget)
  });
  it('felt har kilde – valgt, standard og automatisk', () => {
    const f = (id: string) => post.felt.find((x) => x.id === id)!;
    expect(f('bunnlist')).toMatchObject({ ebest_tekst: 'Large', kilde: 'automatisk' });
    expect(f('kassett_type')).toMatchObject({ ebest_tekst: 'Rett', kilde: 'automatisk' });
    expect(f('sideskinner')).toMatchObject({ ebest_tekst: '2-delt skruer', kilde: 'standard', plassering: 'standardvalg' });
    expect(f('storrelse').kilde).toBe('valgt');
  });
  it('antall ligger på posten, ikke i feltlisten', () => {
    expect(post.antall).toBe(1);
    expect(post.felt.find((x) => x.id === 'antall')).toBeUndefined();
  });
  it('varsler og manglende felt tas med', () => {
    expect(post.varsler.map((v) => v.tekst).join(' ')).toContain('Large');
    expect(post.mangler).toContain('bryter_fjernkontroll');
  });
  it('bildefilnavn og mappenavn', () => {
    expect(post.bilder).toEqual(['01-stue-vest-1.jpg', '01-stue-vest-2.jpg']);
    expect(bildeFilnavn(12, 'Soverom 2 (øst)', 0)).toBe('12-soverom-2-ost-1.jpg');
    expect(mappenavn(b)).toBe('2026-11-12 Ola Nordmann');
  });
  it('oppsummering er lesbar', () => {
    const md = byggOppsummering(e);
    expect(md).toContain('## 1. Stue vest – Screen (Zipscreen V550) – 1 stk');
    expect(md).toContain('målt 330,0 (netto) → **bestilles 338,2**');
    expect(md).toContain('Husk stige');
  });
});

describe('tekst', () => {
  it('stor forbokstav i for- og etternavn', () => {
    expect(storForbokstav('ola nordmann')).toBe('Ola Nordmann');
    expect(storForbokstav('  ANNE-LISE   øverås ')).toBe('Anne-Lise Øverås');
  });
  it('slug', () => expect(slug('Stue vest')).toBe('stue-vest'));
});

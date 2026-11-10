import { describe, expect, it } from 'vitest';
import { alleVarsler, ebestTekst, lagKontekst, mangler, nesteSkjerm } from '../src/motor/motor';
import { honeycell } from '../src/produkter/honeycell';
import { screenV550 } from '../src/produkter/screen-v550';
import type { MaalSvar, Post, Svar } from '../src/motor/typer';

const valgt = (verdi: Svar['verdi']): Svar => ({ verdi, kilde: 'valgt' });
const maal = (cm: number, avk: Record<string, boolean> = {}): MaalSvar => ({ maalt_cm: cm, avkryssinger: avk, manuelt_cm: null });

function post(svar: Record<string, Svar>, m: Record<string, MaalSvar>, ekstra: Partial<Post> = {}): Post {
  return {
    id: 'p', befaringId: 'b', rekkefolge: 1, kategori: 'Eksteriør', produktId: 'screen-v550', navn: 'Test',
    bildeIder: [], bildeHoppetOver: true, svar, maal: m, kommentar: '', skjerm: 'kategori', historikk: [],
    retur: null, modus: 'ny', ferdig: false, opprettet: 0, endret: 0, ...ekstra,
  };
}

describe('Screen i motoren', () => {
  it('tvinger Large bunnlist når bestilt bredde > 320, selv om Small er valgt', () => {
    const p = post({ bunnlist: valgt('Small') }, { bredde: maal(315, { sideskinner: true }) });
    const k = lagKontekst(screenV550, p);
    expect(k.bestilt('bredde')).toBe(323.2);
    expect(k.gjeldende('bunnlist')).toMatchObject({ verdi: 'Large', kilde: 'automatisk' });
  });
  it('går tilbake til valgt verdi når bredden blir smal igjen', () => {
    const p = post({ bunnlist: valgt('Small') }, { bredde: maal(300, { sideskinner: true }) });
    expect(lagKontekst(screenV550, p).gjeldende('bunnlist')).toMatchObject({ verdi: 'Small', kilde: 'valgt' });
  });
  it('stor bunnlist (tvunget) gir +2 på høyde med kassett', () => {
    const p = post({ storrelse: valgt('V550 M') }, { bredde: maal(330), hoyde: maal(200, { kassett: true }) });
    expect(lagKontekst(screenV550, p).bestilt('hoyde')).toBe(216);
  });
  it('standardvalg: Skrå kassett, men Rett når imove er valgt', () => {
    expect(lagKontekst(screenV550, post({}, {})).gjeldende('kassett_type')).toMatchObject({ verdi: 'Skrå', kilde: 'standard' });
    const p = post({ motor: valgt('Solcellemotor imove – sort panel') }, {});
    expect(lagKontekst(screenV550, p).gjeldende('kassett_type')).toMatchObject({ verdi: 'Rett', kilde: 'automatisk' });
  });
  it('fjernkontroll-valg følger motor', () => {
    const k = lagKontekst(screenV550, post({ motor: valgt('Solcellemotor imove – hvitt panel'), bryter_fjernkontroll: valgt('Smoove Origin IO') }, {}));
    // Smoove er ikke gyldig for imove → nullstilles
    expect(k.verdi('bryter_fjernkontroll')).toBeNull();
  });
  it('bryter/fjernkontroll, kabellengde og støpsel har ingen standard', () => {
    const m = mangler(screenV550, post({}, {})).map((s) => s.id);
    expect(m).toEqual(expect.arrayContaining(['bryter_fjernkontroll', 'kabellengde', 'stopsel']));
    expect(m).not.toContain('motor'); // har standard
    expect(m).not.toContain('stromkabel');
  });
  it('imove skjuler strømkabel, kabellengde og støpsel', () => {
    const m = mangler(screenV550, post({ motor: valgt('Solcellemotor imove – hvitt panel') }, {})).map((s) => s.id);
    expect(m).not.toContain('kabellengde');
    expect(m).not.toContain('stopsel');
    const k = lagKontekst(screenV550, post({ motor: valgt('Solcellemotor imove – hvitt panel') }, {}));
    expect(screenV550.steg.filter((s) => ['stromkabel', 'kabellengde', 'stopsel'].includes(s.id)).every((s) => !s.vis!(k))).toBe(true);
  });
  it('varsel over maks for størrelse', () => {
    const v = alleVarsler(screenV550, post({ storrelse: valgt('V550 XS') }, { bredde: maal(350), hoyde: maal(150) }));
    expect(v.some((x) => x.tekst.includes('over maks for XS'))).toBe(true);
  });
  it('screenduk eksporteres med bare nummeret', () => {
    const p = post({ screenduk: valgt({ kolleksjon: '3 %', nummer: '19.1106' }) }, {});
    const k = lagKontekst(screenV550, p);
    expect(ebestTekst(screenV550.steg.find((s) => s.id === 'screenduk')!, k)).toBe('19.1106');
  });
});

describe('Honeycell i motoren', () => {
  it('ugyldig prisgruppe nullstilles når type endres', () => {
    const k = lagKontekst(honeycell, post({ type: valgt('Plissé'), prisgruppe: valgt('4') }, {}, { produktId: 'honeycell' }));
    expect(k.verdi('prisgruppe')).toBeNull();
  });
  it('duk-teksten har kolleksjon foran nummer', () => {
    const p = post({ prisgruppe: valgt('1'), duk: valgt({ kolleksjon: 'MISTRAL', nummer: '7410' }) }, {});
    const k = lagKontekst(honeycell, p);
    expect(ebestTekst(honeycell.steg.find((s) => s.id === 'duk')!, k)).toBe('MISTRAL 7410');
  });
  it('regulering og snorlengde bare for P17xx', () => {
    const uten = mangler(honeycell, post({ plissetype: valgt('P1600') }, {})).map((s) => s.id);
    expect(uten).not.toContain('regulering');
    const med = mangler(honeycell, post({ plissetype: valgt('P1710') }, {})).map((s) => s.id);
    expect(med).toContain('regulering');
  });
  it('laveste høyde bare ved skråvindu', () => {
    expect(mangler(honeycell, post({}, {})).map((s) => s.id)).not.toContain('laveste_hoyde');
    expect(mangler(honeycell, post({ skravindu: valgt('Ja') }, {})).map((s) => s.id)).toContain('laveste_hoyde');
  });
  it('manuell overstyring vinner over beregnet', () => {
    const p = post({}, { bredde: { maalt_cm: 120.4, avkryssinger: {}, manuelt_cm: 119.5 } });
    const k = lagKontekst(honeycell, p);
    expect(k.beregnet('bredde')).toBe(120);
    expect(k.bestilt('bredde')).toBe(119.5);
  });
  it('maks bredde 260 for gruppe 5', () => {
    const v = alleVarsler(honeycell, post({ prisgruppe: valgt('5') }, { bredde: maal(262) }));
    expect(v.some((x) => x.tekst.includes('260'))).toBe(true);
  });
});

describe('Flyt', () => {
  it('kopi hopper over valg som allerede er besvart, men viser målene', () => {
    const p = post({ storrelse: valgt('V550 S') }, {}, { modus: 'kopi' });
    expect(nesteSkjerm('bilde', screenV550, p)).toBe('felt:bredde');
  });
});

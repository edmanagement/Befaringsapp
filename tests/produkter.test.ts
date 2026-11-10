import { describe, expect, it } from 'vitest';
import { produkter } from '../src/produkter';
import { erSynlig, lagKontekst, mangler, valgListe } from '../src/motor/motor';
import type { MaalSvar, Post, Svar } from '../src/motor/typer';
import { byggPost } from '../src/eksport/format';

const valgt = (verdi: Svar['verdi']): Svar => ({ verdi, kilde: 'valgt' });
function post(produktId: string, svar: Record<string, Svar> = {}, maal: Record<string, MaalSvar> = {}): Post {
  return {
    id: 'p', befaringId: 'b', rekkefolge: 1, kategori: null, produktId, navn: 'Test', bildeIder: [], bildeHoppetOver: true,
    svar, maal, kommentar: '', skjerm: 'kategori', historikk: [], retur: null, modus: 'ny', ferdig: false, opprettet: 0, endret: 0,
  };
}

describe('Alle produkter', () => {
  for (const p of produkter) {
    it(`${p.navn}: unike felt-id-er, gyldige standarder, eksport uten feil`, () => {
      const ider = p.steg.map((s) => s.id);
      expect(new Set(ider).size).toBe(ider.length);
      expect(ider).toContain(p.antallFelt);
      const pp = post(p.id);
      const k = lagKontekst(p, pp);
      for (const s of p.steg) {
        erSynlig(s, k);
        if (s.type === 'valg' && typeof s.standard === 'string') expect(valgListe(s, k)).toContain(s.standard);
      }
      expect(Array.isArray(mangler(p, pp))).toBe(true);
      expect(byggPost(pp, 1).produkt.id).toBe(p.id);
    });
  }
});

const finn = (id: string) => produkter.find((p) => p.id === id)!;
const maal = (cm: number, avk: Record<string, boolean> = {}, trinn: number | null = null): MaalSvar =>
  ({ maalt_cm: cm, avkryssinger: avk, manuelt_cm: null, trinn_cm: trinn });

describe('Etappe 2 i motoren', () => {
  it('persienne 25: høyde krever valgt trinn, målt gir forslag', () => {
    const p = finn('persienne-25');
    const k = lagKontekst(p, post(p.id, {}, { hoyde: maal(120.1) }));
    expect(k.beregnet('hoyde')).toBe(122.1);
    expect(k.bestilt('hoyde')).toBeNull();
    expect(mangler(p, post(p.id, {}, { hoyde: maal(120.1) })).map((s) => s.id)).toContain('hoyde');
    expect(lagKontekst(p, post(p.id, {}, { hoyde: maal(120.1, {}, 124.3) })).bestilt('hoyde')).toBe(124.3);
  });
  it('Scandic 50: dekkasse avkrysset som standard, kan fjernes', () => {
    const p = finn('scandic-50');
    expect(lagKontekst(p, post(p.id, {}, { hoyde: maal(85) })).beregnet('hoyde')).toBe(101.0);
    expect(lagKontekst(p, post(p.id, {}, { hoyde: maal(85, { dekkasse: false }) })).beregnet('hoyde')).toBe(88.4);
  });
  it('Scandic 50: bredde +10, sammenkobling standard «Nei, frittstående»', () => {
    const p = finn('scandic-50');
    const k = lagKontekst(p, post(p.id, {}, { bredde: maal(120) }));
    expect(k.bestilt('bredde')).toBe(130);
    expect(k.gjeldende('sammenkobling')).toMatchObject({ verdi: 'Nei, frittstående', kilde: 'standard' });
  });
  it('Scandic 50: undervalg følger betjening', () => {
    const p = finn('scandic-50');
    const io = mangler(p, post(p.id, { betjening: valgt('Persiennemotor IO 10 m²') })).map((s) => s.id);
    expect(io).toEqual(expect.arrayContaining(['fjernkontroll', 'kabel']));
    expect(io).not.toContain('linelengde');
    const line = mangler(p, post(p.id, { betjening: valgt('Rundragsline (maks 3 m²)') })).map((s) => s.id);
    expect(line).toContain('linelengde');
    expect(line).not.toContain('kabel');
  });
  it('lamellgardin: høyde etter gulv/karm', () => {
    const p = finn('lamellgardin');
    expect(lagKontekst(p, post(p.id, { hoyde_til: valgt('Til gulv') }, { hoyde: maal(240) })).bestilt('hoyde')).toBe(238);
    expect(lagKontekst(p, post(p.id, { hoyde_til: valgt('I vinduskarm') }, { hoyde: maal(150) })).bestilt('hoyde')).toBe(149);
  });
  it('lamellgardin: skrålamell gir bruttomål A–D og vinkel', () => {
    const p = finn('lamellgardin');
    const m = mangler(p, post(p.id, { skralamell: valgt('Ja, fra V ► H') })).map((s) => s.id);
    expect(m).toEqual(expect.arrayContaining(['skra_a', 'skra_b', 'skra_c', 'skra_d', 'skra_vinkel']));
    expect(mangler(p, post(p.id)).map((s) => s.id)).not.toContain('skra_a');
  });
  it('Zipscreen Mini: lysåpning avkrysset som standard (−1)', () => {
    const p = finn('zipscreen-mini');
    expect(lagKontekst(p, post(p.id, {}, { bredde: maal(150) })).bestilt('bredde')).toBe(149);
  });
  it('terrassemarkise: Spesial duk gir spesialfarge, Trendline gir egne valg', () => {
    const p = finn('terrassemarkise');
    const m = mangler(p, post(p.id, { duktype: valgt('Spesial') })).map((s) => s.id);
    expect(m).toContain('spesialfarge');
    expect(m).not.toContain('dukfarge');
    const k = lagKontekst(p, post(p.id, { modell: valgt('Trendline') }));
    expect(valgListe(p.steg.find((s) => s.id === 'feste') as never, k)).toContain('Tak skrått');
  });
  it('vindusmarkise: +20, vannrett +10, armlengde og motorvarsel', () => {
    const p = finn('vindusmarkise');
    const k = lagKontekst(p, post(p.id, {}, { bredde: maal(190), armlengde: maal(155) }));
    expect(k.bestilt('bredde')).toBe(210);
    expect(k.bestilt('armlengde')).toBe(80);
    expect(lagKontekst(p, post(p.id, {}, { bredde: maal(190, { vannrett: true }) })).bestilt('bredde')).toBe(200);
  });
  it('Continent 50: maks bredde 180 og maks 3,2 m²', () => {
    const p = finn('continent-50');
    const s = p.steg.find((x) => x.id === 'bredde')!;
    const k = lagKontekst(p, post(p.id, {}, { bredde: maal(181.5) }));
    expect(s.varsler!(k).join(' ')).toContain('180');
    const k2 = lagKontekst(p, post(p.id, {}, { bredde: maal(179.5), hoyde: maal(200, {}, 203.0) }));
    expect(s.varsler!(k2).join(' ')).toContain('3,2 m²');
    expect(s.varsler!(lagKontekst(p, post(p.id, {}, { bredde: maal(119.5) })))).toEqual([]);
  });
});

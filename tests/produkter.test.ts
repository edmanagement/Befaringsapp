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
    expect(k.gjeldende('sammenkobling')).toMatchObject({ verdi: 'Nei, Frittstående', kilde: 'standard' });
  });
  it('Scandic 50: undervalg følger betjening', () => {
    const p = finn('scandic-50');
    const io = lagKontekst(p, post(p.id, { betjening: valgt('Persiennemotor IO 10m²') }));
    expect(valgListe(p.steg.find((s) => s.id === 'betjening2') as never, io)).toContain('Situo IO Pure fjernkontroll scroll');
    expect(io.gjeldende('kabel')).toMatchObject({ verdi: 'Standard - 3m hvit med koblet hirschmann', kilde: 'standard' });
    const line = lagKontekst(p, post(p.id, { betjening: valgt('Rundragsline (max. 3m²)') }));
    expect(valgListe(p.steg.find((s) => s.id === 'betjening2') as never, line)).toContain('Lengde 400cm');
    expect(valgListe(p.steg.find((s) => s.id === 'regulering') as never, line)).not.toContain('Standard regulering, Midten');
  });
  it('lamellgardin: høyde etter gulv/karm', () => {
    const p = finn('lamellgardin');
    expect(lagKontekst(p, post(p.id, { hoyde_til: valgt('Til gulv') }, { hoyde: maal(240) })).bestilt('hoyde')).toBe(238);
    expect(lagKontekst(p, post(p.id, { hoyde_til: valgt('I vinduskarm') }, { hoyde: maal(150) })).bestilt('hoyde')).toBe(149);
  });
  it('lamellgardin: skrålamell gir bruttomål A–D og vinkel', () => {
    const p = finn('lamellgardin');
    const m = mangler(p, post(p.id, { skralamell: valgt('Ja, fra V ► H') })).map((s) => s.id);
    expect(m).toEqual(expect.arrayContaining(['skra_c', 'skra_d']));
    expect(m).not.toContain('skra_a');
    expect(mangler(p, post(p.id)).map((s) => s.id)).not.toContain('skra_c');
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
    expect(valgListe(p.steg.find((s) => s.id === 'feste') as never, k)).toContain('Tak, skrått');
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

describe('eBest-data (10.11.2026)', () => {
  const vl = (id: string, steg: string, svar: Record<string, Svar> = {}) => {
    const p = finn(id);
    return valgListe(p.steg.find((s) => s.id === steg) as never, lagKontekst(p, post(p.id, svar)));
  };
  it('lamell: skrå gir ingen fratrekk, hver side fjerner føringsstav', () => {
    const p = finn('lamellgardin');
    const k = lagKontekst(p, post(p.id, { skralamell: valgt('Ja, fra V ► H'), hoyde_til: valgt('Til gulv') }, { bredde: maal(150), hoyde: maal(200) }));
    expect(k.bestilt('bredde')).toBe(150);
    expect(k.bestilt('hoyde')).toBe(200);
    expect(vl('lamellgardin', 'betjening', { parkering: valgt('Hver side') })).not.toContain('Føringsstav ►');
  });
  it('lamell: farge eksporteres som «BERLIN C BO - 5100»', () => {
    const p = finn('lamellgardin');
    const k = lagKontekst(p, post(p.id, { prisgruppe: valgt('2'), farge_lamell: valgt({ kolleksjon: 'BERLIN C BO', nummer: '5100' }) }));
    expect(byggPost(post(p.id, { prisgruppe: valgt('2'), farge_lamell: valgt({ kolleksjon: 'BERLIN C BO', nummer: '5100' }) }), 1)
      .felt.find((f) => f.id === 'farge_lamell')?.ebest_tekst).toBe('BERLIN C BO - 5100');
    expect(k.verdi('prisgruppe')).toBe('2');
  });
  it('Verano: «72.1322 - BASIC - BO PLUS», og undervalg etter motor', () => {
    const pp = post('rullegardin', { prisgruppe: valgt('2'), duk: valgt({ kolleksjon: 'BASIC - BO PLUS', nummer: '72.1322' }) });
    expect(byggPost(pp, 1).felt.find((f) => f.id === 'duk')?.ebest_tekst).toBe('72.1322 - BASIC - BO PLUS');
    expect(vl('rullegardin', 'betjening2', { betjening: valgt('Sonesse 2 ultra 30 Zigbee Li-Ion') })).toContain('Ysia 5 Zigbee');
    expect(vl('rullegardin', 'betjening', { modell: valgt('Verano large') })).toContain('Somfy Sonesse 40 WT 230V');
  });
  it('V550: kabellengde følger motor, iMove har egne fjernkontroller', () => {
    expect(vl('screen-v550', 'kabellengde', { motor: valgt('Somfy LS 40 Short') })).not.toContain('Standard 2,5m Hvit');
    expect(vl('screen-v550', 'kabellengde', { motor: valgt('Somfy Sunilus 50 io') })).toContain('Standard 5m hvit');
    expect(vl('screen-v550', 'bryter_fjernkontroll', { motor: valgt('iMove solar hvit panel') })).toContain('iMove 15 kanalers fjernkontroll');
  });
  it('terrasse: Eolis bare med Sunilus, Premium har ikke tak', () => {
    expect(vl('terrassemarkise', 'vindsikring', { modell: valgt('Premium'), betjening: valgt('Somfy Sunilus io 30/17') })).toContain('Ja, Eolis 3D sensor io');
    expect(vl('terrassemarkise', 'vindsikring', { modell: valgt('Premium'), betjening: valgt('Standard m/ sveiv') })).not.toContain('Ja, Eolis 3D sensor io');
    const p = finn('terrassemarkise');
    expect(erSynlig(p.steg.find((s) => s.id === 'tak')!, lagKontekst(p, post(p.id, { modell: valgt('Premium') })))).toBe(false);
  });
  it('Scandic 80: skinnefarge følger lamellfarge', () => {
    expect(vl('scandic-80', 'skinnefarge', { lamellfarge: valgt('0717') })).toEqual(['BRUN', 'RAL ►']);
    expect(vl('scandic-80', 'skinnefarge', { lamellfarge: valgt('7016') })).toEqual(['ANTRASITT']);
  });
  it('garasjeport: glatte modeller har flere farger', () => {
    expect(vl('garasjeport', 'farge', { modell: valgt('GS Slick') })).toContain('Standard - Sort 9005');
    expect(vl('garasjeport', 'farge', { modell: valgt('GS Flush') })).not.toContain('Standard - Sort 9005');
  });
});

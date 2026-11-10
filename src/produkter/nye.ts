// Kurvmarkise, kassettmarkise, dukskift, levegg, sidemarkise, glassløsninger, garasjeport og pergola.
// Felt og valg ordrett fra eBest (hentet 10.11.2026).
import type { K, MaalSteg, Produkt, Steg } from '../motor/typer';
import { antall, etasjeOgLift, valg } from './felles';
import { markiseDukSteg, heleCm } from './eksterior';
import {
  v, underlag4, etasje5, bryterliste, ioFjernkontroller, telisRts, ingenEksisterende, neiJa, veggTak,
} from '../valglister/felles';
import * as M from '../valglister/markise';
import { ingenRegel } from '../regler/regler';

const s = (k: K, id: string) => String(k.verdi(id) ?? '');
const maal = (id: string, ledetekst: string, ekstra: Partial<MaalSteg> = {}): MaalSteg => ({
  id, ledetekst, ebestFelt: ledetekst, type: 'maal', maaltype: 'ikke angitt',
  hjelp: 'Målet bestilles som tastet.', regel: (m) => ingenRegel(m), ...ekstra,
});
const tekst = (id: string, ledetekst: string, ekstra: Partial<Steg> = {}): Steg =>
  ({ id, ledetekst, ebestFelt: ledetekst, type: 'tekst', ...ekstra } as Steg);
const ja = (id: string) => (k: K) => k.verdi(id) === 'Ja';

// ---------- Kurvmarkise ----------
export const kurvmarkise: Produkt = {
  id: 'kurvmarkise', navn: 'Kurvmarkise', kategori: 'Eksteriør', versjon: 1,
  ebestSti: 'Eksteriør > Fasademarkiser > Kurvmarkise', antallFelt: 'antall',
  steg: [
    valg('type', 'Type', M.kurvType),
    antall(),
    maal('bredde', 'Bredde', { varsler: (k) => heleCm('Bredde', k.bestilt('bredde')) }),
    maal('utfall', 'Utfall'),
    ...markiseDukSteg(),
    valg('pyntelist', 'Pyntelist', M.pyntelist, { hjelp: 'Spesial ►: skriv selv.' }),
    valg('betjening', 'Betjening', M.kurvBetjening),
    valg('regulering', 'Regulering', v('Høyre', 'Venstre')),
    valg('feste', 'Feste', veggTak),
    valg('underlag', 'Underlag', underlag4),
    ...etasjeOgLift(),
  ],
};

// ---------- Kassettmarkise (Verano Ipanema / Santander) ----------
const erSantander = (k: K) => s(k, 'modell').startsWith('Santander');
const erPalermo = (k: K) => s(k, 'modell').startsWith('Palermo');
export const kassettmarkise: Produkt = {
  id: 'kassettmarkise', navn: 'Kassettmarkise (Verano)', kategori: 'Eksteriør', versjon: 1,
  ebestSti: 'Eksteriør > Terrassemarkiser > Kassett', antallFelt: 'antall',
  steg: [
    valg('modell', 'Modell', M.kassettModell, {
      ebestFelt: 'Stativfarge (modell)',
      varsler: (k) => (erPalermo(k) ? ['Palermo har ikke målskjema i eBest – legges inn manuelt.'] : []),
    }),
    antall(),
    maal('bredde', 'Bredde', { varsler: (k) => heleCm('Bredde', k.bestilt('bredde')) }),
    valg('utfall', 'Utfall', M.utfall, { hjelp: 'Mulige utfall avhenger av bredden – eBest avgjør.' }),
    valg('farge', 'Farge', [], { valg: (k) => (erSantander(k) ? M.kassettFargeSantander : M.kassettFargeIpanema) }),
    tekst('spesialfarge', 'SpesialFarge', { ledetekst: 'RAL-farge', vis: (k) => k.verdi('farge') === M.RAL_KASSETT }),
    valg('duktype', 'Duktype', v('Trend Colors', 'Urban Colors'), { ebestFelt: 'DukType' }),
    { id: 'dukfarge', ledetekst: 'Dukfarge', ebestFelt: 'Dukfarge', type: 'duk', hjelp: 'Tast nummeret for å søke.', grupper: (k) => M.kassettDuker[s(k, 'duktype')] ?? [] },
    valg('armer', 'Armer', v('2', '3'), { vis: erSantander }),
    valg('led', 'LED-belysning', v('Ja', 'Nei'), { ebestFelt: 'LedBelysning', vis: (k) => !erSantander(k) }),
    valg('betjening', 'Betjening', M.kassettBetjening),
    valg('betjening2', 'Fjernkontroll / bryter', [], { ebestFelt: 'Betjening2', valg: (k) => M.markiseUndervalg(s(k, 'betjening')) }),
    valg('kabel', 'Kabel', M.kassettKabel, { standard: 'Standard kabel' }),
    valg('regulering', 'Regulering', v('Høyre', 'Venstre')),
    valg('feste', 'Feste', [], { valg: (k) => (erSantander(k) ? v('Vegg') : veggTak) }),
    valg('brakett', 'Brakett', M.kassettBrakett, { vis: (k) => !erSantander(k) }),
    valg('underlag', 'Underlag', underlag4),
    ...etasjeOgLift(),
  ],
};

// ---------- Dukskift ----------
const dukskiftType = (k: K) => s(k, 'type');
const erT = (...t: string[]) => (k: K) => t.includes(dukskiftType(k));
const MALJER = v('Nei', 'Ja, fordeles jevnt ►', 'Ja, spesiell fordeling ►');
export const dukskift: Produkt = {
  id: 'dukskift', navn: 'Dukskift', kategori: 'Eksteriør', versjon: 2,
  ebestSti: 'Eksteriør > Duk', antallFelt: 'antall',
  steg: [
    valg('type', 'Hva skal byttes?', v('Duk terrassemarkise', 'Duk vindusmarkise', 'Kappe', 'Balkongtrekk / sydd duk', 'Screenduk'), { ebestFelt: 'Artikkel' }),
    valg('screen_type', 'Screenduk', v('Screenduk 1 %', 'Screenduk 3 %', 'Screenduk 5 %', 'Sveiset duk'), { ebestFelt: 'Artikkel', vis: erT('Screenduk') }),
    valg('terrasse_type', 'Duktype terrasse', v('Standard', 'Soltis 86 og 96', 'Soltis. Serge og sunscreen'), {
      ebestFelt: 'Artikkel', vis: erT('Duk terrassemarkise'),
      varsler: (k) => (k.verdi('terrasse_type') === 'Soltis 86 og 96' ? ['Soltis 86 og 96 har ikke målskjema i eBest.'] : []),
    }),
    antall(),
    maal('bredde', 'Bredde', { vis: (k) => !erT('Kappe')(k) }),
    maal('utfall', 'Utfall', { vis: erT('Duk terrassemarkise', 'Duk vindusmarkise') }),
    maal('hoyde', 'Høyde', { vis: erT('Balkongtrekk / sydd duk', 'Screenduk') }),
    valg('duktype_sydd', 'Duktype', v('Dukskift', 'Balkongtrekk'), { ebestFelt: 'Duktype', vis: erT('Balkongtrekk / sydd duk') }),
    ...markiseDukSteg().map((x) => ({ ...x, vis: (k: K) => erT('Duk terrassemarkise', 'Duk vindusmarkise', 'Balkongtrekk / sydd duk')(k) && (x.vis ? x.vis(k) : true) } as Steg)),
    tekst('dukfarge_tekst', 'Dukfarge', { vis: erT('Kappe', 'Screenduk') }),
    valg('kappe_k', 'Kappe', M.kappe, { ebestFelt: 'Kappe', vis: erT('Kappe') }),
    valg('kantband_k', 'Kantbånd', v('Ja', 'Ingen'), { ebestFelt: 'Kantbånd', vis: erT('Kappe') }),
    valg('kantband_farge_k', 'Farge kantbånd', M.kantbandFarge, { ebestFelt: 'Kantbånd farge', vis: (k) => erT('Kappe')(k) && k.verdi('kantband_k') === 'Ja' }),
    valg('maljer', 'Maljer', MALJER, { vis: erT('Balkongtrekk / sydd duk', 'Screenduk'), standard: 'Nei' }),
    { id: 'antall_maljer', ledetekst: 'Antall maljer', ebestFelt: 'AntallMaljer', type: 'tall', heltall: true, vis: (k) => s(k, 'maljer').startsWith('Ja') },
    valg('etasje', 'Etasje', etasje5, { vis: erT('Duk terrassemarkise', 'Duk vindusmarkise', 'Kappe') }),
  ],
};

// ---------- Levegg ----------
export const levegg: Produkt = {
  id: 'levegg', navn: 'Levegg', kategori: 'Eksteriør', versjon: 2,
  ebestSti: 'Eksteriør > Levegg', antallFelt: 'antall',
  steg: [
    valg('duk_type', 'Type', v('Acryl', 'Screen'), { ebestFelt: 'Artikkel' }),
    valg('modell', 'Farge stativ', v('Hvit (RAL 9010)', 'Grå (RAL 9006)'), { ebestFelt: 'Modell' }),
    antall(),
    maal('bredde', 'Bredde'),
    maal('hoyde', 'Høyde'),
    tekst('dukfarge', 'Dukfarge'),
    valg('styreskinne', 'Styreskinne', v('Ingen', 'Høyre side', 'Venstre side', 'Begge sider')),
    valg('regulering', 'Regulering', v('Høyre', 'Venstre')),
    valg('sveivlengde', 'Sveivlengde', v('Lengde sveiv, 100cm', 'Lengde sveiv, 140cm', 'Lengde sveiv, 180cm')),
    valg('vindu', 'Vindu i duken?', neiJa, { ebestFelt: undefined, standard: 'Nei' }),
    ...(['Vindu fra venstre', 'Vindu høyde', 'Vindu fra høyre', 'Vindu fra bunn'] as const).map((l, i) =>
      maal(['vindu_venstre', 'vindu_hoyde', 'vindu_hoyre', 'vindu_bunn'][i], l, { vis: ja('vindu') })),
    valg('feste', 'Feste', veggTak),
    valg('underlag', 'Underlag', underlag4),
  ],
};

// ---------- Sidemarkise ----------
export const sidemarkise: Produkt = {
  id: 'sidemarkise', navn: 'Sidemarkise', kategori: 'Eksteriør', versjon: 1,
  ebestSti: 'Eksteriør > Levegg > Sidemarkise', antallFelt: 'antall',
  steg: [
    valg('modell', 'Modell', v('Acrylduk', 'Screenduk')),
    antall(),
    maal('bredde', 'Bredde'),
    maal('hoyde', 'Høyde'),
    { id: 'dukfarge', ledetekst: 'Dukfarge', ebestFelt: 'Dukfarge', type: 'duk', hjelp: 'Tast nummeret for å søke.', grupper: () => M.markiseDuker.Standard },
    valg('profilfarge', 'Profilfarge', v('Hvit', 'Grå', 'Sort', 'Antrasitt')),
    valg('regulering', 'Regulering', v('Høyre', 'Venstre')),
    valg('feste', 'Feste', v('Vegg'), { plassering: 'standardvalg', standard: 'Vegg' }),
    valg('underlag', 'Underlag', underlag4),
    ...(['Securestop', 'Stolpe', 'Universalvinkel', 'SkinneHjul', 'EkstraHåndtak'] as const).map((l) =>
      valg(l.toLowerCase().replace('å', 'a'), l, neiJa, { plassering: 'standardvalg', standard: 'Nei' })),
  ],
};

// ---------- Glassløsninger ----------
const glass = (k: K) => s(k, 'system');
const erSkyve = (k: K) => ['Olivera', 'Olivera RAL', 'Vadella skyvedør', 'Vadella skyvedør midtdelt'].includes(glass(k));
const erNova = (k: K) => glass(k).startsWith('Nova');
const erLuderitz = (k: K) => glass(k) === 'Luderitz';
function luderitzUndervalg(b: string) {
  if (b === 'SOMFY LT 50') return bryterliste;
  if (b === 'SOMFY SUNILUS 50 IO') return ioFjernkontroller;
  if (b === 'SOMFY ALTUS 50 RTS') return telisRts;
  return [];
}
const fot = v('Rett', 'Hjørne skjerm [B] innside', 'Hjørne skjerm [B] utside');
export const glasslosninger: Produkt = {
  id: 'glasslosninger', navn: 'Glassløsninger', kategori: 'Eksteriør', versjon: 2,
  ebestSti: 'Eksteriør > Glassløsninger', antallFelt: 'antall',
  steg: [
    valg('system', 'System', v('Olivera', 'Olivera RAL', 'Vadella skyvedør', 'Vadella skyvedør midtdelt',
      'Nova treverk', 'Nova treverk RAL', 'Nova aluminium', 'Nova aluminium RAL', 'Luderitz', 'Tofino'), {
      ebestFelt: 'Artikkel',
      varsler: (k) => (glass(k) === 'Tofino' ? ['Tofino har ikke målskjema i eBest – legges inn manuelt.'] : []),
    }),
    antall(),
    maal('bredde', 'Bredde'),
    maal('hoyde', 'Høyde'),
    // Olivera / Vadella
    valg('farge', 'Farge', [], {
      valg: (k) => (erLuderitz(k) ? v('Antrasitt strukturert (VS716)', 'Spesial RAL ►') : v('Hvit', 'Antrasitt strukturert (VS716)')),
      vis: (k) => erSkyve(k) || erLuderitz(k) || erNova(k),
    }),
    tekst('ral', 'RAL', { vis: (k) => k.verdi('farge') === 'Spesial RAL ►' || /RAL/.test(glass(k)) }),
    valg('profilfarge', 'Profilfarge', v('Hvit', 'Antrasitt strukturert (VS716)', 'Brun oljebehandlet', 'Grå'), { ebestFelt: 'ProfilFarge', vis: erNova }),
    valg('bunnskinnefarge', 'Bunnskinnefarge', v('Eloksert sølv', 'Eloksert sort'), { vis: (k) => erSkyve(k) || erNova(k) }),
    valg('bunnskinne', 'Bunnskinne', v('Ingen', 'Nedfelt', 'Skråkant'), { vis: (k) => erSkyve(k) || erNova(k) }),
    { id: 'forlengelse_bunnskinne', ledetekst: 'Forlengelse bunnskinne', ebestFelt: 'ForlengelseBunnskinne', type: 'tall', enhet: 'cm', valgfri: true, vis: erNova },
    valg('tetningslist', 'Tetningslist glass', v('Ja - Standard', 'Nei'), { ebestFelt: 'TetningslistGlass', vis: erSkyve, standard: 'Ja - Standard' }),
    valg('vegglist', 'Vegglist', v('Ja - Standard', 'Nei'), { vis: erSkyve, standard: 'Ja - Standard' }),
    valg('parkering', 'Parkering', v('Venstre', 'Høyre'), { vis: erSkyve }),
    tekst('las', 'Lås', { vis: erSkyve, valgfri: true }),
    tekst('handtak', 'Håndtak', { vis: erSkyve, valgfri: true }),
    { id: 'forlengelse_v', ledetekst: 'Forlengelse venstre', ebestFelt: 'ForlengelseVenstre', type: 'tall', enhet: 'cm', valgfri: true, vis: erSkyve },
    { id: 'forlengelse_h', ledetekst: 'Forlengelse høyre', ebestFelt: 'ForlengelseHøyre', type: 'tall', enhet: 'cm', valgfri: true, vis: erSkyve },
    // Luderitz
    valg('glass', 'Glass', v('Standard 5mm', 'Frostet 5mm', 'Laminert 6mm - Klart', 'Farget 6mm - Grå', 'Farget 6mm - Grønn', 'Fraget 6mm - Bronsje'), { vis: erLuderitz }),
    valg('regulering', 'Regulering', v('Høyre', 'Venstre'), { vis: erLuderitz }),
    valg('betjening', 'Betjening', v('SOMFY LT 50', 'SOMFY SUNILUS 50 IO', 'SOMFY ALTUS 50 RTS'), { vis: erLuderitz }),
    valg('betjening2', 'Fjernkontroll / bryter', [], { ebestFelt: 'Betjening2', valg: (k) => luderitzUndervalg(s(k, 'betjening')), vis: erLuderitz }),
    valg('sidestolpe', 'Forlenget sidestolpe', v('Nei - Standard', 'Venstre', 'Høyre', 'Begge'), { ebestFelt: 'ForlengetSidestolpe', vis: erLuderitz, standard: 'Nei - Standard' }),
    valg('fot_v', 'Fot venstre', fot, { ebestFelt: 'FotVenstre', vis: erLuderitz }),
    valg('fot_h', 'Fot høyre', fot, { ebestFelt: 'FotHøyre', vis: erLuderitz }),
    valg('ral_fot', 'RAL fot', v('Ja', 'Nei'), { ebestFelt: 'RALFoot', vis: erLuderitz, plassering: 'standardvalg', standard: 'Nei' }),
    valg('toppdeksel', 'Toppdeksel skjerm', v('Ja', 'Nei'), { ebestFelt: 'ToppdekselSkjerm', vis: erLuderitz, plassering: 'standardvalg' }),
    valg('skjult_sammenkobling', 'Skjult sammenkobling', v('Ja', 'Nei'), { ebestFelt: 'SkjultSammenkobling', vis: erLuderitz, plassering: 'standardvalg', standard: 'Nei' }),
    valg('underlag', 'Underlag', underlag4),
    ...etasjeOgLift(),
  ],
};

// ---------- Garasjeport ----------
const erGlatt = (k: K) => /Slick|Micro/.test(s(k, 'modell'));
const fargeTre = v('Standard - Hvit 9010', 'Standard - Antrasitt 7016', 'Klarlakk - Hvit 9010', 'Klarlakk - Antrasitt 7016', 'Valgfri RAL ►');
const fargeGlatt = v(
  'Standard - Hvit 9010', 'Standard - Antrasitt 7016', 'Standard - Antrasitt strukturert 7016', 'Standard - Sort 9005',
  'Struktur - Sort struktur 9005', 'Klarlakk - Hvit 9010', 'Klarlakk - Antrasitt 7016', 'Klarlakk - Antrasitt strukturert 7016',
  'Klarlakk - Sort 9005', 'Klarlakk - Sort struktur 9005', 'Valgfri RAL ►',
);
const DEXO = 'Dexo Compact 750 inkl. 2 fjernk.';
export const garasjeport: Produkt = {
  id: 'garasjeport', navn: 'Garasjeport', kategori: 'Garasjeporter', versjon: 2,
  ebestSti: 'Garasjeporter > Leddheisport', antallFelt: 'antall',
  steg: [
    valg('modell', 'Modell', v('GS Flush', 'GS Fylling', 'GS Midtrib', 'GS Panel', 'GS Slick', 'GS Micro', 'GS Midtrib Slick', 'GS Toprib Slick'), {
      ebestFelt: 'Artikkel', hurtig: ['GS Flush', 'GS Midtrib', 'GS Slick', 'GS Midtrib Slick'],
      hjelp: 'Trestruktur: Flush, Fylling, Midtrib, Panel. Glatt: Slick, Micro, Midtrib Slick, Toprib Slick.',
    }),
    antall(),
    maal('bredde', 'Bredde', { hjelp: 'Mål åpningen. Målet bestilles som tastet.' }),
    maal('hoyde', 'Høyde', { hjelp: 'Mål åpningen. Målet bestilles som tastet.' }),
    maal('hn', 'Hn', { ledetekst: 'Nisjehøyde (Hn)', hjelp: 'Høyde fra toppen av åpningen til taket.' }),
    valg('betjening', 'Betjening', v('Manuell m/lås og håndtak', DEXO)),
    valg('betjening2', 'Føringsskinne', v('Føringsskinne 3,5m m/ belte'), { ebestFelt: 'Betjening2', vis: (k) => k.verdi('betjening') === DEXO, standard: 'Føringsskinne 3,5m m/ belte' }),
    maal('b_venstre', 'B venstre', { ledetekst: 'Sideplass venstre (b)' }),
    maal('b_hoyre', 'B høyre', { ledetekst: 'Sideplass høyre (b)' }),
    valg('farge', 'Farge', [], { valg: (k) => (erGlatt(k) ? fargeGlatt : fargeTre) }),
    tekst('ral', 'RALfarge', { ledetekst: 'RAL-farge', vis: (k) => k.verdi('farge') === 'Valgfri RAL ►' }),
    valg('bunnpakning', 'Bunnpakning', v('Standard', 'Ekstra myk'), { standard: 'Standard' }),
    valg('vegg', 'Vegg', v('Treverk', 'Betong - mur', 'Betong - porrøs')),
    valg('tak', 'Tak', v('Treverk', 'Betong')),
  ],
};

// ---------- Pergola ----------
const erX = (k: K) => s(k, 'modell').startsWith('X-L');
const erVeranoPergola = (k: K) => s(k, 'modell').startsWith('Verano');
const pergolaBryter = v('Ingen bryter, benytter eksisterende', 'Bryter innfelt', 'Bryter utenpåliggende', 'Centralis Uno IB VB');
const pergolaFjern = v(
  'Ingen fjernkontroll, benytter eksisterende', 'Telis 1 Pure RTS fjernkontroll', 'Telis 1 Lounge RTS fjernkontroll',
  'Telis 4 Silver RTS fjernkontroll', 'Telis 4 Lounge RTS fjernkontroll', 'Smoove Origin RTS fjernkontroll',
  'Smoove Origin IO fjernkontroll', 'Situo IO Pure fjernkontroll',
);
const pergolaBetjening = ['Motorstyring for bryter', 'Motorstyring for fjernkontroll', 'Motorstyring for IO motor'];
export const pergola: Produkt = {
  id: 'pergola', navn: 'Pergola', kategori: 'Eksteriør', versjon: 2,
  ebestSti: 'Eksteriør > Pergola', antallFelt: 'antall',
  steg: [
    valg('modell', 'Modell', v('Pergoline', 'Pergo-zip', 'X-Line', 'X-Light',
      ...['Lugano', 'Riva', 'Serena rett', 'Serena skrå', 'Biarritz', 'Martinique', 'Rapallo', 'Ritz Screen XL', 'Arezzo', 'Tumba A', 'Tubma B', 'Hamar', 'Salo A'].map((x) => `Verano ${x}`)), {
      ebestFelt: 'Artikkel', hurtig: ['Pergoline', 'Pergo-zip', 'X-Line', 'X-Light'],
      varsler: (k) => (erVeranoPergola(k) ? ['Verano-pergolaer er ikke kartlagt i appen – skriv detaljene i kommentar.'] : []),
    }),
    antall(),
    maal('bredde', 'Bredde'),
    maal('utfall', 'Utfall'),
    maal('stolpelengde', 'Stolpelengde', { vis: (k) => !erVeranoPergola(k) }),
    tekst('dukfarge', 'Dukfarge'),
    tekst('ralfarge', 'Ralfarge', { ledetekst: 'RAL-farge stativ', hjelp: 'X-Line / X-Light: Spesiell lakkert RAL.' }),
    valg('skinne_v', 'Skinne venstre', v('Ingen', 'Enkel', 'Dobbel'), { ebestFelt: 'SkinneVenstre', vis: (k) => !erVeranoPergola(k) }),
    valg('skinne_h', 'Skinne høyre', v('Ingen', 'Enkel', 'Dobbel'), { ebestFelt: 'SkinneHøyre', vis: (k) => !erVeranoPergola(k) }),
    valg('beinlengde', 'Beinlengde', v('Std (10cm)', 'Spesial ►'), { vis: erX, standard: 'Std (10cm)' }),
    { id: 'beinlengde_cm', ledetekst: 'Beinlengde – spesial', ebestFelt: 'Beinlengde', type: 'tall', enhet: 'cm', vis: (k) => erX(k) && k.verdi('beinlengde') === 'Spesial ►' },
    valg('betjening', 'Betjening', [], {
      valg: (k) => v(...pergolaBetjening, ...(erX(k) ? ['Ingen betjening - kobles Venstre', 'Ingen betjening - kobles Høyre'] : [])),
    }),
    valg('betjening2', 'Bryter / fjernkontroll', [], {
      ebestFelt: 'Betjening2',
      valg: (k) => (s(k, 'betjening') === 'Motorstyring for bryter' ? pergolaBryter : s(k, 'betjening').startsWith('Motorstyring') ? pergolaFjern : []),
      vis: (k) => s(k, 'betjening').startsWith('Motorstyring'),
    }),
    valg('regulering', 'Regulering', v('Høyre', 'Venstre')),
    valg('feste', 'Feste', veggTak),
    valg('underlag', 'Underlag', underlag4),
    ...etasjeOgLift(),
  ],
};

void ingenEksisterende;

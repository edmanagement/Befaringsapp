import { describe, expect, it } from 'vitest';
import {
  honeycellBredde, screenBredde, screenHoyde, screenOverMaks, screenStorBunnlistTvunget, vindusmarkiseArmlengde,
} from '../src/regler/regler';
import { cmTekst, endringTekst, lesMaal, lesTall, sum } from '../src/regler/tall';

describe('tall', () => {
  it('leser komma og punktum', () => {
    expect(lesTall('120,4')).toBe(120.4);
    expect(lesTall('120.4')).toBe(120.4);
    expect(lesTall(' 99 ')).toBe(99);
    expect(lesTall('')).toBeNull();
    expect(lesTall('abc')).toBeNull();
  });
  it('mm regnes om til cm', () => {
    expect(lesMaal('1204', 'mm')).toBe(120.4);
    expect(lesMaal('120,44', 'cm')).toBe(120.4);
  });
  it('summerer uten flyttallsfeil', () => {
    expect(sum(100.3, -0.4)).toBe(99.9);
    expect(sum(0.1, 0.2)).toBe(0.3);
    expect(sum(150.1, 8.2)).toBe(158.3);
  });
  it('formaterer med komma og ekte minus', () => {
    expect(cmTekst(120)).toBe('120,0');
    expect(endringTekst(-0.4)).toBe('−0,4');
    expect(endringTekst(8.2)).toBe('+8,2');
  });
});

describe('Honeycell bredde', () => {
  it('trekker 4 mm', () => {
    expect(honeycellBredde(120.4).bestilt_cm).toBe(120);
    expect(honeycellBredde(100.3).bestilt_cm).toBe(99.9);
    expect(honeycellBredde(80).bestilt_cm).toBe(79.6);
  });
});

describe('Screen V550', () => {
  it('bredde: sideskinner +8,2 bare når avkrysset', () => {
    expect(screenBredde(250, false).bestilt_cm).toBe(250);
    expect(screenBredde(250, true).bestilt_cm).toBe(258.2);
    expect(screenBredde(311.9, true).bestilt_cm).toBe(320.1);
  });
  it('høyde: kassett-tillegg per størrelse med liten bunnlist', () => {
    expect(screenHoyde(200, true, 'XS', false).bestilt_cm).toBe(212);
    expect(screenHoyde(200, true, 'S', false).bestilt_cm).toBe(213);
    expect(screenHoyde(200, true, 'M', false).bestilt_cm).toBe(214);
    expect(screenHoyde(200, true, 'L', false).bestilt_cm).toBe(216);
  });
  it('høyde: stor bunnlist gir +2 ekstra, bare med kassett', () => {
    expect(screenHoyde(200, true, 'S', true).bestilt_cm).toBe(215);
    expect(screenHoyde(200, false, 'S', true).bestilt_cm).toBe(200);
  });
  it('tvungen Large bunnlist over 300 cm bestilt bredde', () => {
    expect(screenStorBunnlistTvunget(300)).toBe(false);
    expect(screenStorBunnlistTvunget(300.1)).toBe(true);
    expect(screenStorBunnlistTvunget(null)).toBe(false);
  });
  it('varsler over maks for størrelsen', () => {
    expect(screenOverMaks('S', 340, 300)).toEqual([]);
    expect(screenOverMaks('S', 340.1, 300)).toHaveLength(1);
    expect(screenOverMaks('XS', 341, 191)).toHaveLength(2);
    expect(screenOverMaks('L', 600, 500)).toEqual([]);
  });
});

describe('Vindusmarkise armlengde', () => {
  it('mål / 2 rundet opp til nærmeste 10', () => {
    expect(vindusmarkiseArmlengde(155)).toBe(80);
    expect(vindusmarkiseArmlengde(160)).toBe(80);
    expect(vindusmarkiseArmlengde(160.2)).toBe(90);
    expect(vindusmarkiseArmlengde(100)).toBe(50);
    expect(vindusmarkiseArmlengde(119)).toBe(60);
  });
});

import {
  persienne25Bredde, lamellBredde, lamellHoyde, insektBredde, miniBredde, utvPersienneBredde,
  vindusmarkiseBredde, vindusmarkiseArmRegel, slutterPaaFem,
} from '../src/regler/regler';
import { foreslaTrinn } from '../src/motor/motor';
import { scandic50, scandic80, roulett25, continent50 } from '../src/valglister/hoydetrinn';

describe('Etappe 2 – måleregler', () => {
  it('persienne 25: −0,4', () => expect(persienne25Bredde(100).bestilt_cm).toBe(99.6));
  it('lamell: bredde −1, høyde gulv −2 / karm −1', () => {
    expect(lamellBredde(250.3).bestilt_cm).toBe(249.3);
    expect(lamellHoyde(240, 'gulv').bestilt_cm).toBe(238);
    expect(lamellHoyde(150, 'karm').bestilt_cm).toBe(149);
  });
  it('insektsnetting: −0,2 standard, −0,1 valgfritt', () => {
    expect(insektBredde(80, false).bestilt_cm).toBe(79.8);
    expect(insektBredde(80, true).bestilt_cm).toBe(79.9);
  });
  it('Zipscreen Mini: lysåpning −1', () => {
    expect(miniBredde(120, true).bestilt_cm).toBe(119);
    expect(miniBredde(120, false).bestilt_cm).toBe(120);
  });
  it('utvendig persienne: +10', () => expect(utvPersienneBredde(118.5).bestilt_cm).toBe(128.5));
  it('vindusmarkise: +20, vannrett +10', () => {
    expect(vindusmarkiseBredde(150, false).bestilt_cm).toBe(170);
    expect(vindusmarkiseBredde(150, true).bestilt_cm).toBe(160);
    expect(vindusmarkiseArmRegel(155).bestilt_cm).toBe(80);
  });
  it('Continent: slutter på ,5', () => {
    expect(slutterPaaFem(119.5)).toBe(true);
    expect(slutterPaaFem(119.4)).toBe(false);
    expect(slutterPaaFem(120)).toBe(false);
  });
});

describe('Høydetrinn', () => {
  it('forslag = minste trinn ≥ målt (uten dekkasse)', () => {
    expect(foreslaTrinn(roulett25, 120)?.cm).toBe(120.0);
    expect(foreslaTrinn(roulett25, 120.1)?.cm).toBe(122.1);
    expect(foreslaTrinn(roulett25, 999)).toBeNull();
  });
  it('forslag med dekkasse: trinnets dekkassehøyde legges til målt', () => {
    // Scandic 50, målt 85: 88,4 (kasse 10) er under 95 → første trinn med cm ≥ 85 + kasse: 96,8 (kasse 12, 96,8 < 97) → 101,0 (kasse 12, ≥ 97)
    expect(foreslaTrinn(scandic50, 85, true)?.cm).toBe(101.0);
    expect(foreslaTrinn(scandic50, 85, false)?.cm).toBe(88.4);
    // Scandic 80, målt 150: 165,5 (24) er under 174; 172,7 (25) under 175; 179,9 (25) ≥ 175
    expect(foreslaTrinn(scandic80, 150, true)?.cm).toBe(179.9);
  });
  it('tabellene stemmer med skjermbildet', () => {
    expect(roulett25.length).toBe(124);
    expect(continent50.at(-1)).toEqual({ cm: 219.8, dekkasse: 12 });
    expect(scandic50.find((t) => t.cm === 256.4)?.dekkasse).toBe(18);
    expect(scandic80.find((t) => t.cm === 403.1)?.dekkasse).toBe(44);
  });
});

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
  it('tvungen Large bunnlist over 320 cm bestilt bredde', () => {
    expect(screenStorBunnlistTvunget(320)).toBe(false);
    expect(screenStorBunnlistTvunget(320.1)).toBe(true);
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

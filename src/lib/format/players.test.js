import { describe, it, expect } from 'vitest';
import { parsePlayers, playersBarClass, playersPercent } from './players';

describe('parsePlayers', () => {
  it('parses "22/30" into { current: 22, capacity: 30 }', () => {
    expect(parsePlayers('22/30')).toEqual({ current: 22, capacity: 30 });
  });
  it('parses "0/16" into { current: 0, capacity: 16 }', () => {
    expect(parsePlayers('0/16')).toEqual({ current: 0, capacity: 16 });
  });
  it('returns { current: 0, capacity: 0 } for invalid input', () => {
    expect(parsePlayers('')).toEqual({ current: 0, capacity: 0 });
    expect(parsePlayers('garbage')).toEqual({ current: 0, capacity: 0 });
    expect(parsePlayers(undefined)).toEqual({ current: 0, capacity: 0 });
  });
});

describe('playersPercent', () => {
  it('returns 73 for 22/30', () => {
    expect(playersPercent({ current: 22, capacity: 30 })).toBe(73);
  });
  it('returns 100 for a saturated server', () => {
    expect(playersPercent({ current: 30, capacity: 30 })).toBe(100);
  });
  it('returns 0 when capacity is 0 (no divide-by-zero)', () => {
    expect(playersPercent({ current: 0, capacity: 0 })).toBe(0);
  });
  it('caps at 100 when a server reports more players than slots', () => {
    expect(playersPercent({ current: 40, capacity: 30 })).toBe(100);
  });
});

describe('playersBarClass', () => {
  it.each([[79, 'bg-primary'], [80, 'bg-warning'], [95, 'bg-destructive']])('maps %i%% to %s', (percent, expected) => {
    expect(playersBarClass(percent)).toBe(expected);
  });
});

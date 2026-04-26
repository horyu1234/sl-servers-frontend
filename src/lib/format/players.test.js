import { describe, it, expect } from 'vitest';
import { parsePlayers, playersPercent } from './players';

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
});

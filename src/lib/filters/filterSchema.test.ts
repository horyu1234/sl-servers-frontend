import { describe, it, expect } from 'vitest';
import serverFilter, { replaceFilter } from '../../modules/serverFilter';
import {
  DEFAULT_FILTER,
  SORT_OPTIONS,
  activeFilterCount,
  describeRange,
  normalizeRange,
  parseFromSearchParams,
  parseRange,
  toRequestBody,
  toSearchParams,
} from './filterSchema';
import type { ServerFilter } from './filterSchema';

const ACTIVE: ServerFilter = {
  search: 'ko',
  countryFilter: ['KR', 'US'],
  players: { min: 5, max: 20 },
  slots: { min: null, max: 40 },
  hideFullServer: true,
  friendlyFire: 'true',
  whitelist: 'false',
  modded: 'null',
  sort: 'PLAYERS_DESC',
};

describe('filterSchema', () => {
  it('starts the store on the default filter and replaces it whole', () => {
    expect(DEFAULT_FILTER).toEqual({
      search: '',
      countryFilter: [],
      players: { min: null, max: null },
      slots: { min: null, max: null },
      hideFullServer: false,
      friendlyFire: 'null',
      whitelist: 'null',
      modded: 'null',
      sort: 'INGAME_ORDER',
    });
    expect(serverFilter(undefined, { type: '@@INIT' } as never)).toEqual(DEFAULT_FILTER);
    expect(serverFilter(DEFAULT_FILTER, replaceFilter(ACTIVE))).toBe(ACTIVE);
  });

  it('round-trips an active filter via URLSearchParams', () => {
    const params = toSearchParams(ACTIVE);
    expect(params.get('players')).toBe('5-20');
    expect(params.get('slots')).toBe('-40');
    expect(parseFromSearchParams(params)).toEqual(ACTIVE);
  });

  it('produces empty params for the default filter', () => {
    expect(toSearchParams(DEFAULT_FILTER).toString()).toBe('');
  });

  it('reads partial params and falls back to defaults', () => {
    const params = new URLSearchParams('search=foo&country=KR,JP');
    expect(parseFromSearchParams(params)).toEqual({
      ...DEFAULT_FILTER,
      search: 'foo',
      countryFilter: ['KR', 'JP'],
    });
  });

  it('treats unknown sort values as DEFAULT_FILTER.sort', () => {
    const params = new URLSearchParams('sort=BANANA');
    expect(parseFromSearchParams(params).sort).toBe(DEFAULT_FILTER.sort);
  });

  it('offers exactly the sort types the API supports', () => {
    expect(SORT_OPTIONS.map((opt) => opt.value)).toEqual([
      'INGAME_ORDER', 'PLAYERS_DESC', 'PLAYERS_ASC', 'DISTANCE_ASC', 'DISTANCE_DESC',
    ]);
  });

  it.each(SORT_OPTIONS.map((opt) => opt.value))('round-trips sort=%s via URLSearchParams', (sort) => {
    const params = toSearchParams({ ...DEFAULT_FILTER, sort });
    expect(parseFromSearchParams(params).sort).toBe(sort);
  });
});

describe('player and slot ranges', () => {
  it.each([
    ['5-20', { min: 5, max: 20 }],
    ['5-', { min: 5, max: null }],
    ['5', { min: 5, max: null }],
    ['-20', { min: null, max: 20 }],
    ['-0', { min: null, max: 0 }],
    ['20-5', { min: 5, max: 20 }],
    ['0-10', { min: null, max: 10 }],
    ['5000-', { min: 999, max: null }],
    ['-', { min: null, max: null }],
    ['', { min: null, max: null }],
    ['abc', { min: null, max: null }],
    ['-5-10', { min: null, max: null }],
    ['1.5-3', { min: null, max: null }],
  ])('reads players=%s', (value, range) => {
    expect(parseRange(value)).toEqual(range);
  });

  it('never sends a range the API would reject', () => {
    expect(normalizeRange({ min: 30, max: 10 })).toEqual({ min: 10, max: 30 });
    expect(normalizeRange({ min: -3, max: -1 })).toEqual({ min: null, max: 0 });
    expect(normalizeRange({ min: Number.NaN, max: 2.7 })).toEqual({ min: null, max: 2 });
  });

  it('turns links that hid empty servers into a minimum of one player', () => {
    expect(parseFromSearchParams(new URLSearchParams('hideEmpty=1')).players).toEqual({ min: 1, max: null });
    expect(parseFromSearchParams(new URLSearchParams('hideEmpty=1&players=10-')).players).toEqual({ min: 10, max: null });
    expect(toSearchParams(parseFromSearchParams(new URLSearchParams('hideEmpty=1'))).toString()).toBe('players=1-');
  });

  it.each([
    [{ min: 5, max: 20 }, '5–20'],
    [{ min: 10, max: 10 }, '10'],
    [{ min: 5, max: null }, '5+'],
    [{ min: null, max: 20 }, '≤20'],
    [{ min: null, max: 0 }, '0'],
  ])('labels %j as %s', (range, label) => {
    expect(describeRange(range)).toBe(label);
  });

  it('counts each range once among the active filters', () => {
    expect(activeFilterCount(DEFAULT_FILTER)).toBe(0);
    // search, two countries, players, slots, hide full, friendly fire, whitelist, sort
    expect(activeFilterCount(ACTIVE)).toBe(9);
  });

  it('sends the ranges to the API and no longer hides empty servers separately', () => {
    expect(toRequestBody(ACTIVE)).toEqual({
      search: 'ko',
      countryFilter: ['KR', 'US'],
      hideEmptyServer: false,
      hideFullServer: true,
      friendlyFire: 'true',
      whitelist: 'false',
      modded: 'null',
      sort: 'PLAYERS_DESC',
      minPlayers: 5,
      maxPlayers: 20,
      minSlots: null,
      maxSlots: 40,
    });
    expect(toRequestBody(DEFAULT_FILTER)).toMatchObject({
      minPlayers: null, maxPlayers: null, minSlots: null, maxSlots: null,
    });
  });
});

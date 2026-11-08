import { describe, it, expect } from 'vitest';
import serverFilter from '../../modules/serverFilter';
import { DEFAULT_FILTER, SORT_OPTIONS, parseFromSearchParams, toSearchParams } from './filterSchema';
import type { ServerFilter } from './filterSchema';

describe('filterSchema', () => {
  it('DEFAULT_FILTER matches the legacy serverFilter initialState', () => {
    expect(DEFAULT_FILTER).toEqual({
      search: '',
      countryFilter: [],
      hideEmptyServer: false,
      hideFullServer: false,
      friendlyFire: 'null',
      whitelist: 'null',
      modded: 'null',
      sort: 'INGAME_ORDER',
    });
    expect(serverFilter(undefined, { type: '@@INIT' } as never)).toEqual(DEFAULT_FILTER);
  });

  it('round-trips an active filter via URLSearchParams', () => {
    const filter: ServerFilter = {
      search: 'ko',
      countryFilter: ['KR', 'US'],
      hideEmptyServer: true,
      hideFullServer: false,
      friendlyFire: 'true',
      whitelist: 'false',
      modded: 'null',
      sort: 'PLAYERS_DESC',
    };
    const params = toSearchParams(filter);
    expect(parseFromSearchParams(params)).toEqual(filter);
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

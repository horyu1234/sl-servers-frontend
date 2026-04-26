import { describe, it, expect } from 'vitest';
import { DEFAULT_FILTER, parseFromSearchParams, toSearchParams } from './filterSchema';

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
      sort: 'DISTANCE_ASC',
    });
  });

  it('round-trips an active filter via URLSearchParams', () => {
    const filter = {
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
});

const VALID_SORTS = new Set(['DISTANCE_ASC', 'DISTANCE_DESC', 'PLAYERS_ASC', 'PLAYERS_DESC']);
const VALID_TRISTATE = new Set(['null', 'true', 'false']);

export const DEFAULT_FILTER = Object.freeze({
  search: '',
  countryFilter: [],
  hideEmptyServer: false,
  hideFullServer: false,
  friendlyFire: 'null',
  whitelist: 'null',
  modded: 'null',
  sort: 'DISTANCE_ASC',
});

export function parseFromSearchParams(params) {
  const search = params.get('search') ?? '';
  const country = params.get('country');
  const countryFilter = country ? country.split(',').filter(Boolean) : [];

  const sortParam = params.get('sort');
  const sort = sortParam && VALID_SORTS.has(sortParam) ? sortParam : DEFAULT_FILTER.sort;

  const tri = (key) => {
    const v = params.get(key);
    return v && VALID_TRISTATE.has(v) ? v : 'null';
  };

  return {
    search,
    countryFilter,
    hideEmptyServer: params.get('hideEmpty') === '1',
    hideFullServer: params.get('hideFull') === '1',
    friendlyFire: tri('ff'),
    whitelist: tri('wl'),
    modded: tri('modded'),
    sort,
  };
}

export function toSearchParams(filter) {
  const params = new URLSearchParams();
  if (filter.search) params.set('search', filter.search);
  if (filter.countryFilter && filter.countryFilter.length > 0) {
    params.set('country', filter.countryFilter.join(','));
  }
  if (filter.hideEmptyServer) params.set('hideEmpty', '1');
  if (filter.hideFullServer) params.set('hideFull', '1');
  if (filter.friendlyFire !== 'null') params.set('ff', filter.friendlyFire);
  if (filter.whitelist !== 'null') params.set('wl', filter.whitelist);
  if (filter.modded !== 'null') params.set('modded', filter.modded);
  if (filter.sort !== DEFAULT_FILTER.sort) params.set('sort', filter.sort);
  return params;
}

export function isDefault(filter) {
  return toSearchParams(filter).toString() === '';
}

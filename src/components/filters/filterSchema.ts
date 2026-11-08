import type { ServerSortOption, ServerSortType, TriState } from '../../types/api';

export type ServerFilter = ServerSortOption;

export interface FilterProps {
  value: ServerFilter;
  onChange: (next: ServerFilter) => void;
}

interface SortOption {
  value: ServerSortType;
  i18nKey: string;
}

// Values must exist in the API's ServerSortType enum: POST /api/servers answers
// 400 for any other value, which fails the whole list. Ship new ones API-first.
export const SORT_OPTIONS: readonly SortOption[] = Object.freeze([
  { value: 'INGAME_ORDER',  i18nKey: 'filter-option.yes-no-filter.order-type.ingame' },
  { value: 'PLAYERS_DESC',  i18nKey: 'filter-option.yes-no-filter.order-type.player-desc' },
  { value: 'PLAYERS_ASC',   i18nKey: 'filter-option.yes-no-filter.order-type.player-asc' },
  { value: 'DISTANCE_ASC',  i18nKey: 'filter-option.yes-no-filter.order-type.distance-asc' },
  { value: 'DISTANCE_DESC', i18nKey: 'filter-option.yes-no-filter.order-type.distance-desc' },
]);

const VALID_SORTS = new Set<string>(SORT_OPTIONS.map((opt) => opt.value));
const VALID_TRISTATE = new Set<string>(['null', 'true', 'false']);

function isSortType(value: string | null): value is ServerSortType {
  return value !== null && VALID_SORTS.has(value);
}

function isTriState(value: string | null): value is TriState {
  return value !== null && VALID_TRISTATE.has(value);
}

export const DEFAULT_FILTER: Readonly<ServerFilter> = Object.freeze({
  search: '',
  countryFilter: [],
  hideEmptyServer: false,
  hideFullServer: false,
  friendlyFire: 'null',
  whitelist: 'null',
  modded: 'null',
  sort: 'INGAME_ORDER',
});

export function parseFromSearchParams(params: URLSearchParams): ServerFilter {
  const search = params.get('search') ?? '';
  const country = params.get('country');
  const countryFilter = country ? country.split(',').filter(Boolean) : [];

  const sortParam = params.get('sort');
  const sort = isSortType(sortParam) ? sortParam : DEFAULT_FILTER.sort;

  const tri = (key: string): TriState => {
    const v = params.get(key);
    return isTriState(v) ? v : 'null';
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

export function toSearchParams(filter: ServerFilter) {
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

export function isDefault(filter: ServerFilter) {
  return toSearchParams(filter).toString() === '';
}

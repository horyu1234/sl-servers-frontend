import type { ServerSortOption, ServerSortType, TriState } from '../../types/api';

/** An inclusive range of counts. null leaves that end open. */
export interface CountRange {
  min: number | null;
  max: number | null;
}

/** What the list filters on. The URL holds it, and `toRequestBody` turns it into the API body. */
export interface ServerFilter {
  search: string;
  countryFilter: string[];
  /** Current players. */
  players: CountRange;
  /** Maximum players, the server's slot count. */
  slots: CountRange;
  hideFullServer: boolean;
  friendlyFire: TriState;
  whitelist: TriState;
  modded: TriState;
  sort: ServerSortType;
}

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

/** The largest count a range accepts. No server has this many slots. */
export const MAX_COUNT = 999;

const OPEN_RANGE: Readonly<CountRange> = Object.freeze({ min: null, max: null });

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
  players: OPEN_RANGE,
  slots: OPEN_RANGE,
  hideFullServer: false,
  friendlyFire: 'null',
  whitelist: 'null',
  modded: 'null',
  sort: 'INGAME_ORDER',
});

export function isOpenRange(range: CountRange) {
  return range.min === null && range.max === null;
}

/**
 * Keeps a range the API accepts: whole numbers from 0 to MAX_COUNT, with the ends swapped when the
 * minimum is above the maximum. A minimum of 0 keeps everything, so it becomes open.
 */
export function normalizeRange({ min, max }: CountRange): CountRange {
  const clamp = (n: number | null) => (
    n === null || !Number.isFinite(n) ? null : Math.min(MAX_COUNT, Math.max(0, Math.trunc(n)))
  );
  let low = clamp(min);
  let high = clamp(max);
  if (low !== null && high !== null && low > high) [low, high] = [high, low];
  if (low === 0) low = null;
  return { min: low, max: high };
}

/** Reads `5-20`, `5-`, `-20` or `5`. Anything else is an open range. */
export function parseRange(value: string | null): CountRange {
  const match = value?.match(/^(\d{1,4})?(?:-(\d{1,4})?)?$/);
  if (!match) return OPEN_RANGE;
  const num = (s: string | undefined) => (s === undefined ? null : Number(s));
  return normalizeRange({ min: num(match[1]), max: num(match[2]) });
}

/** The URL form that `parseRange` reads, or null for an open range. */
export function formatRange(range: CountRange): string | null {
  if (isOpenRange(range)) return null;
  if (range.max === null) return `${range.min}-`;
  return `${range.min ?? ''}-${range.max}`;
}

/** How a range reads on a chip: `5–20`, `5+`, `≤20` or `5`. */
export function describeRange({ min, max }: CountRange): string {
  if (min !== null && max !== null) return min === max ? String(min) : `${min}–${max}`;
  if (min !== null) return `${min}+`;
  // A minimum of 0 is stored as open, so "only empty servers" arrives as max 0 alone.
  return max === 0 ? '0' : `≤${max}`;
}

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

  let players = parseRange(params.get('players'));
  // Links from before the player range used hideEmpty=1, which is a minimum of one player.
  if (!params.has('players') && params.get('hideEmpty') === '1') players = { min: 1, max: null };

  return {
    search,
    countryFilter,
    players,
    slots: parseRange(params.get('slots')),
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
  if (filter.countryFilter.length > 0) {
    params.set('country', filter.countryFilter.join(','));
  }
  const players = formatRange(normalizeRange(filter.players));
  if (players) params.set('players', players);
  const slots = formatRange(normalizeRange(filter.slots));
  if (slots) params.set('slots', slots);
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

export function sameFilter(a: ServerFilter, b: ServerFilter) {
  return toSearchParams(a).toString() === toSearchParams(b).toString();
}

/** How many filters are on. A range counts once, and each country counts on its own. */
export function activeFilterCount(filter: ServerFilter) {
  return filter.countryFilter.length
    + (filter.sort !== DEFAULT_FILTER.sort ? 1 : 0)
    + (filter.search ? 1 : 0)
    + (isOpenRange(normalizeRange(filter.players)) ? 0 : 1)
    + (isOpenRange(normalizeRange(filter.slots)) ? 0 : 1)
    + (filter.hideFullServer ? 1 : 0)
    + (filter.friendlyFire !== 'null' ? 1 : 0)
    + (filter.whitelist !== 'null' ? 1 : 0)
    + (filter.modded !== 'null' ? 1 : 0);
}

/** The body of POST /api/servers. Hiding empty servers is now a minimum of one player. */
export function toRequestBody(filter: ServerFilter): ServerSortOption {
  const players = normalizeRange(filter.players);
  const slots = normalizeRange(filter.slots);
  return {
    search: filter.search,
    countryFilter: filter.countryFilter,
    hideEmptyServer: false,
    hideFullServer: filter.hideFullServer,
    friendlyFire: filter.friendlyFire,
    whitelist: filter.whitelist,
    modded: filter.modded,
    sort: filter.sort,
    minPlayers: players.min,
    maxPlayers: players.max,
    minSlots: slots.min,
    maxSlots: slots.max,
  };
}

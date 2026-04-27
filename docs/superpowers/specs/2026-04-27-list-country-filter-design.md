# List Country Filter — Design

**Date:** 2026-04-27
**Status:** Approved (ready for implementation plan)
**Scope:** Add a country multi-select filter to the server list page (sidebar + drawer).

## Background

The server list page already ships a full filter pipeline keyed off `countryFilter`:

- `src/components/filters/filterSchema.js` defines `countryFilter: []` in `DEFAULT_FILTER`, parses `?country=KR,US` from the URL, and serializes it back.
- `src/pages/list/List.jsx` syncs `filter.countryFilter` into the `serverFilter` Redux slice via `serverFilterActions.changeCountry` and re-fires `getServerList` (server-side filtering).
- `src/components/filters/FilterChips.jsx` renders one chip per selected ISO code with per-chip remove.
- `src/components/filters/FilterDrawer.jsx` includes `value.countryFilter.length` in its active-count badge.
- `src/components/stats/CountryMultiSelect.jsx` (built in commit `3c47a5c`) is a shadcn Popover + Command combobox already in production on the Stats page. Its commit message explicitly notes: *"Plan B's filter sidebar can later reuse it for the country filter that was deferred."*

The only missing piece is the selector UI inside `FilterControls.jsx` and a single i18n label key. This spec describes that addition.

## Goals

- Surface a country filter in both the desktop sidebar (`FilterSidebar`) and the mobile drawer (`FilterDrawer`).
- Reuse the existing `CountryMultiSelect` component without code duplication.
- Match the existing filter-row visual language (uppercase muted Label + control).
- Keep all currently working pieces (URL sync, Redux dispatch, chips, drawer count) untouched.

## Non-Goals

- Building a sidebar-specific inline checklist variant.
- Changing the `countryFilter` schema, URL grammar, or server-side filtering contract.
- Adding a new locale file (e.g., ja-JP).
- Refactoring `CountryMultiSelect` beyond a single new prop.

## Architecture

No data-flow changes. The existing pipeline is:

```
URL ?country=KR,US
  └─► parseFromSearchParams (filterSchema.js)
        └─► filter.countryFilter (memoized in List.jsx)
              ├─► serverFilterActions.changeCountry (Redux)
              │     └─► getServerList thunk (server-side filtering)
              ├─► FilterChips (chips with remove)
              └─► FilterDrawer (active-count badge)
```

The new UI plugs into `FilterControls.jsx`, which is already used by both `FilterSidebar` (desktop) and `FilterDrawer` (mobile). One insertion → both surfaces.

## Component Changes

### `src/components/stats/CountryMultiSelect.jsx`

Add a single optional prop to make the popover usable in narrower containers:

- New prop: `minPopoverWidth` (number, default `320`).
- Apply to `PopoverContent` via `style={{ width: 'var(--radix-popover-trigger-width)', minWidth: <prop> }}`.
- Stats page call sites pass nothing → keep `320` default (no behavior change).

### `src/components/filters/FilterControls.jsx`

- Import `CountryMultiSelect`.
- Insert a new labeled block immediately after the search `Input`, before the first `<Separator />`:
  - Uppercase muted `Label` with text `t('filter-option.country')`.
  - `<CountryMultiSelect value={value.countryFilter} onChange={(next) => set({ countryFilter: next })} minPopoverWidth={240} />`.
- The existing `set` helper (`onChange({ ...value, ...patch })`) handles the patch idiomatically.

This places country between Search and the hide-empty/hide-full checkboxes — matching the chip ordering already implemented in `FilterChips` (search → country → hideEmpty → hideFull → ff → wl → modded).

### i18n

Add `filter-option.country` to all 27 locale files. Insert between the `server-search` block and `hide-empty` to match natural reading order.

| Locale | Value |
|---|---|
| en-US | Country |
| ko-KR | 국가 |
| zh-CN | 国家 |
| zh-TW | 國家 |
| zh-LZH | 國 |
| de-DE | Land |
| dk-DK | Land |
| is-IS | Land |
| nb-NO | Land |
| sv-SV | Land |
| fr-FR | Pays |
| es-ES | País |
| pt-BR | País |
| ca-ES | País |
| it-IT | Paese |
| lij-IT | Paeize |
| ru-RU | Страна |
| uk-UA | Країна |
| pl-PL | Kraj |
| cs-CZ | Země |
| bg-BG | Държава |
| tr-TR | Ülke |
| th-TH | ประเทศ |
| ee-EE | Riik |
| eo-EO | Lando |
| fi-FI | Maa |
| lv-LV | Valsts |

## Data Flow (Walkthrough)

1. User opens the list page.
2. `CountryMultiSelect` mounts (in sidebar at `lg+`, in drawer otherwise) and dispatches `countryListActions.getCountryList()` if not already cached.
3. User types in the popover Command input → user clicks a country.
4. `CountryMultiSelect.toggle(code)` calls `onChange([...value, code])`.
5. `FilterControls.set({ countryFilter: [...] })` propagates to `List.updateFilter`.
6. `setSearchParams(toSearchParams(next))` writes `?country=KR` to the URL.
7. `useEffect` fires: `parseFromSearchParams` → Redux `changeCountry` → `getServerList`.
8. `FilterChips` and the drawer badge update from the same `value.countryFilter`.

## Risks & Edge Cases

- **Popover width vs sidebar width.** Sidebar is `w-60` (240px). With `minPopoverWidth={240}`, the popover matches the trigger and stays inside the sidebar bounds.
- **Mobile drawer (85vw, ~320px).** Trigger is wider than 240, so `minPopoverWidth` has no effect — popover follows trigger width as in stats.
- **Unknown ISO code in URL.** Server-side filtering is expected to ignore unknowns; `getCountryName` already falls back to the raw code in chip rendering.
- **`countryList` slice returns a fresh empty array on `FETCHING`.** `CountryMultiSelect` already depends on a primitive (`hasCountries` boolean) to avoid the infinite-fetch trap noted in its source comments.
- **z-index.** No Leaflet on the list page; the recent map z-index fix is unrelated.

## Testing

- `FilterControls` renders the country Label and a combobox trigger when given a default filter value.
- Toggling a country in the popover invokes `onChange` with `{ ...value, countryFilter: [code] }`.
- Existing `filterSchema.test.js` and `List.test.jsx` need no updates — the schema is unchanged.

## Out of Scope (YAGNI)

- Sidebar-only inline checkbox variant of country selection.
- Sort/dedupe normalization on `countryFilter` writes.
- New ja-JP locale file.
- Any change to `CountryMultiSelect`'s internals beyond the new prop.

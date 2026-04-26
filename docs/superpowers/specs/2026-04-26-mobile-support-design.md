# Mobile Support Improvements — Design

**Date:** 2026-04-26
**Status:** Approved (brainstorming) — awaiting implementation plan

## Problem

The site renders poorly on phones (sample: Samsung Galaxy S20 Ultra, 412×915). Root cause is `ServerRow.jsx` using a fixed-pixel grid template — `gridTemplateColumns: '1.3fr 150px 150px 170px 130px 60px 18px'`. Fixed columns sum to ~678 px, so on a 412 px viewport the right side of every row (sparkline label, players progress, distance, chevron) is clipped, and country/version content visually collide.

Other pages have not been confirmed broken yet — the audit will run after the List page is fixed.

## Goals

- Fix the obviously broken List page on phones first.
- Audit the remaining pages on real phone viewports (`pnpm start` + chrome-devtools MCP at 360 / 412 / 768 px) and patch only confirmed regressions. No speculative edits.

## Non-Goals

- Redesigning the desktop list. `ServerRow` stays unchanged; it is desktop-only after this work.
- Changing the existing view-toggle URL contract (`?view=grid`).
- Server-side rendering concerns. The app is a Vite SPA.

## Decisions

| Decision | Choice |
|---|---|
| Scope | Full-site mobile audit, List first, others verified on real viewports |
| Mobile list rendering | Force card view on phones (toggle becomes a no-op below `sm`) |
| Breakpoints | `< sm` = phone, `sm`–`lg` = tablet (cards in 2 columns), `≥ lg` = desktop |
| Toolbar count text | Hidden on phones; the existing `ServerStatsHeader` already exposes the same `displayed / online` numbers |
| Card density on phones | Compact mode (single-line meta strip + single-line sparkline label) |

## Architecture

### Files Touched (List, first pass)

| File | Change |
|---|---|
| `src/lib/hooks/useMediaQuery.js` | New — `matchMedia` hook |
| `src/components/server/ServerCard.jsx` | New `compact` prop |
| `src/components/server/ServerSparkline.jsx` | New `compact` prop; SVG width responsive |
| `src/pages/list/List.jsx` | Phone-aware view selection + virtualization |

### Files NOT Touched (List, first pass)

- `src/components/server/ServerRow.jsx` — desktop-only after this change; no responsive work needed.
- `src/components/server/ServerRow.test.jsx` — unchanged.
- `src/components/filters/FilterDrawer.jsx`, `FilterChips.jsx`, `FilterControls.jsx` — already responsive.

### Second Pass — Other Pages (audit-driven)

Run `pnpm start`, emulate 360 / 412 / 768 px via chrome-devtools MCP, walk every route. Patch only what is empirically broken. Candidate watchlist:

- `pages/info/Info.jsx` — recharts X-axis label clipping is universal; `PeriodPicker` line wrap.
- `pages/stats/Stats.jsx` — `CountryMultiSelect` width; recharts.
- `pages/map/Map.jsx` — `h-[calc(100vh-12rem)]` may waste space against a slim mobile toolbar.
- `pages/api/Api.jsx` — swagger-ui mobile is partially the widget's problem.
- `components/shell/TopMenu.jsx` Sheet width (`w-[300px]` on a 360 px phone is tight).
- `components/filters/FilterDrawer.jsx` Sheet width (`w-[320px]`).
- Cookie consent banner placement.

Each confirmed issue → its own focused commit.

## Component Designs

### `useMediaQuery(query)`

```js
// src/lib/hooks/useMediaQuery.js
import { useEffect, useState } from 'react';

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (event) => setMatches(event.matches);
    setMatches(mql.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}
```

Reasoning: synchronous initial state via `matchMedia` avoids first-paint flicker. `window` guard kept defensively even though Vite CSR never hits it.

### `ServerCard` `compact` prop

Compact rendering rules:

- Drop the dedicated `IP:Port` mono line under the server name. (Name is either the parsed `info` or the IP fallback — never both for compact.)
- `ServerMetaStrip compact` (existing prop) → single line `v14.2.6 · FF No · WL No`.
- Pass `compact` to `ServerSparkline`.
- Outer padding `p-3` → `p-2.5`; vertical gap `space-y-2` → `space-y-1.5`.

Default (non-compact) rendering is unchanged. The desktop grid view is unaffected.

### `ServerSparkline` `compact` prop + responsive width

- Replace `width={WIDTH}` on the `<svg>` with `style={{ width: '100%' }}` while keeping `viewBox="0 0 160 28"` and `preserveAspectRatio="none"`. Visual scaling is unchanged for cards that happen to be 160 px wide; wider/narrower cards scale linearly.
- When `compact` is true, collapse the two label rows into one:
  `peak 12 · avg 3   ▲ +25%` rendered as a single `<div className="flex justify-between text-[9px] tabular-nums">`. (Effectively reuses the existing two-span layout; the only difference is the lack of the wrapping flex-col, so DOM stays minimal.)

### `List.jsx` phone behaviour

```js
const isPhone = useMediaQuery('(max-width: 639px)'); // < sm
const effectiveView = isPhone ? 'grid' : view;
// Toolbar count: add `hidden sm:block` to the existing `ml-auto` div.
// Card grid path stays intact; pass `compact={isPhone}` to <ServerCard>.
// Virtualization stays for `effectiveView === 'list'`.
```

Phones render the existing `grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3` card layout (1 column at `< sm`). The toggle URL contract is preserved — only `effectiveView` is overridden.

### Virtualization for phone-cards

> **Tradeoff:** ~1,165 cards × ~125 px ≈ 145,000 px of DOM. React 19 with `memo` can handle it but the initial mount cost and scroll smoothness suffer.

Resolution: extend `useWindowVirtualizer` to phone path.

- Trigger when `effectiveView === 'list' || isPhone`.
- `estimateSize`:
  - list (desktop) → `80`
  - phone-card → `125` (compact card empirical estimate; tanstack-virtual measures and corrects)
- Desktop grid view (≥ sm) is **not** virtualized. Existing behavior unchanged.

## Data Flow / State

- Phone-vs-desktop is purely viewport-derived. No Redux, no URL state.
- The view toggle still writes `?view=grid` and is honored on `≥ sm`. On phones it's ignored.
- All filtering, fetching, and trend wiring is unchanged.

## Testing

- New: `ServerCard` renders compact meta strip and single-line sparkline label when `compact` is true.
- New: `useMediaQuery` returns the initial `matchMedia` value and updates on `change`.
- Existing `ServerRow.test.jsx` is untouched.
- Manual: `pnpm start` + chrome-devtools MCP at 360 / 412 / 768 / 1024 / 1280 px on every route during the second pass.

## Risks

- **Sparkline horizontal stretch.** Switching the SVG to `width: 100%` with `preserveAspectRatio="none"` lets points "wide" on wider phones. Acceptable because phones are 1 column → all cards have the same width within a session; visual jitter only appears between phone and tablet.
- **Phone-card virtualization estimate drift.** First scroll may jitter while tanstack-virtual remeasures. Mitigated by getting `estimateSize` close (~125) and the existing `overscan: 6`.
- **TopMenu / FilterDrawer sheet widths.** `w-[300px]` and `w-[320px]` are wider than some phones (≤ 360 px). Will be evaluated during the second pass and patched only if the live device shows a problem.

## Out of Scope

- Mobile-specific gesture work (swipe-to-dismiss sheets, etc.).
- Touch-target size sweep across all buttons (separate concern).
- Server-side rendering or hydration safety.
- recharts X-axis tick rotation/abbreviation — handle only if confirmed during the second pass.

## Sequence

1. Add `useMediaQuery`.
2. Add `compact` to `ServerSparkline`; switch SVG width to fluid.
3. Add `compact` to `ServerCard`.
4. Wire `isPhone` into `List.jsx` (effective view, toolbar count visibility, virtualization branch, card prop).
5. Tests for new props/hook.
6. Manual viewport audit of every route. Patch confirmed regressions in dedicated commits.

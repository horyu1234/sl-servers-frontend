# Design Overhaul — sl-servers-frontend

| | |
|---|---|
| Date | 2026-04-25 |
| Owner | Hyunoh Ryu |
| Branch | `main` (Big Bang on current branch, no PR) |
| Companion | API handoff at `docs/superpowers/handoffs/2026-04-25-api-batched-server-trends.md` |

## 1. Goal

Replace the legacy Bootstrap/Bootswatch stack with a modern, dense, internationally-targeted design system. The site's primary job is **"help a player pick which SL server to join right now"** — every decision below favors information density, scannability, and global usability over Korean-first conventions.

## 2. Scope

### In scope

- Visual overhaul (Bootstrap → Tailwind v4 + shadcn/ui) across **all pages**.
- Information-architecture redesign of the List page (filter sidebar + virtualized two-line rows + inline sparklines + view toggle).
- Chart library swap (Highcharts → recharts; inline sparklines as raw SVG).
- Icon swap (FontAwesome → lucide-react).
- Form/select swap (react-select / react-datepicker / react-bootstrap → shadcn primitives).
- Toast swap (react-toastify → `sonner`).
- Cookie-consent swap (`react-cookie-consent` → Silktide CMP) with proper GDPR gating of Sentry (and any future analytics).
- Responsive design pass for mobile (≥ 360px) through desktop.
- Single-branch Big Bang migration on `main`, split into 12 logical commits.

### Out of scope

- Routing changes (existing routes preserved: `/`, `/servers/:serverId`, `/stats`, `/map`, `/credit`, `/api`).
- Backend changes other than the new batched trends endpoint, which is delegated via the API handoff doc.
- Migration to Redux Toolkit Query, Tanstack Query, or any data-layer rewrite (Redux thunks remain).
- Auth, account features, or any net-new product surface.
- Maplibre-gl migration — Leaflet stays.
- Translation content authoring (existing 27 locales preserved; only `cookie-notice` keys are remapped to Silktide configuration).

## 3. Confirmed decisions (locked from brainstorming)

| Area | Decision |
|---|---|
| Scope | C — Visual + UX + IA |
| UI system | Tailwind v4 + shadcn/ui (Radix primitives) |
| Visual tone | Modern SaaS dark (Linear / Vercel inspired) |
| Charts | recharts; inline sparkline = hand-rolled SVG |
| Icons | lucide-react |
| Maps | Leaflet (unchanged) |
| Form / select | shadcn primitives only |
| Toast | sonner |
| i18n | i18next stays; default fallback language switches to English; all 27 locales preserved |
| List rows | Two-line — Line 1 name, Line 2 metadata strip (Country · Version · FF · WL · EXILED) |
| List columns | Server / Region / 24h trend / Players / Ping / chevron. **TAGS and Join columns removed.** |
| Trend visualization | Inline SVG sparkline 160×28, 24h × 1h-bucket, with peak/avg/% labels |
| Virtualization | `@tanstack/react-virtual` |
| View toggle | List ↔ Grid (Grid carries the same sparkline in card form). Mobile = list only. |
| Filter | Sidebar (lg+) / Drawer (mobile). URL query-string sync for shareable filter state. |
| Row click | Navigate to existing `/servers/:id` detail page. |
| Server detail | Header + 24h/7d/30d big trend + meta panel + tech list. |
| Stats | recharts dashboard — country trend + mod-loader distribution + global players, all on a card grid. |
| Map | Leaflet core unchanged; surrounding chrome rebuilt with shadcn; mobile = bottom sheet panel. |
| API/Credit/NotFound | Visual-swap only; no IA change. |
| Mobile | Row stacks; filter as Drawer; toolbar chips horizontal-scroll; ≥ 44px tap targets; lg=1024 reveals sidebar. |
| GDPR / consent | Silktide Consent Manager. Sentry deferred until "Analytics" consent. Replay & tracing same. |
| Migration | Big Bang on `main`. 12 commits (see §10). No PR. |

## 4. Architecture

### 4.1 File-system reshape (target end state)

```
src/
  app/                    # NEW — application shell
    main.jsx              # entrypoint (Sentry no longer eager-init)
    routes.jsx            # split out from App.jsx
    providers.jsx         # Provider, ConsentProvider, Suspense, Toaster
  components/
    ui/                   # NEW — shadcn-generated primitives (button, drawer, sheet, ...)
    shell/                # NEW — Container/TopMenu/Footer/Notice (was top-level)
    server/
      ServerRow.jsx       # NEW — replaces ServerListItem
      ServerCard.jsx      # NEW — grid-view variant
      ServerSparkline.jsx # NEW — inline SVG
      ServerMetaStrip.jsx # NEW — Line-2 of two-line row
    filters/
      FilterSidebar.jsx   # NEW
      FilterDrawer.jsx    # NEW (mobile)
      FilterChips.jsx     # NEW — active-filter pills in toolbar
      filterSchema.js     # NEW — single source of truth for filter URL keys
    consent/
      ConsentProvider.jsx # NEW — Silktide adapter + React store
      useConsent.js       # NEW — hook
      sentryGate.js       # NEW — deferred Sentry init
  lib/
    cn.js                 # NEW — Tailwind class merger
    api/                  # rename of root-level apiClient.js + per-resource files
      servers.js          # /servers, /servers/:id, /servers/:id/graph
      trends.js           # NEW — /servers/trends (batched sparkline source)
      stats.js            # /stats/*
      map.js              # /map
    hooks/
      useTrends.js        # NEW — colocated with api/trends.js usage; module-level 5min cache
    format/
      players.js          # parse "22/30" once and stop sprinkling .split('/')
      ping.js
      country.js
  modules/                # Redux thunks unchanged in shape; tests stay green
  pages/
    list/List.jsx         # rewritten
    info/Info.jsx         # rewritten
    stats/Stats.jsx       # rewritten
    map/Map.jsx           # rewritten (Leaflet retained)
    api/Api.jsx           # visual swap
    credit/Credit.jsx     # visual swap
    NotFound.jsx          # visual swap
  i18n/                   # unchanged structure
  styles/
    globals.css           # NEW — Tailwind layers + design tokens
```

### 4.2 Module boundaries

The system separates into four layers, with one-way dependencies (lower depends on higher only):

```
  pages/      ← thin route components, compose features
    │
  components/server, components/filters   ← feature widgets
    │
  components/ui (shadcn), components/shell, components/consent
    │
  lib/        ← framework-agnostic utilities, API clients
```

A page never reaches into a primitive's internals. A feature widget never imports another feature widget. Filter state is owned by the URL (search params), read by the page, passed down — never globally synced through Redux to keep the data flow predictable.

### 4.3 State management

- **Redux** stays for `serverList`, `serverInfo`, `serverMap`, `countryList`, `modLoaderChart`. Existing thunks reused unchanged.
- **Filter state** lives in the URL via `useSearchParams` (React Router 7). The List page derives its visible list by filtering the Redux state through current URL params. This makes filters shareable and back-button-friendly.
- **Trends** are NOT in Redux. They're fetched once per List mount via a small `useTrends()` hook that uses native `fetch` + a `useState`-backed module-level cache (5-minute TTL). Adding TanStack Query for one endpoint is overkill.
- **Consent state** is owned by Silktide (in `localStorage`); React mirror is exposed via `ConsentProvider` using `useSyncExternalStore`.

## 5. Component design

### 5.1 New design-system primitives (generated via shadcn CLI)

`Button`, `Input`, `Select`, `Checkbox`, `RadioGroup`, `Slider`, `Card`, `Badge`, `Drawer`, `Sheet`, `Dialog`, `Tabs`, `Tooltip`, `Popover`, `ScrollArea`, `Separator`, `Skeleton`, plus `Toaster` from `sonner`.

Variants are tuned to the SaaS-dark tone in `tailwind.config.js` (single accent green `#22c55e`, neutrals `#0b0d10` → `#e6e8eb`).

### 5.2 ServerRow (the marquee component)

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ Server                Region    24h trend           Players       Ping        ▸│
│ ──────────────────────────────────────────────────────────────────────────────│
│ Site-19 Mirror        🇰🇷 KR    [sparkline 160×28]  ▰▰▰▱ 22/30   18 ms       ▸│
│ Korea, Republic of │ v14.2.6 │ FF No │ WL No │ EXILED 9.13.3                  │
└────────────────────────────────────────────────────────────────────────────────┘
```

Props: a `Server` object (existing `ServerSummary` shape) and a `trend?: number[] | null`. Render is pure; click handler navigates via `useNavigate` to `/servers/:id`. Memoized with `React.memo` keyed on `serverId + trend reference identity` so virtualization scroll doesn't re-render every row on parent state change.

### 5.3 ServerSparkline

Pure functional component. Renders one `<svg width=160 height=28>` with two paths (filled gradient + stroked line). Accepts `data: number[]` (length = `bucketCount`), `accent: 'green' | 'red' | 'amber' | 'gray'` (derived by trend slope), and shows `peak / avg / Δ%` below as a footer line. Renders a "new" badge if `data === null`.

No `recharts` dependency — recharts is too heavy for hundreds of inline mini-charts. SVG is ~30 lines total.

### 5.4 FilterSidebar / FilterDrawer / FilterChips

All three read/write the same `filterSchema.js`-defined params:

```js
{ region: string[], modded: 'any' | 'vanilla' | 'modded',
  friendlyFire: 'any' | 'on' | 'off', whitelist: 'any' | 'on' | 'off',
  version: string[], playersMin: number, playersMax: number,
  hideEmpty: boolean, hideFull: boolean, search: string, sort: ServerSortType }
```

`FilterSidebar` renders the full controls inline at `lg+`. `FilterDrawer` renders the same controls inside a `Sheet` triggered by a "Filters (n)" button below `lg`. `FilterChips` shows currently-active filters as removable pills in the top toolbar at all breakpoints.

URL serialization: arrays as comma-joined, booleans as `1`/absent, sort as enum string. Default values are *not* serialized (clean URLs).

### 5.5 Consent components

```
<ConsentProvider>             // mounts Silktide script tag, mirrors state
  <App />
</ConsentProvider>
```

`useConsent('analytics')` returns `{ granted: boolean, status: 'unknown' | 'granted' | 'denied' }`. `sentryGate.js` subscribes once at module load: on first transition to `granted`, calls `Sentry.init(...)` (current config); on transition to `denied`, calls `Sentry.getClient()?.close()` and clears the global hub binding.

Note on Sentry's limitation: errors that occur **before** the user grants consent will not be captured. This is the GDPR-correct behavior and is documented in the README.

## 6. Data flow

### 6.1 List page load

```
mount List.jsx
  ├── dispatch fetchServerList()                  → POST /api/servers
  └── useTrends()                                  → GET  /api/servers/trends?window=24h&resolution=1h
                                                     (in parallel; sparklines fade in when resolved)
update URL filter params (useSearchParams)
  └── derive visibleServers = applyFilters(servers, params)
                                                     (memoized; happens in render)
TanStack Virtual renders ~14 rows from visibleServers
  └── each row receives trend = trends?.[serverId] ?? null
```

### 6.2 Refresh cadence

| Source | Cadence | Mechanism |
|---|---|---|
| `/api/servers` | 60 s (existing) | Redux thunk on interval |
| `/api/servers/trends` | 5 min | `useTrends` interval; HTTP `Cache-Control: max-age=60` from server |
| `/api/servers/:id` | on mount | unchanged |
| `/api/servers/:id/graph` | on window-toggle | unchanged |
| `/api/stats/*` | on Stats mount | unchanged |
| `/api/map` | on Map mount | unchanged |

### 6.3 Trends staleness behavior

If `/trends` fails or hasn't resolved yet, rows render with a small "—" sparkline placeholder. The list never blocks on trends. If a server is in the list but missing from trends (new server), its sparkline shows a "new" badge. If trends are stale (> 10 min old per response timestamp), a small warning chip appears in the toolbar.

## 7. GDPR consent design

### 7.1 Silktide adapter contract

```js
// src/components/consent/useConsent.js
export function useConsent(category /* 'necessary' | 'functional' | 'analytics' | 'advertising' */) {
  // useSyncExternalStore over Silktide localStorage state
  // returns { granted: boolean, status: 'unknown' | 'granted' | 'denied' }
}

export function onConsentChange(callback) {
  // returns unsubscribe(); fires whenever any category changes
}
```

The adapter wraps Silktide because (a) Silktide's public JS API for reading state isn't fully documented — we will discover it during commit 04 — and (b) we want a stable internal API so swapping CMP later is a one-file change.

### 7.2 Sentry gating

```
main.jsx
  no Sentry.init here anymore.

src/components/consent/sentryGate.js (imported once from app/main.jsx)
  onConsentChange(({analytics}) => {
    if (analytics.granted && !sentryStarted) initSentry();
    if (!analytics.granted && sentryStarted) shutdownSentry();
  });
```

`initSentry()` carries the existing config (DSN, browserTracingIntegration, replayIntegration, sample rates). `shutdownSentry()` calls `getClient()?.close()` then clears the binding so no further events queue.

### 7.3 web-vitals

Currently called as `reportWebVitals()` with no callback (no-op). Stays no-op unless an analytics endpoint is added later, in which case the callback gets gated by `useConsent('analytics')` the same way as Sentry.

### 7.4 i18n integration

Existing `cookie-notice.message` / `dismiss` / `link-text` keys across 27 locales are repurposed to populate Silktide's `bannerTitle` / `acceptButtonText` / etc. via `silktideCookieBannerManager.updateCookieBannerConfig({...})` whenever `i18n.language` changes. No translation work; only mapping.

## 8. Responsive design

### 8.1 Breakpoints (Tailwind defaults)

| Width | Treatment |
|---|---|
| < 640 (sm) | Single column. Stacked row internals. Drawer filters. List view only (no Grid toggle). |
| 640 – 1023 | Same as < 640 plus wider tap targets restored. |
| ≥ 1024 (lg) | Two-column: 240px filter sidebar + main. List/Grid toggle visible. |
| ≥ 1280 (xl) | Wider sparkline (extends from 160 to 200). |

### 8.2 Mobile row layout

```
┌──────────────────────────────────┐
│ Site-19 Mirror              🇰🇷 KR │
│ v14.2.6 · FF No · WL No          │
│ ▰▰▰▱ 22/30   18 ms   [sparkline]│
└──────────────────────────────────┘
```

The two-line meta strip is shortened on mobile (drops EXILED + Country full name → just country code; visible in row tap → detail page).

### 8.3 Map mobile

Map fills the viewport. The visible-area server list slides up as a Drawer, dragged from the bottom. No floating overlays.

## 9. Error handling

- Network failures (any `/api/*` request) surface a single `sonner` toast and a retry button in the affected area; the rest of the page stays interactive.
- Sparkline load failure → silent (rows render with "—"). No toast.
- Sentry init failure → silent (do not let a tracking init error break the page).
- Consent script failure (Silktide CDN unreachable) → render a minimal in-house fallback banner that defaults to "necessary only" until the user manually opens settings. Sentry stays off in that state.
- Per-page error boundaries (existing pattern via React Suspense `errorElement`) wrap each route's lazy chunk.

## 10. Migration commit sequence

Single branch (`main`). Each commit is a fresh commit (no amends), each builds and type-checks. Commits 7, 9, 10, 11 can be developed in parallel by separate subagent sessions and rebased into order before the final cleanup.

| # | Commit | Notes |
|---|---|---|
| 01 | `chore(deps): install Tailwind v4, shadcn primitives, recharts, lucide-react, @tanstack/react-virtual, sonner, silktide` | Adds only. Old deps untouched. Pin every direct dep per existing security policy. |
| 02 | `feat(ui): set up Tailwind v4 config, design tokens, base layer` | `tailwind.config`, `globals.css`, `cn()` util. Tailwind coexists with Bootstrap CSS for now. |
| 03 | `feat(ui): generate shadcn primitive components` | All listed in §5.1, plus tone-tuned variants. |
| 04 | `feat(consent): replace react-cookie-consent with Silktide CMP + useConsent adapter` | Adapter, ConsentProvider, i18n bridge. Old react-cookie-consent component removed from `App.jsx`. |
| 05 | `feat(observability): defer Sentry init until Analytics consent` | sentryGate; main.jsx no longer eager-inits Sentry. |
| 06 | `feat(shell): rebuild Container/TopMenu/Footer/Notice with shadcn` | Routes preserved. Mobile nav becomes a Sheet. |
| 07 | `feat(list): redesign List page — virtualized two-line rows + sparkline + filter sidebar` | The big one. ServerRow/Sparkline/MetaStrip/FilterSidebar/FilterDrawer/FilterChips/useTrends. |
| 08 | `feat(list): grid view variant with sparkline cards` | View toggle wired up. Mobile auto-falls back to list. |
| 09 | `feat(stats): rebuild Stats page on recharts` | Card-grid dashboard. Removes highcharts/giraffe imports from this page. |
| 10 | `feat(detail): rebuild Server Detail (Info) page` | Header + 24h/7d/30d trend + meta panel + tech list. Uses existing per-server graph endpoint. |
| 11 | `feat(map+misc): integrate shadcn side panel into Map; visual-swap API/Credit/NotFound` | Leaflet core untouched. |
| 12 | `chore: remove bootstrap, bootswatch, react-bootstrap, FA, react-select, react-datepicker, react-toastify, react-cookie-consent, highcharts, highcharts-react-official, @influxdata/giraffe; cleanup CSS/i18n keys` | The cutover. Bundle size measured and noted in commit message. **Kept:** `swagger-ui-react` (still backs the `/api` page), `react-leaflet`, `leaflet`, `react-world-flags`, `country-list`, `js-cookie`, `axios`. |

Rollback is `git revert <12-commit range>`. Partial rollback is not supported.

## 11. Testing strategy

- **Vitest + RTL** stays. Existing tests under `App.test.jsx` updated as the shell changes.
- New tests added with each feature commit:
  - Commit 04 — `useConsent` hook with mock localStorage; transitions fire subscribers.
  - Commit 05 — `sentryGate` calls `initSentry` once on grant, `shutdownSentry` on revoke; idempotent.
  - Commit 07 — filter URL serialization round-trip; row renders given a `Server` + `number[] | null`; FilterDrawer opens/closes.
  - Commit 09/10 — recharts components render with mock series.
- **Visual / manual QA checklist** (to run before commit 12):
  - List page on viewport 360 / 768 / 1280.
  - Filter share via URL: copy URL, paste in new tab, identical filter state.
  - Consent: deny analytics → verify no `sentry.io` requests in DevTools Network; grant → verify init.
  - i18n switch on consent banner: change language, banner text updates.
  - Map page: bottom sheet drag on mobile.
- Type checking: `pnpm vite build` must pass at every commit.

## 12. Risks & open items

| Risk | Mitigation |
|---|---|
| Silktide JS API for reading consent state is not fully documented in public docs | Commit 04 starts with a 1-hour spike to read Silktide's `localStorage` keys directly and confirm event hooks; adapter encapsulates whatever is found. |
| `/api/servers/trends` endpoint not yet implemented on backend | Frontend ships with graceful "—" fallback; the page works without trends. API team works in parallel from the handoff prompt. |
| Bundle size could grow despite removing Bootstrap | Measure in commit 12 (`vite build --report`). Hard ceiling: gzipped main chunk ≤ existing size + 50 KB. If exceeded, audit recharts imports first (use sub-imports). |
| 27 locale files reference `cookie-notice` keys; mismatched mapping could leave untranslated banner | Commit 04 includes a script that asserts every locale has all 4 mapped keys; CI fails if missing. |
| Single-branch Big Bang means `main` carries half-migrated state during the days it takes | Each commit is independently buildable. CI runs on each commit. Commits 6-11 leave the user-facing app working (just visually mixed) until commit 12 lands. |

## 13. Out of scope (explicit)

- No "Join" button. The site is a directory; joining happens in-game.
- No "Tags" column. The data is ambiguous and not a backend-supported field.
- No SSR/Next.js migration. Vite SPA stays.
- No theme toggle. Dark only.
- No new analytics provider. Only Sentry, gated behind consent.
- No PWA / service worker.
- No real-time push (websockets / SSE). Polling at the same cadences as today.
- No language preference UI rework. Existing language picker stays.
- No accessibility audit beyond shadcn's built-in a11y guarantees and a quick keyboard-nav pass.

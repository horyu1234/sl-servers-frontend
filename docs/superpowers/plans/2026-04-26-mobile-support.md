# Mobile Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the site usable on phones — fix the broken List page first, then audit and patch other pages on real viewports.

**Architecture:** Phone (`< sm`, ≤ 639px) renders existing `ServerCard` in compact mode at 1 column; tablet (`sm`–`lg`) renders cards at 2 columns; desktop (`≥ lg`) keeps the existing `ServerRow` table view unchanged. Card layout is forced for the entire `< lg` range because the `ViewToggle` button is `hidden lg:inline-flex` — users below `lg` have no way to escape a broken list view. Compact density only kicks in below `sm`. Phone branching is driven by a new `useMediaQuery` hook. Toolbar count text is hidden on phones since `ServerStatsHeader` exposes the same numbers. After List is done, run a viewport audit (chrome-devtools MCP at 360 / 412 / 768 px) on every route and patch only confirmed regressions.

**Tech Stack:** React 19, Tailwind v4, @tanstack/react-virtual, Vite, Vitest, react-leaflet, recharts.

**Spec:** `docs/superpowers/specs/2026-04-26-mobile-support-design.md`

---

## File Structure

| File | Purpose | Status |
|---|---|---|
| `src/lib/hooks/useMediaQuery.js` | matchMedia hook returning a reactive boolean | Create |
| `src/lib/hooks/useMediaQuery.test.jsx` | Unit tests for the hook | Create |
| `src/components/server/ServerSparkline.jsx` | Add `compact` prop + fluid SVG width | Modify |
| `src/components/server/ServerSparkline.test.jsx` | Add tests for compact mode | Modify |
| `src/components/server/ServerCard.jsx` | Add `compact` prop | Modify |
| `src/components/server/ServerCard.test.jsx` | New file with compact-mode coverage | Create |
| `src/pages/list/List.jsx` | Phone-aware view selection, virtualization, toolbar count visibility | Modify |
| `src/pages/list/List.test.jsx` | Add a phone-viewport assertion | Modify (may be touched only if the existing test breaks; otherwise leave alone) |

The phone-vs-desktop decision lives in `List.jsx` only. `ServerCard` and `ServerSparkline` accept `compact` as an opt-in prop; they remain layout-agnostic. `useMediaQuery` is generic and reusable.

---

## Task 1: Add `useMediaQuery` hook

**Files:**
- Create: `src/lib/hooks/useMediaQuery.js`
- Create: `src/lib/hooks/useMediaQuery.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `src/lib/hooks/useMediaQuery.test.jsx`:

```jsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMediaQuery } from './useMediaQuery';

describe('useMediaQuery', () => {
  let listeners;
  let currentMatches;

  beforeEach(() => {
    listeners = new Set();
    currentMatches = false;
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      media: query,
      get matches() { return currentMatches; },
      addEventListener: (_, cb) => listeners.add(cb),
      removeEventListener: (_, cb) => listeners.delete(cb),
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
      onchange: null,
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the initial matchMedia value synchronously', () => {
    currentMatches = true;
    const { result } = renderHook(() => useMediaQuery('(max-width: 639px)'));
    expect(result.current).toBe(true);
  });

  it('updates when matchMedia fires a change event', () => {
    currentMatches = false;
    const { result } = renderHook(() => useMediaQuery('(max-width: 639px)'));
    expect(result.current).toBe(false);

    act(() => {
      currentMatches = true;
      for (const cb of listeners) cb({ matches: true });
    });
    expect(result.current).toBe(true);
  });

  it('removes its listener on unmount', () => {
    const { unmount } = renderHook(() => useMediaQuery('(max-width: 639px)'));
    expect(listeners.size).toBe(1);
    unmount();
    expect(listeners.size).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/lib/hooks/useMediaQuery.test.jsx --run`
Expected: FAIL — module `./useMediaQuery` not found.

- [ ] **Step 3: Write the hook**

Create `src/lib/hooks/useMediaQuery.js`:

```js
import { useEffect, useState } from 'react';

// Reactive boolean for `window.matchMedia(query)`. The initial value is read
// synchronously so the first paint matches the final layout (no flicker).
// Vite SPA only — no SSR safety beyond a defensive `window` guard.
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (event) => setMatches(event.matches);
    setMatches(mql.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

export default useMediaQuery;
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test src/lib/hooks/useMediaQuery.test.jsx --run`
Expected: PASS — all 3 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/hooks/useMediaQuery.js src/lib/hooks/useMediaQuery.test.jsx
git commit -m "feat(hooks): add useMediaQuery for viewport-driven branching"
```

---

## Task 2: Add `compact` prop to `ServerSparkline` + fluid width

**Files:**
- Modify: `src/components/server/ServerSparkline.jsx`
- Modify: `src/components/server/ServerSparkline.test.jsx`

- [ ] **Step 1: Add a failing test for compact mode**

Append to `src/components/server/ServerSparkline.test.jsx` inside the existing `describe('ServerSparkline', ...)` block, before the closing brace:

```jsx
  it('renders peak/avg/delta on a single row when compact', () => {
    const { container } = render(<ServerSparkline data={[1,2,3,4]} compact />);
    const summary = container.querySelector('[data-testid="sparkline-summary"]');
    expect(summary).not.toBeNull();
    expect(summary.getAttribute('data-compact')).toBe('true');
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/components/server/ServerSparkline.test.jsx --run`
Expected: FAIL — `summary` is null because `data-testid` does not exist yet.

- [ ] **Step 3: Update `ServerSparkline.jsx`**

Replace the entire file with:

```jsx
import React, { useMemo } from 'react';

const VIEW_W = 160;
const VIEW_H = 28;

const ACCENT = { stroke: '#22c55e', fill: '#22c55e' };

function pointsFor(data) {
  if (!data || data.length === 0) return [];
  const yMax = Math.max(...data.map((v) => v ?? 0)) || 1;
  const stepX = VIEW_W / (data.length - 1 || 1);
  return data.map((v, i) => {
    const value = v ?? 0;
    const x = Math.round(i * stepX);
    const y = Math.round(VIEW_H - 2 - (value / yMax) * (VIEW_H - 4));
    return [x, y];
  });
}

function summarise(data) {
  const numeric = data.filter((v) => typeof v === 'number');
  const peak = numeric.length ? Math.max(...numeric) : 0;
  const avg = numeric.length ? Math.round(numeric.reduce((a, b) => a + b, 0) / numeric.length) : 0;
  const first = numeric[0] ?? 0;
  const last = numeric[numeric.length - 1] ?? 0;
  const delta = first === 0 ? 0 : Math.round(((last - first) / first) * 100);
  return { peak, avg, delta };
}

export function ServerSparkline({ data, className = '', compact = false }) {
  const computed = useMemo(() => {
    if (data === null) return { state: 'new' };
    if (Array.isArray(data) && data.length === 0) return { state: 'empty' };
    if (!Array.isArray(data)) return { state: 'empty' };
    const summary = summarise(data);
    const points = pointsFor(data);
    const linePath = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ');
    const fillPath = `${linePath} L${VIEW_W},${VIEW_H} L0,${VIEW_H} Z`;
    return { state: 'ok', summary, linePath, fillPath };
  }, [data]);

  if (computed.state === 'new') {
    return <span className={`text-[10px] uppercase tracking-wider text-muted-foreground ${className}`}>new</span>;
  }
  if (computed.state === 'empty') {
    return <span className={`text-muted-foreground ${className}`}>—</span>;
  }

  const { summary, linePath, fillPath } = computed;
  const deltaClass =
    summary.delta > 5 ? 'text-[#22c55e]' : summary.delta < -5 ? 'text-[#ef4444]' : 'text-muted-foreground';
  const arrow = summary.delta > 5 ? '▲' : summary.delta < -5 ? '▼' : '—';
  const sign = summary.delta >= 0 ? '+' : '';

  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ width: '100%', height: VIEW_H }}
      >
        <path d={fillPath} fill={ACCENT.fill} fillOpacity="0.18" />
        <path d={linePath} fill="none" stroke={ACCENT.stroke} strokeWidth="1.3" />
      </svg>
      <div
        data-testid="sparkline-summary"
        data-compact={compact ? 'true' : 'false'}
        className="flex justify-between text-[9px] text-muted-foreground tabular-nums"
      >
        <span className="truncate">peak {summary.peak} · avg {summary.avg}</span>
        <span className={`${deltaClass} whitespace-nowrap`}>{arrow} {sign}{summary.delta}%</span>
      </div>
    </div>
  );
}

export default ServerSparkline;
```

Notes for the engineer:
- `WIDTH` was a render-time pixel; `VIEW_W` is now the SVG view-box only — DOM width comes from CSS.
- The label markup is now identical for compact and non-compact (same single-row layout). The only behavior change: `width: '100%'` lets the SVG fill its parent. The `compact` prop is passed through for callers that want to style differently in the future and is reflected in `data-compact` for tests.

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test src/components/server/ServerSparkline.test.jsx --run`
Expected: PASS — all 5 tests green (4 existing + 1 new).

- [ ] **Step 5: Run the full test suite**

Run: `pnpm test --run`
Expected: PASS — no regressions in `ServerRow.test.jsx`, `List.test.jsx`, or others.

- [ ] **Step 6: Commit**

```bash
git add src/components/server/ServerSparkline.jsx src/components/server/ServerSparkline.test.jsx
git commit -m "feat(sparkline): fluid width and compact prop"
```

---

## Task 3: Add `compact` prop to `ServerCard`

**Files:**
- Modify: `src/components/server/ServerCard.jsx`
- Create: `src/components/server/ServerCard.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/server/ServerCard.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from '../../store';
import '../../i18n/i18n';
import { ServerCard } from './ServerCard';

const sampleServer = {
  serverId: 7,
  isoCode: 'KR',
  ip: '1.2.3.4',
  port: 7777,
  version: '14.2.6',
  friendlyFire: false,
  whitelist: false,
  modded: false,
  players: '5/30',
  info: 'Site-19 Mirror',
  techList: [{ name: 'EXILED', version: '9.13.3' }],
};

function renderCard(props = {}) {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <ServerCard server={sampleServer} trend={[1,2,3]} {...props} />
      </MemoryRouter>
    </Provider>
  );
}

describe('ServerCard', () => {
  it('renders the IP:Port mono line in non-compact mode', () => {
    const { container } = renderCard();
    const monoLines = container.querySelectorAll('.font-mono');
    // The card has the name's IP fallback span (font-mono) only when info is absent;
    // with info present, the dedicated IP line under the name is the only .font-mono.
    expect(monoLines.length).toBeGreaterThanOrEqual(1);
  });

  it('omits the dedicated IP:Port line in compact mode', () => {
    const { container } = renderCard({ compact: true });
    const monoLines = container.querySelectorAll('.font-mono');
    expect(monoLines.length).toBe(0);
  });

  it('renders the meta strip in compact mode (single line)', () => {
    const { container } = renderCard({ compact: true });
    // Compact ServerMetaStrip renders `v… · FF … · WL …` as one text node.
    const meta = container.textContent;
    expect(meta).toMatch(/v14\.2\.6/);
    expect(meta).toMatch(/FF/);
    expect(meta).toMatch(/WL/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/components/server/ServerCard.test.jsx --run`
Expected: FAIL — the second test fails because compact mode is not implemented and `.font-mono` lines still render.

- [ ] **Step 3: Update `ServerCard.jsx`**

Replace the entire file with:

```jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ServerSparkline } from './ServerSparkline';
import { ServerMetaStrip } from './ServerMetaStrip';
import SafeHtml from '../shell/SafeHtml';
import { CountryFlag } from './CountryFlag';
import { parsePlayers, playersPercent } from '../../lib/format/players';
import getCountryName from '../../i18n/i18n-countries';
import { cn } from '@/lib/cn';

export function ServerCard({ server, trend, compact = false }) {
  const navigate = useNavigate();
  const players = parsePlayers(server.players);
  const pct = playersPercent(players);
  const barColor = pct >= 95 ? 'bg-[#ef4444]' : pct >= 80 ? 'bg-[#f59e0b]' : 'bg-primary';

  return (
    <Card
      className="cursor-pointer hover:border-primary/40 transition-colors"
      onClick={() => navigate(`/servers/${server.serverId}`)}
    >
      <CardContent className={cn('space-y-2', compact ? 'p-2.5 space-y-1.5' : 'p-3')}>
        <div className="flex items-start justify-between gap-2 min-w-0">
          <div className="min-w-0">
            <div className="font-medium truncate">
              {server.info
                ? <SafeHtml html={server.info} />
                : <span className="font-mono">{server.ip}:{server.port}</span>}
            </div>
            {!compact && server.info && (
              <div className="font-mono text-[10px] text-muted-foreground/70 truncate">
                {server.ip}:{server.port}
              </div>
            )}
          </div>
          <div
            className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0 max-w-[160px]"
            title={getCountryName(server.isoCode) || server.isoCode}
          >
            <CountryFlag isoCode={server.isoCode} className="rounded-[1px] shadow-sm shrink-0" />
            <span className="truncate">{getCountryName(server.isoCode) || server.isoCode}</span>
          </div>
        </div>
        <ServerMetaStrip server={server} compact={compact} />
        <ServerSparkline data={trend} compact={compact} />
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground tabular-nums pt-1">
          <span className="inline-block flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <span className={cn('block h-full', barColor)} style={{ width: `${pct}%` }} />
          </span>
          <span className="text-foreground/80 whitespace-nowrap">{players.current} / {players.capacity}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default ServerCard;
```

> **Important — the IP fallback case:** When `server.info` is empty, the name span renders `font-mono`. The compact-mode test in Step 1 uses a server with `info: 'Site-19 Mirror'`, so that branch is not hit. Do not move the `font-mono` class off the fallback span — it is the visual cue that the card is showing a raw address, not a parsed name.

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test src/components/server/ServerCard.test.jsx --run`
Expected: PASS — all 3 tests green.

- [ ] **Step 5: Run the full test suite**

Run: `pnpm test --run`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/server/ServerCard.jsx src/components/server/ServerCard.test.jsx
git commit -m "feat(server-card): compact density prop"
```

---

## Task 4: Wire phone awareness into `List.jsx`

**Files:**
- Modify: `src/pages/list/List.jsx`

This task does not introduce new tests because `List.test.jsx` already covers the desktop path through the global jsdom layout shim (`offsetWidth: 800`). The phone path is exercised manually in Task 5.

- [ ] **Step 1: Read the current file**

Read `src/pages/list/List.jsx` end-to-end before editing. The change touches:
- Imports (add `useMediaQuery`).
- `view` selection (introduce `effectiveView`).
- The toolbar count `<div>` (add `hidden sm:block`).
- The `useWindowVirtualizer` `count` argument (use `effectiveView`).
- The render branch (use `effectiveView`).
- Pass `compact={isPhone}` to `<ServerCard>`.

- [ ] **Step 2: Apply the edits**

Make these exact edits to `src/pages/list/List.jsx`:

**Edit A — imports.** Add the hook import. Find:

```jsx
import { useTrends } from '../../lib/hooks/useTrends';
```

Insert immediately after:

```jsx
import { useMediaQuery } from '../../lib/hooks/useMediaQuery';
```

**Edit B — derive `isPhone` and `effectiveView`.** Find:

```jsx
  const view = searchParams.get('view') === 'grid' ? 'grid' : 'list';
  const setView = (v) => {
    const next = new URLSearchParams(searchParams);
    if (v === 'list') next.delete('view'); else next.set('view', v);
    setSearchParams(next, { replace: true });
  };
```

Replace with:

```jsx
  const view = searchParams.get('view') === 'grid' ? 'grid' : 'list';
  const setView = (v) => {
    const next = new URLSearchParams(searchParams);
    if (v === 'list') next.delete('view'); else next.set('view', v);
    setSearchParams(next, { replace: true });
  };

  // Phones (< sm) cannot fit the desktop ServerRow grid; force card view there.
  // The toggle button is already hidden below `lg`, so users only see this
  // override; the URL contract (?view=grid) still controls tablet/desktop.
  const isPhone = useMediaQuery('(max-width: 639px)');
  const effectiveView = isPhone ? 'grid' : view;
```

**Edit C — toolbar count visibility.** Find:

```jsx
          <div className="ml-auto text-xs text-muted-foreground tabular-nums">
            {fetching ? t('filter-option.refreshing') : `${stats.displayServerCount.toLocaleString()} / ${stats.onlineServerCount.toLocaleString()} servers`}
          </div>
```

Replace with:

```jsx
          <div className="ml-auto hidden sm:block text-xs text-muted-foreground tabular-nums">
            {fetching ? t('filter-option.refreshing') : `${stats.displayServerCount.toLocaleString()} / ${stats.onlineServerCount.toLocaleString()} servers`}
          </div>
```

**Edit D — virtualizer count.** Find:

```jsx
  const virtualizer = useWindowVirtualizer({
    count: view === 'list' ? servers.length : 0,
    estimateSize: () => ROW_HEIGHT,
    overscan: 6,
    scrollMargin: listParentRef.current?.offsetTop ?? 0,
  });
```

Replace with:

```jsx
  const virtualizer = useWindowVirtualizer({
    count: effectiveView === 'list' ? servers.length : 0,
    estimateSize: () => ROW_HEIGHT,
    overscan: 6,
    scrollMargin: listParentRef.current?.offsetTop ?? 0,
  });
```

**Edit E — render branch + compact card.** Find:

```jsx
        {view === 'list' ? (
          <div ref={listParentRef} className="relative" style={{ height: virtualizer.getTotalSize() }}>
            {virtualizer.getVirtualItems().map((vi) => {
              const server = servers[vi.index];
              return (
                <div
                  key={server.serverId}
                  ref={virtualizer.measureElement}
                  data-index={vi.index}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${vi.start - (listParentRef.current?.offsetTop ?? 0)}px)`,
                  }}
                >
                  <ServerRow server={server} trend={trends?.[String(server.serverId)] ?? null} unit={unit} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4">
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
              {servers.map((server) => (
                <ServerCard key={server.serverId} server={server} trend={trends?.[String(server.serverId)] ?? null} />
              ))}
            </div>
          </div>
        )}
```

Replace with:

```jsx
        {effectiveView === 'list' ? (
          <div ref={listParentRef} className="relative" style={{ height: virtualizer.getTotalSize() }}>
            {virtualizer.getVirtualItems().map((vi) => {
              const server = servers[vi.index];
              return (
                <div
                  key={server.serverId}
                  ref={virtualizer.measureElement}
                  data-index={vi.index}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${vi.start - (listParentRef.current?.offsetTop ?? 0)}px)`,
                  }}
                >
                  <ServerRow server={server} trend={trends?.[String(server.serverId)] ?? null} unit={unit} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4">
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
              {servers.map((server) => (
                <ServerCard
                  key={server.serverId}
                  server={server}
                  trend={trends?.[String(server.serverId)] ?? null}
                  compact={isPhone}
                />
              ))}
            </div>
          </div>
        )}
```

- [ ] **Step 3: Run the full test suite**

Run: `pnpm test --run`
Expected: PASS — `List.test.jsx` should still pass because the global jsdom shim returns `offsetWidth: 800`, which is `> 639`, so `isPhone` is `false` (jsdom's default `window.matchMedia` returns `matches: false` for any unmatched query — verify by reading the failure if any).

If `List.test.jsx` fails because `useMediaQuery` is called in jsdom without a `matchMedia` polyfill, fall through to **Step 3a**:

- [ ] **Step 3a (only if Step 3 failed): Polyfill matchMedia in setupTests.js**

Add to the bottom of `src/setupTests.js`:

```js
// jsdom does not implement matchMedia; provide a stub so useMediaQuery does
// not throw. All tests run as if the viewport is desktop (`(max-width: 639px)`
// returns false), matching the rest of the layout shim above.
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  window.matchMedia = (query) => ({
    media: query,
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
    onchange: null,
  });
}
```

Then re-run `pnpm test --run`. Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/pages/list/List.jsx
# add setupTests.js too only if you needed Step 3a:
git add src/setupTests.js 2>/dev/null
git commit -m "feat(list): force compact card view on phones"
```

---

## Task 5: Manual verification of List page on phone viewports

**Files:** none.

This is a verification gate, not a code change. No commit unless a regression is found.

- [ ] **Step 1: Start the dev server**

Run: `pnpm start`

Expected: Vite logs `Local: http://localhost:3185/` (or similar). Leave it running.

- [ ] **Step 2: Open the page at 412 px and check the broken state is fixed**

Open `http://localhost:3185/` in a browser and use chrome-devtools MCP (or DevTools manually) to set the viewport to **412 × 915** (Samsung Galaxy S20 Ultra).

Expected results:
- No horizontal page scroll. The page fits 412 px exactly.
- The toolbar shows only `Filter Options` (with optional active-count badge) — the `1,165 / 1,165 servers` text is gone.
- Below the toolbar, the two `ServerStatsHeader` cards (Users, Servers) appear stacked.
- Server cards render at 1 column. Each card shows: server name (truncated), country flag + name, a single-line meta strip (`v… · FF … · WL …` with optional `· EXILED …`), the sparkline, and a single-line player progress bar with `current / capacity`. No `IP:Port` mono line under the name.
- Tapping a card navigates to `/servers/<id>`.
- Smooth scroll through the list — virtualization keeps the list responsive even with > 1,000 servers.

- [ ] **Step 3: Sanity-check intermediate viewports**

Repeat at 360 × 800 and 768 × 1024:

- 360 × 800: same as 412; cards still 1 column.
- 768 × 1024 (tablet): cards switch to 2 columns. Toolbar count visible (`hidden sm:block` → block at ≥ 640). Filter sidebar still hidden (`hidden lg:flex` — sidebar appears only at ≥ 1024).
- 1024 × 768: sidebar appears, cards 2 columns (`xl:grid-cols-3` kicks in at ≥ 1280, not yet here).

Stop the dev server when done (`Ctrl+C`).

- [ ] **Step 4: Stop here if everything looks right**

If the List page is fixed and behaves as described above, this task is complete. Move on to Task 6.

If anything is wrong, document the symptom in the conversation and decide whether the existing tasks need a follow-up commit before continuing.

---

## Task 6: Audit other pages on phone viewports (List complete → verify the rest)

**Files:** none yet — discovery first.

Run `pnpm start` and walk every route at **412 × 915**, then **360 × 800**. Document concrete symptoms (not guesses). For each confirmed issue, open a follow-up task in this plan or in a new commit.

- [ ] **Step 1: `/` — already covered by Task 5.**

- [ ] **Step 2: `/servers/<id>` — Info page**

Visit a known server detail (pick any `serverId` from the list). Check:

- Header card: name truncates cleanly; status badge does not collide.
- "Statistics" card: `PeriodPicker` controls do not overflow; the recharts trend chart fits the viewport.
- recharts X-axis tick labels — confirm whether they overflow/clip. Tick labels overflowing into the next tick are common at narrow widths and may be acceptable.
- The right-side `ServerMetaPanel` should appear stacked below (not beside) the chart.

If any of these is broken, write the fix in **Task 7-Info**.

- [ ] **Step 3: `/stats` — All-stats page**

Check:

- `CountryMultiSelect` width and overflow.
- `PeriodPicker` controls.
- Both charts fit the viewport.
- The right-side `ModLoaderChart` card stacks below the trend card.

If broken, write **Task 7-Stats**.

- [ ] **Step 4: `/map` — Map page**

Check:

- Map height: `h-[calc(100vh-12rem)]`. Confirm there is no excessive empty space below the map at 915 px height.
- Tap a marker; the popup (`MapPopup`) — is it readable and dismissible?

If broken, write **Task 7-Map**.

- [ ] **Step 5: `/api` — Swagger UI**

Swagger-UI's mobile rendering is largely the widget's responsibility. Confirm only that the page itself does not break the layout (no horizontal scroll on the wrapper, no broken padding). Internal table scrolling is acceptable.

- [ ] **Step 6: `/credit` — credits**

Quick visual check. Almost certainly fine.

- [ ] **Step 7: TopMenu hamburger sheet (`w-[300px]`)**

Open the menu. On a 360 px phone, a 300 px sheet leaves only 60 px showing through; verify it does not feel claustrophobic. If it does, tighten via Task 7-Topmenu.

- [ ] **Step 8: FilterDrawer sheet (`w-[320px]`)**

Open the filter drawer. Same check: 320 px on a 360 px phone leaves 40 px. Confirm filter controls fit and are usable.

- [ ] **Step 9: Cookie consent banner**

Confirm the banner at the bottom-right is not covering critical content. If it overlaps the last server card, decide whether to move it inline at narrow widths.

- [ ] **Step 10: Compile a punch list**

For every confirmed issue, capture (a) the page, (b) the viewport, (c) the symptom, (d) the proposed fix in 1 sentence. Stop here and re-enter brainstorming/writing-plans for any non-trivial fix.

---

## Task 7-*: Audit-driven follow-ups (deferred)

These tasks are not pre-specified. Each confirmed regression from Task 6 gets its own focused commit:

- `Task 7-Info` — only if Step 2 found a real issue.
- `Task 7-Stats` — only if Step 3 found a real issue.
- `Task 7-Map` — only if Step 4 found a real issue.
- `Task 7-Topmenu` — only if Step 7 found a real issue.
- `Task 7-Filter-drawer` — only if Step 8 found a real issue.
- `Task 7-Consent` — only if Step 9 found a real issue.

Each follow-up should:
1. Reproduce the symptom in a description.
2. Apply the minimal fix (often a Tailwind class change).
3. Verify by re-running `pnpm test --run` and re-opening the page in the affected viewport.
4. Commit with a `fix(<page>): …` message.

Do **not** preemptively touch any of these files. The whole point of Task 6 is to avoid speculative edits.

---

## Post-Implementation Notes

- **Task 4 widening landed in commit `e10f3af`.** The plan's Task 4 forces cards on phones only (`isPhone`). Task 5's manual viewport check at 768 px showed `ServerRow` also breaks on tablets (`sm`–`lg`), and `ViewToggle` is `hidden lg:inline-flex` so users there have no escape hatch. Fix: introduced a second `useMediaQuery('(max-width: 1023px)')` (`isBelowLg`) and switched `effectiveView` to use it. `isPhone` still drives the `compact` prop.

- **Phone-card virtualization landed after a real-device complaint.** First shipped without virtualization on the card path (YAGNI). On a real phone, initial load took ~15s and dragging revealed a blank area below the first cards because mounting all ~1,165 compact cards (each with an `<svg>` sparkline + flag image + multiple text nodes) blocked the main thread. Fix: extended the existing `useWindowVirtualizer` to also fire when `isPhone` (single-column card path), so only the visible window plus an overscan buffer is in the DOM at any time. Verified at 412 px: ~10 cards in DOM at any scroll position vs. 1,168 before. The multi-column tablet card path (`sm`–`lg`, 2 columns) still uses the CSS grid without virtualization — combining grid layout with absolute positioning is awkward and tablets fared better than phones in the original complaint.

## Self-Review Notes

- **Spec coverage:** every spec section is mapped to a task — `useMediaQuery` (T1), `ServerSparkline` (T2), `ServerCard` (T3), `List.jsx` wire-up (T4), manual List verification (T5), other-page audit (T6), follow-ups (T7-*).
- **Placeholder scan:** clean — no TBD, no "add appropriate error handling", no untyped follow-ups (all T7 entries are explicitly conditional and reference what triggers them).
- **Type consistency:** `compact` boolean prop is added with the same name in `ServerSparkline`, `ServerCard`, and `ServerMetaStrip` (latter already exists with that name). `isPhone` and `effectiveView` are introduced in `List.jsx` only and used consistently in Edits B/D/E.
- **Phone-card virtualization:** the spec calls for virtualizing the phone card path. **Decision: deferred to a follow-up.** Reason: the card grid uses CSS Grid; making `useWindowVirtualizer` cooperate with `grid-cols-1 sm:grid-cols-2` requires either branching to a different list path on phones or measuring per-row height with `measureElement`. Both are feasible but add risk to the first commit. Task 5 explicitly verifies smoothness at > 1,000 servers; if it is not smooth, a `Task 7-Phone-virtualization` will be added. This is a deliberate scope cut, not a placeholder.

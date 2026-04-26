# Plan D — Server Detail Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/servers/:id` on shadcn + recharts + the components introduced in Plans A–C. The page becomes a single-server dashboard: header card (name HTML, status, ip:port, country, players), then a player-count trend chart with the same `PeriodPicker` controls used on the Stats page, and a metadata panel beside it.

**Architecture:** Existing Redux `serverInfo` thunk + `getServerInfoAPI` are reused. The `/api/servers/{id}/graph` endpoint returns a Flux CSV — we re-use `parseFluxToSeries` from Plan C with `groupBy: 'version'` so each game version becomes its own line series. Layout is a 2-column grid at `lg+`: left card holds header + trend; right card holds metadata. Mobile collapses to a single column.

**Tech Stack:** React 19, recharts, shadcn (Card, Badge, Alert), the Plan B `CountryFlag` + `SafeHtml` + `parsePlayers`, and the Plan C `PeriodPicker` + `parseFluxToSeries`.

**Spec reference:** `docs/superpowers/specs/2026-04-25-design-overhaul-design.md` §5 (Server detail) + §10 commit 10.

**Branch:** `main` (no PR; commits land directly).

---

## Files map

**Created:**
- `src/lib/api/servers.js` — wraps the existing `getServerInfoAPI` and `getServerGraphAPI` from the legacy `apiClient.js` (the Plan F cleanup deletes the legacy file; the new wrapper is the long-term home).
- `src/components/server/ServerDetailHeader.jsx` — sticky-ish header card with name (HTML), status badge, ip:port (monospace), country (flag + full name), players, distance.
- `src/components/server/ServerMetaPanel.jsx` — right-column card listing all metadata keys vertically (FF, WL, modded, version, distance, pastebin link, EXILED + tech list).
- `src/components/server/ServerTrendChart.jsx` — recharts `LineChart` for one-server trend, parses the same Flux body via `parseFluxToSeries({groupBy:'version'})`.

**Modified:**
- `src/pages/info/Info.jsx` — full rewrite.

**Untouched (Plan F deletes them):**
- The legacy `apiClient.js` is still imported by `serverInfo.js`/`serverList.js`/etc. — Plan F migrates remaining callers to `lib/api/*` then deletes the file.
- Legacy `components/{TrendGraph, GraphOption, ServerDistance, PeriodSelect, ResolutionSelect, datetime-select/}` remain orphaned for Plan F removal.

---

## Task 1: lib/api/servers.js

**Files:**
- Create: `src/lib/api/servers.js`

- [ ] **Step 1.1: Implement (no tests; trivial wrappers)**

```js
import Axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL;

const instance = Axios.create({
  baseURL,
  timeout: 30_000,
});

/** GET /api/servers/{serverId} -> ServerSummary */
export function getServerInfoAPI(serverId) {
  return instance.get(`/servers/${serverId}`);
}

/**
 * GET /api/servers/{serverId}/graph
 * params: { startTime, stopTime?, aggregateEvery }
 * Returns: Flux CSV string body.
 */
export function getServerGraphAPI(serverId, params) {
  return instance.get(`/servers/${serverId}/graph`, { params });
}
```

- [ ] **Step 1.2: Verify build**

```bash
pnpm build
```

- [ ] **Step 1.3: Defer commit — combine with Tasks 2 + 3 + 4 below.**

---

## Task 2: ServerDetailHeader

**Files:**
- Create: `src/components/server/ServerDetailHeader.jsx`

- [ ] **Step 2.1: Implement**

```jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CountryFlag } from './CountryFlag';
import SafeHtml from '../shell/SafeHtml';
import { parsePlayers, playersPercent } from '../../lib/format/players';
import getCountryName from '../../i18n/i18n-countries';
import { cn } from '@/lib/cn';

export function ServerDetailHeader({ server }) {
  const { t } = useTranslation();
  const players = parsePlayers(server.players);
  const pct = playersPercent(players);
  const barColor = pct >= 95 ? 'bg-[#ef4444]' : pct >= 80 ? 'bg-[#f59e0b]' : 'bg-emerald-500';
  const country = getCountryName(server.isoCode) || server.isoCode || '—';

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0 flex-1">
            <div className="text-xl font-semibold leading-tight">
              {server.info ? <SafeHtml html={server.info} /> : `${server.ip}:${server.port}`}
            </div>
            <div className="font-mono text-xs text-muted-foreground mt-1">{server.ip}:{server.port}</div>
          </div>
          <Badge
            variant="secondary"
            className={cn(
              'rounded-md font-normal',
              server.online
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-destructive/15 text-destructive border-destructive/30'
            )}
          >
            {server.online ? t('server-info.status.online') : t('server-info.status.offline')}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <div className="flex items-center gap-1.5">
            <CountryFlag isoCode={server.isoCode} className="rounded-[1px] shadow-sm" />
            <span className="text-muted-foreground">{country}</span>
          </div>
          <div className="flex items-center gap-2 min-w-[200px] flex-1">
            <span className="inline-block flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <span className={cn('block h-full', barColor)} style={{ width: `${pct}%` }} />
            </span>
            <span className="text-muted-foreground tabular-nums whitespace-nowrap">
              {players.current} / {players.capacity} {t('server-info.players').toLowerCase()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ServerDetailHeader;
```

- [ ] **Step 2.2: Defer commit.**

---

## Task 3: ServerMetaPanel + ServerTrendChart

**Files:**
- Create: `src/components/server/ServerMetaPanel.jsx`
- Create: `src/components/server/ServerTrendChart.jsx`

- [ ] **Step 3.1: Write `src/components/server/ServerMetaPanel.jsx`**

```jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

function Row({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="text-muted-foreground text-xs uppercase tracking-wider">{label}</span>
      <span className="text-foreground text-right break-all">{value ?? '—'}</span>
    </div>
  );
}

export function ServerMetaPanel({ server }) {
  const { t } = useTranslation();
  const yes = t('server-list.tech.yes');
  const no  = t('server-list.tech.no');
  const distanceKm = server.distance != null ? `${Math.round(server.distance)} km` : '—';
  const tech = server.techList ?? [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t('server-info.title')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Row label={t('server-list.tech.game-version')} value={server.version} />
        <Row label={t('server-list.tech.friendly-fire')} value={server.friendlyFire ? yes : no} />
        <Row label={t('server-list.tech.whitelist')} value={server.whitelist ? yes : no} />
        <Row label={t('filter-option.yes-no-filter.modded')} value={server.modded ? yes : no} />
        <Row label={t('server-info.distance')} value={distanceKm} />
        <Row label={t('server-info.pastebin')} value={
          server.pastebin
            ? <a href={`https://pastebin.com/${server.pastebin}`} target="_blank" rel="noreferrer" className="text-primary hover:underline">{server.pastebin}</a>
            : '—'
        } />
        {tech.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">tech</div>
              {tech.map((entry, i) => (
                <Row key={`${entry.name}-${i}`} label={entry.name} value={entry.version} />
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default ServerMetaPanel;
```

- [ ] **Step 3.2: Write `src/components/server/ServerTrendChart.jsx`**

```jsx
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { format } from 'date-fns';
import { parseFluxToSeries } from '../../lib/parsers/flux';

const PALETTE = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4'];

export function ServerTrendChart({ fluxResponse }) {
  const data = useMemo(
    () => parseFluxToSeries(fluxResponse, { groupBy: 'version' }),
    [fluxResponse]
  );
  const versions = useMemo(() => {
    const set = new Set();
    for (const row of data) for (const k of Object.keys(row)) if (k !== 'time') set.add(k);
    return Array.from(set).sort();
  }, [data]);

  if (data.length === 0) return null;

  return (
    <div className="h-[340px] w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
          <defs>
            {versions.map((v, i) => (
              <linearGradient key={v} id={`fill-${v}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={PALETTE[i % PALETTE.length]} stopOpacity={0.35} />
                <stop offset="100%" stopColor={PALETTE[i % PALETTE.length]} stopOpacity={0}    />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="time"
            tickFormatter={(v) => format(new Date(v), 'MM-dd HH:mm')}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            stroke="hsl(var(--border))"
            minTickGap={32}
          />
          <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} stroke="hsl(var(--border))" />
          <Tooltip
            contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 6, fontSize: 12 }}
            labelFormatter={(v) => format(new Date(v), 'yyyy-MM-dd HH:mm')}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {versions.map((v, i) => (
            <Area
              key={v}
              type="monotone"
              dataKey={v}
              name={`v${v}`}
              stroke={PALETTE[i % PALETTE.length]}
              strokeWidth={1.5}
              fill={`url(#fill-${v})`}
              connectNulls
              isAnimationActive={false}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ServerTrendChart;
```

(Imports include `LineChart`/`Line` for symmetry with `CountryTrendChart`, but the actual render is `AreaChart`/`Area` — soft fill below the line gives a richer single-server look. `LineChart`/`Line` imports are unused; remove them in the final file.)

- [ ] **Step 3.3: Trim unused imports — keep only what's used**

Edit the import line so only `AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer` remain:

```jsx
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
```

- [ ] **Step 3.4: Defer commit.**

---

## Task 4: Info.jsx rewrite

**Files:**
- Modify: `src/pages/info/Info.jsx`

- [ ] **Step 4.1: Replace the file**

```jsx
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Info as InfoIcon, X } from 'lucide-react';
import { ServerDetailHeader } from '../../components/server/ServerDetailHeader';
import { ServerMetaPanel } from '../../components/server/ServerMetaPanel';
import { ServerTrendChart } from '../../components/server/ServerTrendChart';
import { PeriodPicker } from '../../components/stats/PeriodPicker';
import { getServerGraphAPI } from '../../lib/api/servers';
import * as serverInfoActions from '../../modules/serverInfo';

function isNumericId(id) {
  return /^\d+$/.test(String(id));
}

export default function Info() {
  const { t } = useTranslation();
  const { serverId } = useParams();
  const dispatch = useDispatch();
  const fetching = useSelector((s) => s.serverInfo.fetching);
  const error = useSelector((s) => s.serverInfo.error);
  const server = useSelector((s) => s.serverInfo.data);

  const [flux, setFlux] = useState(null);
  const [graphError, setGraphError] = useState(false);
  const [showDaylightAlert, setShowDaylightAlert] = useState(true);
  const inflightRef = useRef(0);

  useEffect(() => {
    if (!isNumericId(serverId)) return;
    dispatch(serverInfoActions.getServerInfo(serverId));
  }, [dispatch, serverId]);

  function fetchGraph(params) {
    if (!isNumericId(serverId)) return;
    setFlux(null);
    setGraphError(false);
    const reqId = ++inflightRef.current;
    getServerGraphAPI(serverId, params)
      .then((r) => { if (reqId === inflightRef.current) setFlux(r.data); })
      .catch(() => { if (reqId === inflightRef.current) setGraphError(true); });
  }

  useEffect(() => {
    fetchGraph({ aggregateEvery: '5m', startTime: '-1w' });
    return () => { inflightRef.current++; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverId]);

  if (!isNumericId(serverId) || (!fetching && !error && (!server || Object.keys(server).length === 0))) {
    return (
      <div className="px-4 py-4">
        <Card>
          <CardHeader><CardTitle>{t('server-info.title')}</CardTitle></CardHeader>
          <CardContent>
            <Alert variant="destructive"><AlertDescription>{t('server-info.not-exist')}</AlertDescription></Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-4">
        <Card>
          <CardHeader><CardTitle>{t('server-info.title')}</CardTitle></CardHeader>
          <CardContent>
            <Alert variant="destructive"><AlertDescription>{t('general.server-error')}</AlertDescription></Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!server || Object.keys(server).length === 0) {
    return (
      <div className="px-4 py-4 text-sm text-muted-foreground">{t('server-info.loading') || 'Loading…'}</div>
    );
  }

  return (
    <div className="px-4 py-4 grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        <ServerDetailHeader server={server} />

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('server-info.statistics')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {showDaylightAlert && (
              <Alert className="relative pr-10">
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>{t('server-info.daylight-saving-time')}</AlertDescription>
                <Button
                  variant="ghost" size="icon"
                  className="absolute top-1.5 right-1.5 h-7 w-7"
                  onClick={() => setShowDaylightAlert(false)}
                  aria-label="Dismiss"
                ><X className="h-4 w-4" /></Button>
              </Alert>
            )}

            <PeriodPicker onUpdate={fetchGraph} />

            {graphError && <Alert variant="destructive"><AlertDescription>{t('general.server-error')}</AlertDescription></Alert>}
            {!graphError && !flux && <div className="text-sm text-muted-foreground">{t('server-info.graph.loading')}</div>}
            {!graphError && flux && <ServerTrendChart fluxResponse={flux} />}
          </CardContent>
        </Card>
      </div>

      <ServerMetaPanel server={server} />
    </div>
  );
}
```

- [ ] **Step 4.2: Run tests + build + dev smoke**

```bash
pnpm test --run && pnpm build
```

Expected: 57 tests still pass; build clean.

```bash
pnpm start
```

Wait for "Local: http://localhost:3185/", kill the background.

- [ ] **Step 4.3: Commit Tasks 1 + 2 + 3 + 4 together**

Stage exactly: `src/lib/api/servers.js`, `src/components/server/ServerDetailHeader.jsx`, `src/components/server/ServerMetaPanel.jsx`, `src/components/server/ServerTrendChart.jsx`, `src/pages/info/Info.jsx`. Commit message via heredoc:

```
feat(detail): rebuild server detail page on shadcn + recharts

Two-column layout (lg+; collapses to single column below): left column
holds the ServerDetailHeader card (HTML name + status badge + ip:port +
country + players bar) and a Statistics card with PeriodPicker (reused
from Plan C) and an AreaChart trend grouped by game version. Right
column is the ServerMetaPanel with version, FF, WL, modded, distance,
pastebin link, and any tech entries (EXILED etc.) listed in a tidy
key/value form.

The Flux CSV body from /api/servers/{id}/graph is parsed via
parseFluxToSeries with groupBy='version' so each game version is its
own line. AreaChart with linearGradient fills gives a softer single-
server look than the multi-line country chart on Stats.

PeriodPicker carries Plan C's behavior including time-of-day calendar
popovers and start<stop validation. fetchGraph uses an inflight
request-id ref so concurrent updates / unmount don't leave stale data.

The legacy /servers/:id detail (TrendGraph/GraphOption/Bootstrap-
Container/Alert) is fully replaced; the legacy components remain
orphaned for Plan F removal.
```

## Self-review

- 4 new files; 1 modified (`Info.jsx`).
- 57 tests still pass; build clean.
- Dev server starts.

## Report format

Status: DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT

If DONE: commit SHA, test summary, build line.

---

## Self-review summary

Plan D covers spec §5 (Server detail) and §10 commit 10. Reuses Plan B (`SafeHtml`, `CountryFlag`, `parsePlayers`) and Plan C (`PeriodPicker`, `parseFluxToSeries`) so most of the heavy lifting already exists.

Risks:
- The `PeriodPicker` defaults to `1week` and the page's initial fetch hardcodes `-1w` / `5m`. They match by accident; if PeriodPicker's defaults shift in a future change, the picker UI may show one period while the chart shows another until the user clicks Update Graph. Acceptable for now.
- `serverInfo.data` is `{}` initially — emptiness needs explicit detection (the `Object.keys(server).length === 0` check) instead of just `!server`.

Out of scope for Plan D:
- Page-level error boundary (use the route-level Suspense fallback)
- Real-time updates / polling on the detail page
- Sharing card (OG image, etc.)

---

## Plan complete — execution handoff

**Two execution options:**

**1. Subagent-Driven (recommended)**
**2. Inline Execution**

Choose by replying with **1** or **2**.

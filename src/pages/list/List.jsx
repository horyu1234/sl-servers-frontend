import React, { useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { ServerRow } from '../../components/server/ServerRow';
import { ServerStatsHeader } from '../../components/server/ServerStatsHeader';
import { ViewToggle } from '../../components/server/ViewToggle';
import { ServerCard } from '../../components/server/ServerCard';
import { FilterSidebar } from '../../components/filters/FilterSidebar';
import { FilterDrawer } from '../../components/filters/FilterDrawer';
import { FilterChips } from '../../components/filters/FilterChips';
import { parseFromSearchParams, toSearchParams } from '../../components/filters/filterSchema';
import { useTrends } from '../../lib/hooks/useTrends';
import * as serverFilterActions from '../../modules/serverFilter';
import * as serverListActions from '../../modules/serverList';

function shallowEqualFilter(a, b) {
  return (
    a.search === b.search &&
    a.hideEmptyServer === b.hideEmptyServer &&
    a.hideFullServer === b.hideFullServer &&
    a.friendlyFire === b.friendlyFire &&
    a.whitelist === b.whitelist &&
    a.modded === b.modded &&
    a.sort === b.sort &&
    a.countryFilter.length === b.countryFilter.length &&
    a.countryFilter.every((c, i) => c === b.countryFilter[i])
  );
}

const ROW_HEIGHT = 80;

export default function List() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  // Memo on the URLSearchParams' STRING form, not the object reference.
  // React Router can return a new URLSearchParams instance on every render
  // even when the URL hasn't changed; using `searchParams` directly as a
  // dep makes useMemo always recompute, producing a new `filter` object
  // each render, which then re-fires the dispatch effect below in a loop.
  const filterKey = searchParams.toString();
  const filter = useMemo(() => parseFromSearchParams(searchParams), [filterKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const view = searchParams.get('view') === 'grid' ? 'grid' : 'list';
  const setView = (v) => {
    const next = new URLSearchParams(searchParams);
    if (v === 'list') next.delete('view'); else next.set('view', v);
    setSearchParams(next, { replace: true });
  };

  // Sync URL filter -> Redux serverFilter, then refetch.
  useEffect(() => {
    dispatch(serverFilterActions.changeSearch(filter.search));
    dispatch(serverFilterActions.changeCountry(filter.countryFilter));
    dispatch(serverFilterActions.changeHideEmpty(filter.hideEmptyServer));
    dispatch(serverFilterActions.changeHideFull(filter.hideFullServer));
    dispatch(serverFilterActions.changeFriendlyFire(filter.friendlyFire));
    dispatch(serverFilterActions.changeWhitelist(filter.whitelist));
    dispatch(serverFilterActions.changeModded(filter.modded));
    dispatch(serverFilterActions.changeSortType(filter.sort));
    dispatch(serverListActions.getServerList());
  }, [dispatch, filter]);

  const stats = useSelector((s) => s.serverList.data);
  const servers = stats.servers ?? [];
  const fetching = useSelector((s) => s.serverList.fetching);
  const error = useSelector((s) => s.serverList.error);
  // Memoize the serverIds-by-content key so identical fetches (auto-refresh
  // returning the same servers) don't churn useTrends. The dependency array
  // is the joined ID string, not the array reference.
  const idsKey = servers.map((s) => s.serverId).join(',');
  const serverIds = useMemo(() => servers.map((s) => s.serverId), [idsKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const { trends } = useTrends(serverIds);

  const updateFilter = (next) => {
    if (shallowEqualFilter(filter, next)) return;
    setSearchParams(toSearchParams(next), { replace: false });
  };

  // Window-scroll virtualizer: the entire page scrolls (body), and the
  // virtualizer measures items relative to the document. This is robust
  // against ancestor flex/min-height misconfigs (an element-scroll
  // virtualizer needs a measurable parent height — fragile here because
  // legacy CSS still loads alongside Tailwind).
  const listParentRef = useRef(null);
  const virtualizer = useWindowVirtualizer({
    count: view === 'list' ? servers.length : 0,
    estimateSize: () => ROW_HEIGHT,
    overscan: 6,
    scrollMargin: listParentRef.current?.offsetTop ?? 0,
  });

  return (
    <div className="flex">
      <FilterSidebar value={filter} onChange={updateFilter} />
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-border sticky top-14 z-20 bg-background/90 backdrop-blur">
          <FilterDrawer value={filter} onChange={updateFilter} />
          <FilterChips value={filter} onChange={updateFilter} />
          <ViewToggle value={view} onChange={setView} />
          <div className="ml-auto text-xs text-muted-foreground tabular-nums">
            {fetching ? t('filter-option.refreshing') : `${stats.displayServerCount.toLocaleString()} / ${stats.onlineServerCount.toLocaleString()} servers`}
          </div>
        </div>

        <div className="px-4 py-3">
          <ServerStatsHeader
            loading={fetching && servers.length === 0}
            online={stats.onlineServerCount}
            displayed={stats.displayServerCount}
            offline={stats.offlineServerCount}
            users={stats.onlineUserCount}
            displayedUsers={stats.displayUserCount}
          />
        </div>

        {error && (
          <div className="px-4 py-3 text-sm text-destructive">
            {t('general.server-error') || 'Failed to load servers.'}
          </div>
        )}

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
                  <ServerRow server={server} trend={trends?.[String(server.serverId)] ?? null} />
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

        <div className="px-4 py-2 text-[10px] text-muted-foreground border-t border-border">
          This product includes GeoLite2 data created by MaxMind, available from{' '}
          <a href="https://www.maxmind.com" target="_blank" rel="noreferrer" className="underline">maxmind.com</a>.
        </div>
      </div>
    </div>
  );
}

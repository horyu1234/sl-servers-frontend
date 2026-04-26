import React, { useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ServerRow } from '../../components/server/ServerRow';
import { ServerStatsHeader } from '../../components/server/ServerStatsHeader';
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

const ROW_HEIGHT = 60;

export default function List() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = useMemo(() => parseFromSearchParams(searchParams), [searchParams]);

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
  const { trends } = useTrends();

  const updateFilter = (next) => {
    if (shallowEqualFilter(filter, next)) return;
    setSearchParams(toSearchParams(next), { replace: false });
  };

  const scrollRef = useRef(null);
  const virtualizer = useVirtualizer({
    count: servers.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 6,
  });

  return (
    <div className="flex-1 min-h-0 flex">
      <FilterSidebar value={filter} onChange={updateFilter} />
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-border">
          <FilterDrawer value={filter} onChange={updateFilter} />
          <FilterChips value={filter} onChange={updateFilter} />
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

        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto">
          <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
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
                    transform: `translateY(${vi.start}px)`,
                  }}
                >
                  <ServerRow server={server} trend={trends?.[String(server.serverId)] ?? null} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-4 py-2 text-[10px] text-muted-foreground border-t border-border">
          This product includes GeoLite2 data created by MaxMind, available from{' '}
          <a href="https://www.maxmind.com" target="_blank" rel="noreferrer" className="underline">maxmind.com</a>.
        </div>
      </div>
    </div>
  );
}

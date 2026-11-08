import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import { ServerSparkline } from './ServerSparkline';
import type { SparklineData } from './ServerSparkline';
import { ServerMetaStrip } from './ServerMetaStrip';
import { PlayerBar } from './PlayerBar';
import { SERVER_ROW_GRID } from './serverRowGrid';
import SafeHtml from '../shell/SafeHtml';
import { CountryFlag } from './CountryFlag';
import { parsePlayers, playersPercent } from '../../lib/format/players';
import { formatDistance } from '../../lib/format/distance';
import getCountryName from '../../i18n/i18n-countries';
import { cn } from '@/lib/cn';
import type { ServerSummary } from '../../types/api';

interface ServerRowProps {
  server: ServerSummary;
  trend?: SparklineData;
  density?: 'cozy' | 'compact';
  unit?: string;
  onClick?: () => void;
}

function ServerRowImpl({ server, trend, density = 'cozy', unit = 'km', onClick }: ServerRowProps) {
  // The country name follows the language, which the memo comparison below does not see.
  useTranslation();
  const navigate = useNavigate();
  const players = parsePlayers(server.players);
  const pct = playersPercent(players);
  const handleClick = onClick ?? (() => navigate(`/servers/${server.serverId}`));
  const countryName = getCountryName(server.isoCode) || server.isoCode;

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'group grid min-h-[76px] w-full items-center gap-3 border-b border-border/70 px-4 py-2.5 text-left transition-colors',
        'hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
        SERVER_ROW_GRID
      )}
    >
      <div className="min-w-0">
        {/* Names can hold many <br/> lines, so clamp them to keep rows even. */}
        <div className="line-clamp-2 text-sm font-medium leading-5 text-foreground">
          {server.info
            ? <SafeHtml html={server.info} />
            : <span className="font-mono">{server.ip}:{server.port}</span>}
        </div>
        <ServerMetaStrip server={server} compact={density === 'compact'} />
      </div>
      <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground" title={countryName}>
        <CountryFlag isoCode={server.isoCode} className="rounded-[1px] shadow-sm shrink-0" />
        <span className="truncate min-[1440px]:hidden">{server.isoCode}</span>
        <span className="hidden truncate min-[1440px]:inline">{countryName}</span>
      </div>
      <div className="hidden truncate font-mono text-xs tabular-nums text-muted-foreground min-[1440px]:block" title={`${server.ip}:${server.port}`}>
        {server.ip}:{server.port}
      </div>
      <ServerSparkline data={trend} />
      <div className="flex min-w-0 items-center gap-2 text-xs tabular-nums">
        <PlayerBar percent={pct} className="min-w-0 flex-1" />
        <span className="whitespace-nowrap text-foreground">{players.current} / {players.capacity}</span>
      </div>
      <div className="whitespace-nowrap text-xs tabular-nums text-muted-foreground">
        {formatDistance(server.distance, unit)}
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground/60 transition-colors group-hover:text-foreground" aria-hidden="true" />
    </button>
  );
}

export const ServerRow = memo(ServerRowImpl, (prev, next) => {
  const a = prev.server;
  const b = next.server;
  return (
    prev.density === next.density &&
    prev.trend === next.trend &&
    prev.unit === next.unit &&
    a.serverId === b.serverId &&
    a.ip === b.ip &&
    a.port === b.port &&
    a.players === b.players &&
    a.version === b.version &&
    a.friendlyFire === b.friendlyFire &&
    a.whitelist === b.whitelist &&
    a.modded === b.modded &&
    a.isoCode === b.isoCode &&
    a.distance === b.distance &&
    a.info === b.info
  );
});

export default ServerRow;

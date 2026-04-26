import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { ServerSparkline } from './ServerSparkline';
import { ServerMetaStrip } from './ServerMetaStrip';
import SafeHtml from '../shell/SafeHtml';
import { CountryFlag } from './CountryFlag';
import { parsePlayers, playersPercent } from '../../lib/format/players';
import getCountryName from '../../i18n/i18n-countries';
import { cn } from '@/lib/cn';

function ServerRowImpl({ server, trend, density = 'cozy', onClick }) {
  const navigate = useNavigate();
  const players = parsePlayers(server.players);
  const pct = playersPercent(players);
  const handleClick = onClick ?? (() => navigate(`/servers/${server.serverId}`));

  const barColor = pct >= 95 ? 'bg-[#ef4444]' : pct >= 80 ? 'bg-[#f59e0b]' : 'bg-primary';

  return (
    <button
      type="button"
      onClick={handleClick}
      className="grid w-full items-center gap-3 px-4 py-2.5 border-b border-border text-left hover:bg-muted/40 group"
      style={{ gridTemplateColumns: '1.3fr 150px 150px 170px 130px 60px 18px' }}
    >
      <div className="min-w-0">
        <div className="truncate font-medium text-foreground">
          {server.info
            ? <SafeHtml html={server.info} />
            : <span className="font-mono">{server.ip}:{server.port}</span>}
        </div>
        <ServerMetaStrip server={server} compact={density === 'compact'} />
      </div>
      <div
        className="flex items-center gap-1.5 text-[11px] text-muted-foreground min-w-0"
        title={getCountryName(server.isoCode) || server.isoCode}
      >
        <CountryFlag isoCode={server.isoCode} className="rounded-[1px] shadow-sm shrink-0" />
        <span className="truncate">{getCountryName(server.isoCode) || server.isoCode}</span>
      </div>
      <div className="font-mono text-[11px] text-muted-foreground tabular-nums truncate" title={`${server.ip}:${server.port}`}>
        {server.ip}:{server.port}
      </div>
      <ServerSparkline data={trend} capacity={players.capacity} current={players.current}/>
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground tabular-nums">
        <span className="inline-block w-[100px] h-1.5 bg-muted rounded-full overflow-hidden">
          <span className={cn('block h-full', barColor)} style={{ width: `${pct}%` }} />
        </span>
        <span className="text-foreground/80 whitespace-nowrap">{players.current} / {players.capacity}</span>
      </div>
      <div className="text-[11px] text-muted-foreground tabular-nums whitespace-nowrap">
        {server.distance != null ? `${Math.round(server.distance)} km` : '—'}
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground"/>
    </button>
  );
}

export const ServerRow = memo(ServerRowImpl, (prev, next) => {
  const a = prev.server;
  const b = next.server;
  return (
    prev.density === next.density &&
    prev.trend === next.trend &&
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

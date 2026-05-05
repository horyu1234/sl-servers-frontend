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
      className="min-w-0 cursor-pointer hover:border-primary/40 transition-colors"
      onClick={() => navigate(`/servers/${server.serverId}`)}
    >
      <CardContent className={cn('space-y-2', compact ? 'p-2.5 space-y-1.5' : 'p-3')}>
        <div className="flex items-start justify-between gap-2 min-w-0">
          <div className="min-w-0">
            <div className="truncate font-medium">
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
            className="flex min-w-0 max-w-[42%] shrink-0 items-center gap-1 text-[11px] text-muted-foreground sm:max-w-[160px]"
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

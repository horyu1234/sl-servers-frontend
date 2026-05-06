import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Users } from 'lucide-react';
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
  const countryName = getCountryName(server.isoCode) || server.isoCode;
  const openServer = () => navigate(`/servers/${server.serverId}`);
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openServer();
    }
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      className="group min-w-0 cursor-pointer border border-transparent transition-colors hover:border-primary/35 hover:bg-card/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      onClick={openServer}
      onKeyDown={handleKeyDown}
    >
      <CardContent className={cn('space-y-2.5', compact ? 'p-3 space-y-2' : 'p-3.5')}>
        <div className="min-w-0 space-y-1">
          <div className="flex min-w-0 items-start justify-between gap-2">
            <div className="min-w-0 truncate text-[15px] font-semibold leading-snug text-foreground group-hover:text-foreground">
              {server.info
                ? <SafeHtml html={server.info} />
                : <span className="font-mono">{server.ip}:{server.port}</span>}
            </div>
            <div className="inline-flex shrink-0 items-center gap-1 rounded-md bg-muted px-2 py-1 text-[11px] font-medium tabular-nums text-foreground/90">
              <Users className="h-3.5 w-3.5 text-primary" />
              <span>{players.current}/{players.capacity}</span>
            </div>
          </div>
          <div className="flex min-w-0 items-center justify-between gap-2">
            <div
              className="flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground"
              title={countryName}
            >
              <CountryFlag isoCode={server.isoCode} className="shrink-0 rounded-[1px] shadow-sm" />
              <span className="truncate">{countryName}</span>
            </div>
            {!compact && server.info && (
              <div className="min-w-0 shrink font-mono text-[10px] text-muted-foreground/70 truncate">
                {server.ip}:{server.port}
              </div>
            )}
          </div>
        </div>
        <ServerMetaStrip server={server} compact={compact} />
        <ServerSparkline data={trend} compact={compact} />
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground tabular-nums pt-0.5">
          <Activity className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" aria-hidden="true" />
          <span className="inline-block h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <span className={cn('block h-full', barColor)} style={{ width: `${pct}%` }} />
          </span>
          <span className="w-9 text-right text-foreground/80">{pct}%</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default ServerCard;

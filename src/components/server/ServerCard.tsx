import React from 'react';
import { Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ServerSparkline } from './ServerSparkline';
import type { SparklineData } from './ServerSparkline';
import { ServerMetaStrip } from './ServerMetaStrip';
import { PlayerBar } from './PlayerBar';
import SafeHtml from '../shell/SafeHtml';
import { CountryFlag } from './CountryFlag';
import { LocaleLink } from '../shell/LocaleLink';
import { pathOf } from '../../site/routes';
import { parsePlayers, playersPercent } from '../../lib/format/players';
import getCountryName from '../../i18n/i18n-countries';
import { cn } from '@/lib/cn';
import type { ServerSummary } from '../../types/api';

interface ServerCardProps {
  server: ServerSummary;
  trend?: SparklineData;
  compact?: boolean;
}

export function ServerCard({ server, trend, compact = false }: ServerCardProps) {
  const players = parsePlayers(server.players);
  const pct = playersPercent(players);
  const countryName = getCountryName(server.isoCode) || server.isoCode;

  return (
    <LocaleLink
      to={pathOf('server', { serverId: server.serverId })}
      className="group block min-w-0 rounded-lg no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
    <Card className="h-full min-w-0 transition-colors group-hover:border-primary/40">
      <CardContent className={cn('flex h-full flex-col', compact ? 'gap-2 p-3' : 'gap-2.5 p-3.5')}>
        <div className="flex min-w-0 items-start justify-between gap-2">
          {/* Names can hold many <br/> lines, so clamp them to keep cards even. */}
          <div className="line-clamp-2 min-w-0 text-sm font-semibold leading-5 text-foreground">
            {server.info
              ? <SafeHtml html={server.info} />
              : <span className="font-mono">{server.ip}:{server.port}</span>}
          </div>
          <div className="inline-flex shrink-0 items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-medium tabular-nums text-foreground">
            <Users className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span>{players.current}/{players.capacity}</span>
          </div>
        </div>
        <div className="flex min-w-0 items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex min-w-0 items-center gap-1.5" title={countryName}>
            <CountryFlag isoCode={server.isoCode} className="shrink-0 rounded-[1px] shadow-sm" />
            <span className="truncate">{countryName}</span>
          </div>
          {!compact && server.info && (
            <div className="min-w-0 shrink truncate font-mono">{server.ip}:{server.port}</div>
          )}
        </div>
        <ServerMetaStrip server={server} compact={compact} />
        <div className="mt-auto space-y-2">
          <ServerSparkline data={trend} compact={compact} />
          <PlayerBar percent={pct} />
        </div>
      </CardContent>
    </Card>
    </LocaleLink>
  );
}

export default ServerCard;

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
          <div className="min-w-0 flex-1 basis-64">
            <div className="break-words text-lg font-semibold leading-tight sm:text-xl">
              {server.info ? <SafeHtml html={server.info} /> : `${server.ip}:${server.port}`}
            </div>
            <div className="mt-1 break-all font-mono text-xs text-muted-foreground">{server.ip}:{server.port}</div>
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
          <div className="flex min-w-full items-center gap-2 sm:min-w-[200px] sm:flex-1">
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

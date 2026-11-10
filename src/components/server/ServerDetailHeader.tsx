import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CountryFlag } from './CountryFlag';
import { LocaleLink, useLocalePath } from '../shell/LocaleLink';
import { pathOf } from '../../site/routes';
import { PlayerBar } from './PlayerBar';
import SafeHtml from '../shell/SafeHtml';
import { CopyButton } from '../shared/CopyButton';
import { ServerOfflineNotice } from './ServerOfflineNotice';
import { parsePlayers, playersPercent } from '../../lib/format/players';
import getCountryName from '../../i18n/i18n-countries';
import { cn } from '@/lib/cn';
import type { ServerSummary } from '../../types/api';

function BackToList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const localePath = useLocalePath();
  // Going back keeps the list's filters and sort. A direct visit has nothing to go back to.
  const goBack = () => (location.key === 'default' ? navigate(localePath('/')) : navigate(-1));

  return (
    <button
      type="button"
      onClick={goBack}
      className="inline-flex items-center gap-1.5 rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      {t('navbar.server-list')}
    </button>
  );
}

export function ServerDetailHeader({ server }: { server: ServerSummary }) {
  const { t } = useTranslation();
  const players = parsePlayers(server.players);
  const pct = playersPercent(players);
  const country = getCountryName(server.isoCode) || server.isoCode || '—';
  // The API leaves out the IP of a server that has been offline for more than 30 days.
  const address = server.ip === null ? null : `${server.ip}:${server.port}`;

  return (
    <div className="space-y-3">
      <BackToList />
      <Card>
        <CardContent className="space-y-4 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <h1 className="min-w-0 break-words text-lg font-semibold leading-snug sm:text-xl">
              {server.info ? <SafeHtml html={server.info} /> : (address ?? `#${server.serverId}`)}
            </h1>
            <Badge
              variant="secondary"
              className={cn(
                'shrink-0 rounded-md font-normal',
                server.online
                  ? 'border-primary/30 bg-primary/15 text-primary'
                  : 'border-destructive/30 bg-destructive/15 text-destructive'
              )}
            >
              {server.online ? t('server-info.status.online') : t('server-info.status.offline')}
            </Badge>
          </div>

          <ServerOfflineNotice server={server} />

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            {address !== null && (
              <>
                <span className="break-all font-mono text-muted-foreground">{address}</span>
                <CopyButton value={address} label={t('server-info.copy-address')} copiedLabel={t('server-info.address-copied')} />
              </>
            )}
            <LocaleLink
              to={pathOf('country', { isoCode: server.isoCode.toLowerCase() })}
              className="flex items-center gap-1.5 text-muted-foreground no-underline hover:text-foreground"
            >
              <CountryFlag isoCode={server.isoCode} className="rounded-[1px] shadow-sm" />
              {country}
            </LocaleLink>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <PlayerBar percent={pct} className="min-w-0 flex-1" />
            <span className="whitespace-nowrap tabular-nums text-muted-foreground">
              <span className="font-medium text-foreground">{players.current} / {players.capacity}</span>{' '}
              {t('server-info.players').toLowerCase()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ServerDetailHeader;

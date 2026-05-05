import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatDistance } from '../../lib/format/distance';

function Row({ label, value }) {
  return (
    <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-baseline sm:justify-between sm:gap-3 lg:flex-col lg:items-stretch xl:flex-row xl:items-baseline">
      <span className="text-muted-foreground text-xs uppercase tracking-wider">{label}</span>
      <span className="break-all text-foreground sm:text-right lg:text-left xl:text-right">{value ?? '—'}</span>
    </div>
  );
}

export function ServerMetaPanel({ server }) {
  const { t } = useTranslation();
  const unit = useSelector((s) => s.setting.si);
  const yes = t('server-list.tech.yes');
  const no  = t('server-list.tech.no');
  const distanceLabel = formatDistance(server.distance, unit);
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
        <Row label={t('server-info.distance')} value={distanceLabel} />
        <Row label={t('server-info.pastebin')} value={
          server.pastebin
            ? <a href={`https://pastebin.com/${encodeURIComponent(server.pastebin)}`} target="_blank" rel="noreferrer" className="text-primary hover:underline">{server.pastebin}</a>
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

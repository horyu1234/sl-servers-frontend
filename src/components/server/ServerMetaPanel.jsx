import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

function Row({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="text-muted-foreground text-xs uppercase tracking-wider">{label}</span>
      <span className="text-foreground text-right break-all">{value ?? '—'}</span>
    </div>
  );
}

export function ServerMetaPanel({ server }) {
  const { t } = useTranslation();
  const yes = t('server-list.tech.yes');
  const no  = t('server-list.tech.no');
  const distanceKm = server.distance != null ? `${Math.round(server.distance)} km` : '—';
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
        <Row label={t('server-info.distance')} value={distanceKm} />
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

import React from 'react';
import { useTranslation } from 'react-i18next';
import { PowerOff } from 'lucide-react';
import { formatAgo, formatLocalDateTime } from '../../lib/format/lastSeen';
import type { ServerSummary } from '../../types/api';

interface ServerOfflineNoticeProps {
  server: Pick<ServerSummary, 'online' | 'ip' | 'lastSeen'>;
  now?: number;
}

export function ServerOfflineNotice({ server, now = Date.now() }: ServerOfflineNoticeProps) {
  const { t, i18n } = useTranslation();
  // An API build without lastSeen leaves the field out. It would read as "no record", so say nothing.
  if (server.online || server.lastSeen === undefined) return null;

  const lastSeen = server.lastSeen ? Date.parse(server.lastSeen) : NaN;
  const known = !Number.isNaN(lastSeen);

  return (
    <div className="flex gap-2.5 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm">
      <PowerOff className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
      <div className="min-w-0 space-y-1">
        <p className="font-medium text-foreground">
          {known
            ? t('server-info.offline-notice.last-online', { ago: formatAgo(lastSeen, now, i18n) })
            : t('server-info.offline-notice.unknown')}
          {known && (
            <>
              <span className="text-muted-foreground" aria-hidden="true"> · </span>
              <time dateTime={server.lastSeen ?? undefined} className="whitespace-nowrap font-normal tabular-nums text-muted-foreground">
                {formatLocalDateTime(lastSeen)}
              </time>
            </>
          )}
        </p>
        {server.ip === null && (
          <p className="text-muted-foreground">{t('server-info.offline-notice.ip-hidden')}</p>
        )}
      </div>
    </div>
  );
}

export default ServerOfflineNotice;

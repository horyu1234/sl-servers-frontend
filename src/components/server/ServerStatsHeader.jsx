import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Server } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function ServerStatsHeader({ loading, online, displayed, offline, users, displayedUsers }) {
  const { t } = useTranslation();
  if (loading) {
    return (
      <Card><CardContent className="py-3 text-center text-sm text-muted-foreground">{t('server-list.loading')}</CardContent></Card>
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Card>
        <CardContent className="py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">{t('server-stats.users-title')}</span>
          </div>
          <div className="text-sm tabular-nums">
            <span className="text-foreground font-medium">{displayedUsers.toLocaleString()}</span>
            <span className="text-muted-foreground"> / {users.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Server className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">{t('server-stats.servers-title')}</span>
          </div>
          <div className="text-sm tabular-nums">
            <span className="text-foreground font-medium">{displayed.toLocaleString()}</span>
            <span className="text-muted-foreground"> / {online.toLocaleString()}</span>
            <span className="text-muted-foreground/60"> ({offline.toLocaleString()} {t('server-stats.offline-label').toLowerCase()})</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ServerStatsHeader;

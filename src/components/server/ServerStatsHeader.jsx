import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Server } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

function StatCard({ icon: Icon, label, children }) {
  return (
    <Card className="min-w-0 border border-transparent">
      <CardContent className="flex min-w-0 items-start justify-between gap-3 px-3 py-3 sm:items-center sm:px-4">
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </span>
          <span className="truncate text-muted-foreground">{label}</span>
        </div>
        <div className="min-w-0 text-right text-sm tabular-nums">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

export function ServerStatsHeader({ loading, online, displayed, offline, users, displayedUsers }) {
  const { t } = useTranslation();
  if (loading) {
    return (
      <Card><CardContent className="py-3 text-center text-sm text-muted-foreground">{t('server-list.loading')}</CardContent></Card>
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <StatCard icon={Users} label={t('server-stats.users-title')}>
        <span className="font-semibold text-foreground">{displayedUsers.toLocaleString()}</span>
        <span className="text-muted-foreground"> / {users.toLocaleString()}</span>
      </StatCard>
      <StatCard icon={Server} label={t('server-stats.servers-title')}>
        <span className="font-semibold text-foreground">{displayed.toLocaleString()}</span>
        <span className="text-muted-foreground"> / {online.toLocaleString()}</span>
        <div className="mt-0.5 text-[11px] leading-none text-muted-foreground/70">
          {offline.toLocaleString()} {t('server-stats.offline-label').toLowerCase()}
        </div>
      </StatCard>
    </div>
  );
}

export default ServerStatsHeader;

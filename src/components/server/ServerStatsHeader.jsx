import React from 'react';
import { useTranslation } from 'react-i18next';
import { Server, Users, ServerOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function StatTile({ icon: Icon, label, value, total }) {
  return (
    <Card className="min-w-0">
      <CardContent className="p-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
          <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{label}</span>
        </div>
        <div className="mt-1 flex min-w-0 flex-wrap items-baseline gap-x-1 tabular-nums">
          <span className="text-lg font-semibold leading-tight text-foreground sm:text-xl">{value.toLocaleString()}</span>
          {total !== undefined && (
            <span className="text-xs text-muted-foreground">/ {total.toLocaleString()}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StatTileSkeleton() {
  return (
    <Card className="min-w-0">
      <CardContent className="space-y-2 p-3 sm:px-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-6 w-20" />
      </CardContent>
    </Card>
  );
}

export function ServerStatsHeader({ loading, online, displayed, offline, users, displayedUsers }) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-2 sm:gap-3" role="status" aria-label={t('server-list.loading')}>
        <StatTileSkeleton />
        <StatTileSkeleton />
        <StatTileSkeleton />
      </div>
    );
  }

  // Totals only add information while a filter hides part of the list.
  const filtered = displayed !== online;

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      <StatTile icon={Users} label={t('server-stats.users-title')} value={displayedUsers} total={filtered ? users : undefined} />
      <StatTile icon={Server} label={t('server-stats.servers-title')} value={displayed} total={filtered ? online : undefined} />
      <StatTile icon={ServerOff} label={t('server-stats.offline-label')} value={offline} />
    </div>
  );
}

export default ServerStatsHeader;

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Server, Users, ServerOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatTile } from '../shared/StatTile';

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
      <StatTile
        icon={Users}
        label={t('server-stats.users-title')}
        value={displayedUsers.toLocaleString()}
        total={filtered ? users.toLocaleString() : undefined}
      />
      <StatTile
        icon={Server}
        label={t('server-stats.servers-title')}
        value={displayed.toLocaleString()}
        total={filtered ? online.toLocaleString() : undefined}
      />
      <StatTile icon={ServerOff} label={t('server-stats.offline-label')} value={offline.toLocaleString()} />
    </div>
  );
}

export default ServerStatsHeader;

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import { ServerActivityHeatmap } from './ServerActivityHeatmap';
import { ServerHistoryStrip } from './ServerHistoryStrip';
import { getServerInsightsAPI } from '../../lib/api/servers';
import { useApiResource } from '../../lib/hooks/useApiResource';

export function ServerInsights({ serverId }: { serverId: string }) {
  const { t } = useTranslation();
  const { status, data } = useApiResource(() => getServerInsightsAPI(serverId), serverId);

  if (status === 'loading') {
    return (
      <div className="space-y-4" role="status" aria-label={t('insights.loading')}>
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-72 w-full rounded-lg" />
      </div>
    );
  }

  if (status === 'unavailable' || (!data.history && !data.heatmap)) return null;

  return (
    <>
      {data.history && <ServerHistoryStrip history={data.history} />}
      {data.heatmap && <ServerActivityHeatmap heatmap={data.heatmap} />}
    </>
  );
}

export default ServerInsights;

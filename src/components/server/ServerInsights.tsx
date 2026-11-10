import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ServerActivityHeatmap } from './ServerActivityHeatmap';
import { ServerHistoryStrip } from './ServerHistoryStrip';
import { SectionCard, TileGrid } from '../site/ModelPage';
import { getServerInsightsAPI } from '../../lib/api/servers';
import { useApiResource } from '../../lib/hooks/useApiResource';
import { useSiteContext } from '../../lib/hooks/useSiteContext';
import { serverSentences, similarServers, standingTiles } from '../../site/pages/server';
import type { ServerInsightsResponse, ServerSummary } from '../../types/api';

/** The server in words: what it is, how old, how busy and where it ranks. */
function ServerSummaryCard({ server, insights }: { server: ServerSummary; insights: ServerInsightsResponse | null }) {
  const ctx = useSiteContext();

  return (
    <Card className="min-w-0">
      <CardHeader className="p-4 sm:p-5">
        <CardTitle>{ctx.t('pages.server.summary-title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 p-4 pt-0 text-sm leading-6 text-muted-foreground sm:p-5 sm:pt-0">
        {serverSentences(ctx, server, insights).map((sentence) => <p key={sentence}>{sentence}</p>)}
      </CardContent>
    </Card>
  );
}

interface ServerInsightsProps {
  serverId: string;
  /** With the server, the section opens with a summary in words and the server's rank. */
  server?: ServerSummary;
}

export function ServerInsights({ serverId, server }: ServerInsightsProps) {
  const { t } = useTranslation();
  const ctx = useSiteContext();
  const { status, data } = useApiResource(() => getServerInsightsAPI(serverId), serverId);

  if (status === 'loading') {
    return (
      <div className="space-y-4" role="status" aria-label={t('insights.loading')}>
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-72 w-full rounded-lg" />
      </div>
    );
  }

  const insights = status === 'ready' ? data : null;
  const similar = similarServers(ctx, insights?.standing);

  return (
    <>
      {server && <ServerSummaryCard server={server} insights={insights} />}
      {insights?.standing && <TileGrid tiles={standingTiles(ctx, insights.standing)} />}
      {insights?.history && <ServerHistoryStrip history={insights.history} />}
      {insights?.heatmap && <ServerActivityHeatmap heatmap={insights.heatmap} />}
      {similar && <SectionCard section={similar} />}
    </>
  );
}

export default ServerInsights;

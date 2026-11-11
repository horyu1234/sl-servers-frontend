import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ServerCrash } from 'lucide-react';
import { ServerDetailHeader } from '../../components/server/ServerDetailHeader';
import { ServerInsights } from '../../components/server/ServerInsights';
import { ServerMetaPanel } from '../../components/server/ServerMetaPanel';
import { ServerPastebin } from '../../components/server/ServerPastebin';
import { ServerTrendChart } from '../../components/server/ServerTrendChart';
import { EmptyState } from '../../components/shared/EmptyState';
import { AdSlot } from '../../components/funding/Slot';
import { LocaleLink } from '../../components/shell/LocaleLink';
import { LONG_TERM_GRAPH, PeriodPicker, RECENT_GRAPH, presetParams } from '../../components/shared/PeriodPicker';
import { getServerGraphAPI } from '../../lib/api/servers';
import { usePageHead } from '../../lib/hooks/usePageHead';
import { useSiteContext } from '../../lib/hooks/useSiteContext';
import { notFoundModel } from '../../site/pages/basic';
import { serverModel } from '../../site/pages/server';
import { useAppDispatch, useAppSelector } from '../../modules/hooks';
import * as serverInfoActions from '../../modules/serverInfo';
import type { FluxTrendParams } from '../../types/api';

function isNumericId(id: string | undefined): id is string {
  return /^\d+$/.test(String(id));
}

export default function Info() {
  const { t } = useTranslation();
  const { serverId } = useParams();
  const dispatch = useAppDispatch();
  const fetching = useAppSelector((s) => s.serverInfo.fetching);
  const error = useAppSelector((s) => s.serverInfo.error);
  const server = useAppSelector((s) => s.serverInfo.data);

  const [flux, setFlux] = useState<string | null>(null);
  const [graphError, setGraphError] = useState(false);
  // Tracks whether we've kicked off a fetch for the current serverId, so
  // the "server not found" guard doesn't flash on the very first render
  // (Redux serverInfo starts with {fetching:false, data:{}}).
  const [requested, setRequested] = useState(false);
  const inflightRef = useRef(0);
  const ctx = useSiteContext();

  useEffect(() => {
    // The previous server's graph would show until the new one loads.
    setFlux(null);
    setGraphError(false);
    if (!isNumericId(serverId)) return;
    setRequested(true);
    dispatch(serverInfoActions.getServerInfo(serverId));
  }, [dispatch, serverId]);

  function fetchGraph(params: FluxTrendParams) {
    if (!isNumericId(serverId)) return;
    setFlux(null);
    setGraphError(false);
    const reqId = ++inflightRef.current;
    getServerGraphAPI(serverId, params)
      .then((r) => { if (reqId === inflightRef.current) setFlux(r.data); })
      .catch(() => { if (reqId === inflightRef.current) setGraphError(true); });
  }

  // The first graph waits for the server info, because an offline server starts on its long-term history.
  // Only an answer to this page's own request counts: Redux keeps the last server across pages, and
  // reading it would load one graph for the old answer and another for the new one.
  const answered = requested && !fetching && serverInfoActions.isServerLoaded(server) && String(server.serverId) === serverId;
  const online = answered ? server.online : null;
  const graphPreset = online === false ? LONG_TERM_GRAPH : RECENT_GRAPH;
  const isMissing = !isNumericId(serverId) || (requested && !fetching && !error && !serverInfoActions.isServerLoaded(server));
  // The head needs no insights: its title and description come from the server alone.
  usePageHead(
    isMissing ? notFoundModel(ctx) : answered ? serverModel(ctx, server, null) : null,
    t('server-info.title'),
  );

  useEffect(() => {
    if (online === null) return;
    fetchGraph(presetParams(graphPreset));
    return () => { inflightRef.current++; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverId, online]);

  if (isMissing) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <EmptyState
          icon={ServerCrash}
          title={t('server-info.not-exist')}
          action={(
            <Button asChild variant="outline">
              <LocaleLink to="/">{t('navbar.server-list')}</LocaleLink>
            </Button>
          )}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-screen-2xl px-3 py-4 sm:px-4 sm:py-6">
        <Alert variant="destructive"><AlertDescription>{t('general.server-error')}</AlertDescription></Alert>
      </div>
    );
  }

  if (!serverInfoActions.isServerLoaded(server)) {
    return (
      <div className="mx-auto grid w-full max-w-screen-2xl gap-4 px-3 py-4 sm:px-4 sm:py-6 lg:grid-cols-3" role="status" aria-label={t('server-info.loading')}>
        <div className="space-y-4 lg:col-span-2">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
        <Skeleton className="h-72 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full min-w-0 max-w-screen-2xl items-start gap-4 px-3 py-4 sm:px-4 sm:py-6 lg:grid-cols-3">
      <div className="min-w-0 space-y-4 lg:col-span-2">
        <ServerDetailHeader server={server} />
        <ServerInsights serverId={serverId} server={server} />
        {/* Not in the side column: the panel there follows the scroll and would slide over it. */}
        <AdSlot placement="server" />

        <Card className="min-w-0">
          <CardHeader className="p-4 sm:p-5">
            <CardTitle>{t('server-info.statistics')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 sm:p-5 sm:pt-0">
            <PeriodPicker key={serverId} initial={graphPreset} onUpdate={fetchGraph} />

            {graphError && <Alert variant="destructive"><AlertDescription>{t('general.server-error')}</AlertDescription></Alert>}
            {!graphError && !flux && <div className="text-sm text-muted-foreground">{t('server-info.graph.loading')}</div>}
            {!graphError && flux && <ServerTrendChart fluxResponse={flux} />}
            <p className="text-xs text-muted-foreground">{t('server-info.daylight-saving-time')}</p>
          </CardContent>
        </Card>

        <ServerPastebin pasteKey={server.pastebin} />
      </div>

      <ServerMetaPanel server={server} />
    </div>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Info as InfoIcon, X } from 'lucide-react';
import { ServerDetailHeader } from '../../components/server/ServerDetailHeader';
import { ServerMetaPanel } from '../../components/server/ServerMetaPanel';
import { ServerTrendChart } from '../../components/server/ServerTrendChart';
import { PeriodPicker } from '../../components/stats/PeriodPicker';
import { getServerGraphAPI } from '../../lib/api/servers';
import * as serverInfoActions from '../../modules/serverInfo';

function isNumericId(id) {
  return /^\d+$/.test(String(id));
}

export default function Info() {
  const { t } = useTranslation();
  const { serverId } = useParams();
  const dispatch = useDispatch();
  const fetching = useSelector((s) => s.serverInfo.fetching);
  const error = useSelector((s) => s.serverInfo.error);
  const server = useSelector((s) => s.serverInfo.data);

  const [flux, setFlux] = useState(null);
  const [graphError, setGraphError] = useState(false);
  const [showDaylightAlert, setShowDaylightAlert] = useState(true);
  const inflightRef = useRef(0);

  useEffect(() => {
    if (!isNumericId(serverId)) return;
    dispatch(serverInfoActions.getServerInfo(serverId));
  }, [dispatch, serverId]);

  function fetchGraph(params) {
    if (!isNumericId(serverId)) return;
    setFlux(null);
    setGraphError(false);
    const reqId = ++inflightRef.current;
    getServerGraphAPI(serverId, params)
      .then((r) => { if (reqId === inflightRef.current) setFlux(r.data); })
      .catch(() => { if (reqId === inflightRef.current) setGraphError(true); });
  }

  useEffect(() => {
    fetchGraph({ aggregateEvery: '5m', startTime: '-1w' });
    return () => { inflightRef.current++; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverId]);

  if (!isNumericId(serverId) || (!fetching && !error && (!server || Object.keys(server).length === 0))) {
    return (
      <div className="px-4 py-4">
        <Card>
          <CardHeader><CardTitle>{t('server-info.title')}</CardTitle></CardHeader>
          <CardContent>
            <Alert variant="destructive"><AlertDescription>{t('server-info.not-exist')}</AlertDescription></Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-4">
        <Card>
          <CardHeader><CardTitle>{t('server-info.title')}</CardTitle></CardHeader>
          <CardContent>
            <Alert variant="destructive"><AlertDescription>{t('general.server-error')}</AlertDescription></Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!server || Object.keys(server).length === 0) {
    return (
      <div className="px-4 py-4 text-sm text-muted-foreground">{t('server-info.loading') || 'Loading…'}</div>
    );
  }

  return (
    <div className="px-4 py-4 grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        <ServerDetailHeader server={server} />

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('server-info.statistics')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {showDaylightAlert && (
              <Alert className="relative pr-10">
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>{t('server-info.daylight-saving-time')}</AlertDescription>
                <Button
                  variant="ghost" size="icon"
                  className="absolute top-1.5 right-1.5 h-7 w-7"
                  onClick={() => setShowDaylightAlert(false)}
                  aria-label="Dismiss"
                ><X className="h-4 w-4" /></Button>
              </Alert>
            )}

            <PeriodPicker onUpdate={fetchGraph} />

            {graphError && <Alert variant="destructive"><AlertDescription>{t('general.server-error')}</AlertDescription></Alert>}
            {!graphError && !flux && <div className="text-sm text-muted-foreground">{t('server-info.graph.loading')}</div>}
            {!graphError && flux && <ServerTrendChart fluxResponse={flux} />}
          </CardContent>
        </Card>
      </div>

      <ServerMetaPanel server={server} />
    </div>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ServerActivityHeatmap } from '../../components/server/ServerActivityHeatmap';
import { LONG_TERM_GRAPH, PeriodPicker, presetParams } from '../../components/shared/PeriodPicker';
import { DataPage } from '../../components/site/ResourcePage';
import { CountryTrendChart } from '../../components/stats/CountryTrendChart';
import { getCountryAPI } from '../../lib/api/content';
import { getCountryTrendAPI } from '../../lib/api/stats';
import { useSiteContext } from '../../lib/hooks/useSiteContext';
import { countryModel } from '../../site/pages/countries';
import type { FluxTrendParams } from '../../types/api';

function CountryTrend({ isoCode }: { isoCode: string }) {
  const { t } = useTranslation();
  const [flux, setFlux] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const inflightRef = useRef(0);

  function fetchTrend(params: FluxTrendParams) {
    setFlux(null);
    setError(false);
    const requestId = ++inflightRef.current;
    getCountryTrendAPI([isoCode], params)
      .then((response) => { if (requestId === inflightRef.current) setFlux(response.data); })
      .catch(() => { if (requestId === inflightRef.current) setError(true); });
  }

  useEffect(() => {
    fetchTrend(presetParams(LONG_TERM_GRAPH));
    // A reply that arrives after the country changed is for the old one.
    return () => { inflightRef.current++; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isoCode]);

  return (
    <Card className="min-w-0">
      <CardHeader className="p-4 sm:p-5">
        <CardTitle>{t('pages.country.trend-title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4 pt-0 sm:p-5 sm:pt-0">
        <PeriodPicker key={isoCode} initial={LONG_TERM_GRAPH} onUpdate={fetchTrend} />
        {error && <Alert variant="destructive"><AlertDescription>{t('general.server-error')}</AlertDescription></Alert>}
        {!error && !flux && <div className="text-sm text-muted-foreground">{t('server-info.graph.loading')}</div>}
        {!error && flux && <CountryTrendChart fluxResponse={flux} />}
      </CardContent>
    </Card>
  );
}

export default function Country() {
  const ctx = useSiteContext();
  const isoCode = (useParams().isoCode ?? '').toUpperCase();

  return (
    <DataPage
      load={() => getCountryAPI(isoCode)}
      resourceKey={isoCode}
      title={ctx.t('pages.country.title', { country: ctx.country(isoCode) })}
      model={countryModel}
    >
      {(data) => (
        <>
          <CountryTrend isoCode={isoCode} />
          {data.heatmap && <ServerActivityHeatmap heatmap={data.heatmap} />}
        </>
      )}
    </DataPage>
  );
}

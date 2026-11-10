import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageHeader } from '../../components/shared/PageHeader';
import { CountryMultiSelect } from '../../components/stats/CountryMultiSelect';
import { GlobalHistorySection } from '../../components/stats/GlobalHistorySection';
import { PeriodPicker } from '../../components/shared/PeriodPicker';
import { CountryTrendChart } from '../../components/stats/CountryTrendChart';
import { ModLoaderChart } from '../../components/stats/ModLoaderChart';
import { getCountryTrendAPI } from '../../lib/api/stats';
import { StatsNav } from '../../components/stats/StatsNav';
import { usePageHead } from '../../lib/hooks/usePageHead';
import { useSiteContext } from '../../lib/hooks/useSiteContext';
import { statsModel } from '../../site/pages/basic';
import type { FluxTrendParams } from '../../types/api';

export default function Stats() {
  const { t } = useTranslation();
  const [showAll, setShowAll] = useState(true);
  const [isoCodes, setIsoCodes] = useState<string[]>([]);
  const [flux, setFlux] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const inflightRef = useRef(0);
  const model = statsModel(useSiteContext());
  usePageHead(model);

  function fetchTrend(codes: string[], params: FluxTrendParams) {
    setFlux(null);
    setError(false);
    const reqId = ++inflightRef.current;
    getCountryTrendAPI(codes, params)
      .then((r) => {
        if (reqId !== inflightRef.current) return; // stale
        setFlux(r.data);
      })
      .catch(() => {
        if (reqId !== inflightRef.current) return;
        setError(true);
      });
  }

  useEffect(() => {
    fetchTrend(['ALL'], { aggregateEvery: '5m', startTime: '-1w' });
    return () => { inflightRef.current++; };  // bump so any in-flight reply is treated as stale
  }, []);

  const handleUpdate = (params: FluxTrendParams) => {
    const codes = [];
    if (showAll) codes.push('ALL');
    codes.push(...isoCodes);
    if (codes.length === 0) {
      toast.warning(t('all-stats.users.graph.empty-country'));
      return;
    }
    fetchTrend(codes, params);
  };

  return (
    <div className="mx-auto w-full max-w-screen-2xl px-3 py-4 sm:px-4 sm:py-6">
      <PageHeader title={t('navbar.all-stats')} description={model.intro[0]} />
      <div className="my-4"><StatsNav /></div>
      <GlobalHistorySection />
      <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(340px,0.85fr)]">
        <Card className="min-w-0">
          <CardHeader className="p-4 sm:p-5">
            <CardTitle>{t('all-stats.users.title')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5 p-4 pt-0 sm:p-5 sm:pt-0">
            <div className="flex min-w-0 flex-col gap-4">
              <div className="flex min-w-0 max-w-md flex-col gap-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  {t('all-stats.users.select-compare-country.name')}
                </Label>
                <CountryMultiSelect value={isoCodes} onChange={setIsoCodes} />
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="stats-show-all"
                    checked={showAll}
                    onCheckedChange={(c) => setShowAll(c === true)}
                  />
                  <Label htmlFor="stats-show-all" className="cursor-pointer text-sm text-muted-foreground">
                    {t('all-stats.users.show-all.name')}
                  </Label>
                </div>
              </div>
              <PeriodPicker onUpdate={handleUpdate} />
            </div>

            {error && <Alert variant="destructive"><AlertDescription>{t('general.server-error')}</AlertDescription></Alert>}
            {!error && !flux && <div className="text-sm text-muted-foreground">{t('server-info.graph.loading')}</div>}
            {!error && flux && <CountryTrendChart fluxResponse={flux} />}
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader className="p-4 sm:p-5">
            <CardTitle>{t('all-stats.mod-loader.title')}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-5 sm:pt-0">
            <ModLoaderChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

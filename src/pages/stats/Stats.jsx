import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CountryMultiSelect } from '../../components/stats/CountryMultiSelect';
import { PeriodPicker } from '../../components/stats/PeriodPicker';
import { CountryTrendChart } from '../../components/stats/CountryTrendChart';
import { ModLoaderChart } from '../../components/stats/ModLoaderChart';
import { getCountryTrendAPI } from '../../lib/api/stats';

export default function Stats() {
  const { t } = useTranslation();
  const [showAll, setShowAll] = useState(true);
  const [isoCodes, setIsoCodes] = useState([]);
  const [flux, setFlux] = useState(null);
  const [error, setError] = useState(false);
  const inflightRef = useRef(0);

  function fetchTrend(codes, params) {
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

  const handleUpdate = (params) => {
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
    <div className="px-4 py-4 space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('all-stats.users.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex items-center gap-2">
                <Checkbox id="stats-show-all" checked={showAll} onCheckedChange={(c) => setShowAll(c === true)} />
                <Label htmlFor="stats-show-all" className="text-sm cursor-pointer">
                  {t('all-stats.users.show-all.name')}
                </Label>
              </div>
              <div className="flex-1 min-w-[260px]">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">
                  {t('all-stats.users.select-compare-country.name')}
                </Label>
                <CountryMultiSelect value={isoCodes} onChange={setIsoCodes} />
              </div>
            </div>

            <PeriodPicker onUpdate={handleUpdate} />

            {error && <Alert variant="destructive"><AlertDescription>{t('general.server-error')}</AlertDescription></Alert>}
            {!error && !flux && <div className="text-sm text-muted-foreground">{t('server-info.graph.loading')}</div>}
            {!error && flux && <CountryTrendChart fluxResponse={flux} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('all-stats.mod-loader.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ModLoaderChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

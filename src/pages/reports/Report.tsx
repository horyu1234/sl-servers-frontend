import React from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataPage } from '../../components/site/ResourcePage';
import { ReportSeriesChart } from '../../components/stats/ReportSeriesChart';
import { StatsNav } from '../../components/stats/StatsNav';
import { getReportAPI } from '../../lib/api/content';
import { useSiteContext } from '../../lib/hooks/useSiteContext';
import { periodLabel, reportModel } from '../../site/pages/reports';

export default function Report() {
  const { t } = useTranslation();
  const ctx = useSiteContext();
  const period = useParams().period ?? '';

  return (
    <DataPage
      load={() => getReportAPI(period)}
      resourceKey={period}
      title={t('pages.report.heading', { period: periodLabel(ctx, period) })}
      model={reportModel}
      top={<StatsNav />}
    >
      {(data) => data.series.length >= 2 && (
        <Card className="min-w-0">
          <CardHeader className="p-4 sm:p-5">
            <CardTitle>
              {t(data.summary.kind === 'year' ? 'pages.report.chart-title-month' : 'pages.report.chart-title-day')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-5 sm:pt-0">
            <ReportSeriesChart series={data.series} yearly={data.summary.kind === 'year'} />
          </CardContent>
        </Card>
      )}
    </DataPage>
  );
}

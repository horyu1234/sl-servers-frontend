import React from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataPage } from '../../components/site/ResourcePage';
import { AdoptionChart } from '../../components/stats/AdoptionChart';
import { StatsNav } from '../../components/stats/StatsNav';
import { getVersionAPI } from '../../lib/api/content';
import { versionModel } from '../../site/pages/versions';

export default function Version() {
  const { t } = useTranslation();
  const version = useParams().version ?? '';

  return (
    <DataPage
      load={() => getVersionAPI(version)}
      resourceKey={version}
      title={t('pages.version.heading', { version })}
      model={versionModel}
      top={<StatsNav />}
    >
      {(data) => data.adoption.length >= 2 && (
        <Card className="min-w-0">
          <CardHeader className="p-4 sm:p-5">
            <CardTitle>{t('pages.version.chart-title', { version })}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-5 sm:pt-0">
            <AdoptionChart adoption={data.adoption} />
          </CardContent>
        </Card>
      )}
    </DataPage>
  );
}

import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataPage } from '../../components/site/ResourcePage';
import { StatsNav } from '../../components/stats/StatsNav';
import { getReportsAPI } from '../../lib/api/content';
import { reportsModel } from '../../site/pages/reports';

export default function Reports() {
  const { t } = useTranslation();
  return (
    <DataPage
      load={getReportsAPI}
      resourceKey="reports"
      title={t('navbar.reports')}
      model={reportsModel}
      top={<StatsNav />}
    />
  );
}

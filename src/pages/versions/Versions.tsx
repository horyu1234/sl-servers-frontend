import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataPage } from '../../components/site/ResourcePage';
import { StatsNav } from '../../components/stats/StatsNav';
import { getVersionsAPI } from '../../lib/api/content';
import { versionsModel } from '../../site/pages/versions';

export default function Versions() {
  const { t } = useTranslation();
  return (
    <DataPage
      load={getVersionsAPI}
      resourceKey="versions"
      title={t('navbar.versions')}
      model={versionsModel}
      top={<StatsNav />}
    />
  );
}

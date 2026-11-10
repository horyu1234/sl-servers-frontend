import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataPage } from '../../components/site/ResourcePage';
import { getRankingsAPI } from '../../lib/api/content';
import { rankingsModel } from '../../site/pages/rankings';

export default function Rankings() {
  const { t } = useTranslation();
  return <DataPage load={getRankingsAPI} resourceKey="rankings" title={t('navbar.rankings')} model={rankingsModel} />;
}

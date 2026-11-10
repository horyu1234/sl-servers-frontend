import React from 'react';
import { useTranslation } from 'react-i18next';
import { ModelPage } from '../../components/site/ModelPage';
import { PageLoading, PageUnavailable } from '../../components/site/ResourcePage';
import { StatsNav } from '../../components/stats/StatsNav';
import { getCountriesAPI } from '../../lib/api/content';
import { getGlobalHistoryAPI } from '../../lib/api/stats';
import { useApiResource } from '../../lib/hooks/useApiResource';
import { useSiteContext } from '../../lib/hooks/useSiteContext';
import { recordsModel } from '../../site/pages/records';

export default function Records() {
  const { t } = useTranslation();
  const ctx = useSiteContext();
  const history = useApiResource(getGlobalHistoryAPI, 'global-history');
  // The country table is an extra: the page stands without it.
  const countries = useApiResource(getCountriesAPI, 'countries');
  const title = t('navbar.records');

  if (history.status === 'loading' || countries.status === 'loading') return <PageLoading title={title} />;
  if (history.status === 'unavailable') return <PageUnavailable title={title} />;
  return <ModelPage model={recordsModel(ctx, history.data, countries.data)} top={<StatsNav />} />;
}

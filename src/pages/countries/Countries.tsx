import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataPage } from '../../components/site/ResourcePage';
import { getCountriesAPI } from '../../lib/api/content';
import { countriesModel } from '../../site/pages/countries';

export default function Countries() {
  const { t } = useTranslation();
  return <DataPage load={getCountriesAPI} resourceKey="countries" title={t('navbar.countries')} model={countriesModel} />;
}

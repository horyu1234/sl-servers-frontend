import React from 'react';
import { useTranslation } from 'react-i18next';
import languages from '../../data/language.json';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '../../components/shared/PageHeader';
import { useDocumentTitle } from '../../lib/hooks/useDocumentTitle';
import { ExternalResources } from './ExternalResources';
import { ThirdPartyLicenses } from './ThirdPartyLicenses';

const SOURCE_URL = 'https://github.com/horyu1234/sl-servers-frontend';

export default function Credit() {
  const { t } = useTranslation();
  useDocumentTitle(t('navbar.credit'));

  return (
    <div className="mx-auto w-full max-w-screen-2xl px-3 py-4 sm:px-4 sm:py-6">
      <PageHeader
        className="mb-4"
        title={t('navbar.credit')}
        description={(
          <a href={SOURCE_URL} target="_blank" rel="noreferrer" className="hover:text-foreground hover:underline">
            {t('credit.site-license')}
          </a>
        )}
      />
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(320px,0.9fr)]">
      <div className="min-w-0 space-y-4">
        <ThirdPartyLicenses />
        <ExternalResources />
      </div>

      <Card className="min-w-0 lg:sticky lg:top-[4.5rem]">
        <CardHeader className="pb-3">
          <CardTitle>{t('credit.contributors-title')}</CardTitle>
        </CardHeader>
        <CardContent className="max-h-[calc(100dvh-9rem)] overflow-auto pr-3">
          <ul className="space-y-3 text-sm">
            {languages.map((language) => (
              <li key={language.code}>
                <div className="font-medium">{language.name}</div>
                {language.contributors.length > 0 && (
                  <ul className="ml-4 mt-1 list-disc text-muted-foreground space-y-0.5">
                    {language.contributors.map((contributor, idx) => (
                      <li key={idx}>{contributor}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

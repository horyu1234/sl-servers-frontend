import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Used at runtime or through the backend, so the build cannot see them. The
// notices are the wording the owners ask for and stay untranslated. Keep this in
// step with the map attribution in Map.tsx and the GeoLite2 line in List.tsx.
const RESOURCES: { id: string; name: string; url: string; notice?: string }[] = [
  {
    id: 'carto',
    name: 'CARTO',
    url: 'https://carto.com/attributions',
    notice: '© CARTO',
  },
  {
    id: 'openstreetmap',
    name: 'OpenStreetMap',
    url: 'https://www.openstreetmap.org/copyright',
    notice: '© OpenStreetMap contributors',
  },
  {
    id: 'geolite',
    name: 'MaxMind GeoLite2',
    url: 'https://www.maxmind.com',
    notice: 'This product includes GeoLite2 data created by MaxMind, available from https://www.maxmind.com.',
  },
  {
    id: 'country-flag-icons',
    name: 'country-flag-icons',
    url: 'https://github.com/catamphetamine/country-flag-icons',
    notice: 'Copyright (c) 2020 @catamphetamine, MIT License',
  },
  {
    id: 'pastebin',
    name: 'Pastebin',
    url: 'https://pastebin.com',
  },
];

export function ExternalResources() {
  const { t } = useTranslation();

  return (
    <Card className="min-w-0">
      <CardHeader className="pb-3">
        <CardTitle>{t('credit.resources-title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-border/70 text-sm">
          {RESOURCES.map(({ id, name, url, notice }) => (
            <li key={id} className="space-y-0.5 py-2.5 first:pt-0 last:pb-0">
              <a href={url} target="_blank" rel="noreferrer" className="font-medium text-foreground hover:underline">
                {name}
              </a>
              <p className="text-muted-foreground">{t(`credit.resources.${id}`)}</p>
              {notice && <p className="break-words text-xs text-muted-foreground">{notice}</p>}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

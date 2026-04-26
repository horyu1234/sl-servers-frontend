import React, { useMemo } from 'react';
import languages from '../../data/language.json';
import thirdPartyLicenses from '../../data/third-party-licenses.json';
import groupBy from 'lodash/groupBy';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function Credit() {
  const grouped = useMemo(() => {
    const list = Object.entries(thirdPartyLicenses).map(([name, lc]) => ({ ...lc, name }));
    const map = groupBy(list, 'licenses');
    return Object.entries(map).sort((a, b) => b[1].length - a[1].length);
  }, []);

  return (
    <div className="px-4 py-4 grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Third-Party Licenses</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {grouped.map(([licenseName, entries]) => (
              <AccordionItem key={licenseName} value={licenseName}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{licenseName}</span>
                    <Badge variant="secondary" className="rounded-md font-normal">{entries.length}</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-sm">
                    {entries.map((entry) => (
                      entry.licenseUrl
                        ? (
                          <a
                            key={entry.name}
                            href={entry.licenseUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-muted-foreground hover:text-foreground hover:underline"
                          >
                            {entry.name}
                          </a>
                        )
                        : (
                          <span key={entry.name} className="text-muted-foreground/70">
                            {entry.name}
                          </span>
                        )
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Site localization contributors</CardTitle>
        </CardHeader>
        <CardContent>
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
  );
}

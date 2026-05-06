import React, { useMemo, useState } from 'react';
import languages from '../../data/language.json';
import thirdPartyLicenses from '../../data/third-party-licenses.json';
import groupBy from 'lodash/groupBy';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function Credit() {
  const [query, setQuery] = useState('');
  const grouped = useMemo(() => {
    const list = Object.entries(thirdPartyLicenses).map(([name, lc]) => ({ ...lc, name }));
    const map = groupBy(list, 'licenses');
    return Object.entries(map).sort((a, b) => b[1].length - a[1].length);
  }, []);
  const filteredGrouped = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return grouped;
    return grouped
      .map(([licenseName, entries]) => [
        licenseName,
        entries.filter((entry) => (
          licenseName.toLowerCase().includes(term) ||
          entry.name.toLowerCase().includes(term)
        )),
      ])
      .filter(([, entries]) => entries.length > 0);
  }, [grouped, query]);

  return (
    <div className="grid gap-4 px-3 py-3 sm:px-4 sm:py-4 lg:grid-cols-[minmax(0,2fr)_minmax(320px,0.9fr)]">
      <Card className="min-w-0">
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Third-Party Licenses</CardTitle>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search licenses or packages"
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full divide-y divide-border/70">
            {filteredGrouped.map(([licenseName, entries]) => (
              <AccordionItem key={licenseName} value={licenseName}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate font-medium">{licenseName}</span>
                    <Badge variant="secondary" className="rounded-md font-normal">{entries.length}</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-sm">
                    {entries.map((entry) => (
                      entry.repository
                        ? (
                          <a
                            key={entry.name}
                            href={entry.repository}
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
          {filteredGrouped.length === 0 && (
            <div className="rounded-md border border-border bg-background/40 px-3 py-8 text-center text-sm text-muted-foreground">
              No packages match this search.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="min-w-0 lg:sticky lg:top-[4.5rem]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Site localization contributors</CardTitle>
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
  );
}

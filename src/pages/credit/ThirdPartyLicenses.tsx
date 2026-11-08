import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import groupBy from 'lodash/groupBy';
import { ChevronRight, ExternalLink, Search } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import type { LicenseManifest, ManifestPackage } from '../../types/licenses';

// Emitted by vite-plugins/thirdPartyLicenses.ts, which needs the finished bundle
// to know what ships, so the list cannot be imported into that bundle.
const LICENSES_URL = `${import.meta.env.BASE_URL}third-party-licenses.json`;

function useLicenseManifest() {
  const [state, setState] = useState<{ manifest: LicenseManifest | null; failed: boolean }>({
    manifest: null,
    failed: false,
  });

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch(LICENSES_URL, { signal: controller.signal });
        if (!response.ok) throw new Error(`Unexpected status ${response.status}`);
        setState({ manifest: await response.json(), failed: false });
      } catch (error) {
        // Everything above throws an Error or a DOMException, so there is a name to read.
        if ((error as Error).name !== 'AbortError') setState({ manifest: null, failed: true });
      }
    }

    load();
    return () => controller.abort();
  }, []);

  return state;
}

function PackageLicense({ entry, texts }: { entry: ManifestPackage; texts: string[] }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <details className="group" onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary className="flex cursor-pointer list-none items-center gap-1.5 py-1 text-muted-foreground hover:text-foreground group-open:text-foreground [&::-webkit-details-marker]:hidden">
        <ChevronRight className="h-3.5 w-3.5 shrink-0 transition-transform group-open:rotate-90" aria-hidden="true" />
        <span className="min-w-0 break-all">{entry.name}</span>
        {entry.version && <span className="shrink-0 text-xs text-muted-foreground">{entry.version}</span>}
      </summary>
      {open && (
        <div className="mb-3 ml-5 mt-1 space-y-2">
          {entry.repository && (
            <a
              href={entry.repository}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              {t('credit.repository')}
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          )}
          {entry.notices.length === 0 && (
            <div className="text-xs text-muted-foreground">
              <p>{t('credit.no-license-file', { license: entry.license })}</p>
              {entry.author && <p>{t('credit.author', { author: entry.author })}</p>}
            </div>
          )}
          {entry.notices.map(({ file, text }) => (
            <div key={file}>
              <div className="mb-1 text-xs font-medium text-muted-foreground">{file}</div>
              <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-md border border-border bg-background/40 p-3 font-mono text-xs leading-relaxed text-muted-foreground">
                {texts[text]}
              </pre>
            </div>
          ))}
        </div>
      )}
    </details>
  );
}

export function ThirdPartyLicenses() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const { manifest, failed } = useLicenseManifest();

  const grouped = useMemo(() => {
    const map = groupBy(manifest?.packages ?? [], 'license');
    return Object.entries(map).sort((a, b) => b[1].length - a[1].length);
  }, [manifest]);

  const filteredGrouped = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return grouped;
    return grouped
      .map(([licenseName, entries]): [string, ManifestPackage[]] => [
        licenseName,
        entries.filter((entry) => (
          licenseName.toLowerCase().includes(term) ||
          entry.name.toLowerCase().includes(term)
        )),
      ])
      .filter(([, entries]) => entries.length > 0);
  }, [grouped, query]);

  return (
    <Card className="min-w-0">
      <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1.5">
          <CardTitle>{t('credit.licenses-title')}</CardTitle>
          <p className="text-sm text-muted-foreground">{t('credit.licenses-description')}</p>
        </div>
        <div className="relative w-full shrink-0 sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('credit.search-placeholder')}
            className="pl-9"
          />
        </div>
      </CardHeader>
      <CardContent>
        {failed && (
          <Alert variant="destructive"><AlertDescription>{t('credit.load-failed')}</AlertDescription></Alert>
        )}
        {!failed && !manifest && (
          <div className="space-y-3" role="status" aria-label={t('credit.loading')}>
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        )}
        {manifest && (
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
                  <div className="text-sm">
                    {entries.map((entry) => (
                      <PackageLicense key={`${entry.name}@${entry.version}`} entry={entry} texts={manifest.texts} />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
        {manifest && filteredGrouped.length === 0 && (
          <div className="rounded-md border border-border bg-background/40 px-3 py-8 text-center text-sm text-muted-foreground">
            {t('credit.no-match')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

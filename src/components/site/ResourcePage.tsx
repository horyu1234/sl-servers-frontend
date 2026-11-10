import React, { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ServerCrash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '../shared/EmptyState';
import { LocaleLink } from '../shell/LocaleLink';
import { ModelPage } from './ModelPage';
import { useApiResource } from '../../lib/hooks/useApiResource';
import { usePageHead } from '../../lib/hooks/usePageHead';
import { useSiteContext } from '../../lib/hooks/useSiteContext';
import type { SiteContext } from '../../site/context';
import type { PageModel } from '../../site/pageModel';

/** What a data page shows while its data loads. The title keeps the tab readable meanwhile. */
export function PageLoading({ title }: { title?: string }) {
  const { t } = useTranslation();
  usePageHead(null, title);

  return (
    <div
      className="mx-auto w-full max-w-screen-xl space-y-4 px-3 py-4 sm:px-4 sm:py-6"
      role="status"
      aria-label={t('pages.common.loading')}
    >
      <Skeleton className="h-8 w-64 max-w-full rounded-md" />
      <Skeleton className="h-16 w-full max-w-3xl rounded-md" />
      <Skeleton className="h-96 w-full rounded-lg" />
    </div>
  );
}

/**
 * What a data page shows when its data did not load. The API answers 404 for a country, version
 * or report it does not have, and fails the same way when it is down, so this does not say which.
 */
export function PageUnavailable({ title, action }: { title?: string; action?: ReactNode }) {
  const { t } = useTranslation();
  usePageHead(null, title);

  // Nothing here is worth indexing. The next page that loads removes the tag again.
  useEffect(() => {
    if (document.head.querySelector('meta[name="robots"]')) return;
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex';
    document.head.appendChild(robots);
  }, []);

  return (
    <div className="flex flex-1 items-center justify-center">
      <EmptyState
        icon={ServerCrash}
        title={t('pages.common.unavailable-title')}
        description={t('pages.common.unavailable-description')}
        action={action ?? (
          <Button asChild variant="outline">
            <LocaleLink to="/">{t('navbar.server-list')}</LocaleLink>
          </Button>
        )}
      />
    </div>
  );
}

interface DataPageProps<T> {
  load: () => Promise<{ data: T }>;
  /** Changes when the page should load again, such as another country. */
  resourceKey: string;
  /** The tab title while the data loads or when it does not. */
  title: string;
  model: (ctx: SiteContext, data: T) => PageModel;
  top?: ReactNode;
  /** Charts for the loaded data. */
  children?: (data: T) => ReactNode;
}

/** A page that is one API response drawn as a page model. */
export function DataPage<T>({ load, resourceKey, title, model, top, children }: DataPageProps<T>) {
  const ctx = useSiteContext();
  const { status, data } = useApiResource(load, resourceKey);

  if (status === 'loading') return <PageLoading title={title} />;
  if (status === 'unavailable') return <PageUnavailable title={title} />;
  return <ModelPage model={model(ctx, data)} top={top}>{children?.(data)}</ModelPage>;
}

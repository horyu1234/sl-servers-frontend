import React from 'react';
import { useTranslation } from 'react-i18next';
import { ServerCrash, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '../components/shared/EmptyState';
import { LocaleLink } from '../components/shell/LocaleLink';
import { usePageHead } from '../lib/hooks/usePageHead';
import { useSiteContext } from '../lib/hooks/useSiteContext';
import { notFoundModel } from '../site/pages/basic';

export default function NotFound() {
  const { t } = useTranslation();
  usePageHead(notFoundModel(useSiteContext()));

  return (
    <div className="flex flex-1 items-center justify-center">
      <EmptyState
        icon={ServerCrash}
        title="404"
        description={t('general.not-found')}
        action={(
          <Button asChild variant="outline" className="gap-2">
            <LocaleLink to="/"><ArrowLeft /> {t('navbar.server-list')}</LocaleLink>
          </Button>
        )}
      />
    </div>
  );
}

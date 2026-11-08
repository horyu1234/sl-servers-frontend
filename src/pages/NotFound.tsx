import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ServerCrash, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '../components/shared/EmptyState';
import { useDocumentTitle } from '../lib/hooks/useDocumentTitle';

export default function NotFound() {
  const { t } = useTranslation();
  useDocumentTitle('404');

  return (
    <div className="flex flex-1 items-center justify-center">
      <EmptyState
        icon={ServerCrash}
        title="404"
        description={t('general.not-found')}
        action={(
          <Button asChild variant="outline" className="gap-2">
            <Link to="/"><ArrowLeft /> {t('navbar.server-list')}</Link>
          </Button>
        )}
      />
    </div>
  );
}

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Rows3, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';

export type ServerView = 'list' | 'grid';

export function ViewToggle({ value, onChange }: { value: ServerView; onChange: (view: ServerView) => void }) {
  const { t } = useTranslation();

  return (
    <div className="hidden lg:inline-flex rounded-md border border-border overflow-hidden">
      <Button
        variant="ghost" size="sm"
        className={cn('rounded-none px-2.5 h-8', value === 'list' && 'bg-muted text-foreground')}
        onClick={() => onChange('list')}
        aria-label={t('server-list.view-list')}
      >
        <Rows3 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost" size="sm"
        className={cn('rounded-none px-2.5 h-8 border-l border-border', value === 'grid' && 'bg-muted text-foreground')}
        onClick={() => onChange('grid')}
        aria-label={t('server-list.view-grid')}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
    </div>
  );
}

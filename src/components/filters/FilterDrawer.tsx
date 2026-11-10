import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { FilterControls } from './FilterControls';
import { DEFAULT_FILTER, activeFilterCount } from '../../lib/filters/filterSchema';
import type { FilterProps } from '../../lib/filters/filterSchema';

export function FilterDrawer({ value, onChange }: FilterProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const activeCount = activeFilterCount(value);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden gap-1">
          <SlidersHorizontal className="h-4 w-4" />
          {t('filter-option.filter-options-title')}
          {activeCount > 0 && (
            <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] px-1.5">
              {activeCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex !w-[calc(100vw-24px)] max-w-[320px] flex-col gap-0 p-0">
        <div className="px-6 pb-2 pt-6">
          <SheetTitle>{t('filter-option.filter-options-title')}</SheetTitle>
          <SheetDescription className="sr-only">{t('filter-option.drawer-description')}</SheetDescription>
        </div>
        {/* The filters outgrow a short phone, so they scroll between the title and the buttons. */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          <FilterControls value={value} onChange={onChange} />
        </div>
        <div className="flex gap-2 border-t border-border px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={activeCount === 0}
            onClick={() => onChange(DEFAULT_FILTER)}
          >
            {t('filter-option.clear-all')}
          </Button>
          <Button type="button" className="flex-1" onClick={() => setOpen(false)}>
            {t('filter-option.show-results')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

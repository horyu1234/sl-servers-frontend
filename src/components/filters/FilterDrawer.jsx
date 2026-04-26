import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { FilterControls } from './FilterControls';

export function FilterDrawer({ value, onChange }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const activeCount = value.countryFilter.length
    + (value.search ? 1 : 0)
    + (value.hideEmptyServer ? 1 : 0)
    + (value.hideFullServer ? 1 : 0)
    + (value.friendlyFire !== 'null' ? 1 : 0)
    + (value.whitelist !== 'null' ? 1 : 0)
    + (value.modded !== 'null' ? 1 : 0);

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
      <SheetContent side="left" className="w-[320px]">
        <SheetTitle>{t('filter-option.filter-options-title')}</SheetTitle>
        <SheetDescription className="sr-only">Filter the server list</SheetDescription>
        <div className="mt-4">
          <FilterControls value={value} onChange={onChange} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

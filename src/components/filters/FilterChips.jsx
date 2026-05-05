import React from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DEFAULT_FILTER } from './filterSchema';
import getCountryName from '../../i18n/i18n-countries';

function Chip({ children, onClear }) {
  return (
    <Badge variant="outline" className="max-w-full gap-1 pl-2 pr-1 py-0.5 text-xs font-normal">
      <span className="min-w-0 truncate">{children}</span>
      <button
        type="button"
        onClick={onClear}
        aria-label="Clear filter"
        className="rounded-full hover:bg-muted p-0.5"
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
}

export function FilterChips({ value, onChange }) {
  const { t } = useTranslation();
  const chips = [];
  const set = (patch) => onChange({ ...value, ...patch });

  if (value.search) {
    chips.push(<Chip key="search" onClear={() => set({ search: '' })}>"{value.search}"</Chip>);
  }
  for (const code of value.countryFilter) {
    chips.push(
      <Chip key={`c-${code}`} onClear={() => set({ countryFilter: value.countryFilter.filter((c) => c !== code) })}>
        {getCountryName(code) || code}
      </Chip>
    );
  }
  if (value.hideEmptyServer) chips.push(<Chip key="he" onClear={() => set({ hideEmptyServer: false })}>{t('filter-option.hide-empty')}</Chip>);
  if (value.hideFullServer)  chips.push(<Chip key="hf" onClear={() => set({ hideFullServer: false })}>{t('filter-option.hide-full')}</Chip>);
  if (value.friendlyFire !== 'null') chips.push(<Chip key="ff" onClear={() => set({ friendlyFire: 'null' })}>FF: {value.friendlyFire === 'true' ? 'yes' : 'no'}</Chip>);
  if (value.whitelist    !== 'null') chips.push(<Chip key="wl" onClear={() => set({ whitelist:    'null' })}>WL: {value.whitelist    === 'true' ? 'yes' : 'no'}</Chip>);
  if (value.modded       !== 'null') chips.push(<Chip key="md" onClear={() => set({ modded:       'null' })}>Modded: {value.modded === 'true' ? 'yes' : 'no'}</Chip>);

  if (chips.length === 0) return null;

  return (
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
      {chips}
      <button
        type="button"
        onClick={() => onChange(DEFAULT_FILTER)}
        className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
      >
        clear all
      </button>
    </div>
  );
}

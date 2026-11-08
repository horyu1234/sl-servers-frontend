import React, { useId } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CountryMultiSelect } from '../stats/CountryMultiSelect';
import { SORT_OPTIONS } from './filterSchema';
import type { FilterProps, ServerFilter } from './filterSchema';
import type { ServerSortType, TriState } from '../../types/api';

const TRISTATE: { value: TriState; i18nLeaf: string }[] = [
  { value: 'null',  i18nLeaf: 'none' },
  { value: 'true',  i18nLeaf: 'yes' },
  { value: 'false', i18nLeaf: 'no'  },
];

interface CheckboxFieldProps {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean | 'indeterminate') => void;
  children: ReactNode;
}

function CheckboxField({ id, checked, onCheckedChange, children }: CheckboxFieldProps) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} />
      <Label htmlFor={id} className="text-sm cursor-pointer leading-none">
        {children}
      </Label>
    </div>
  );
}

interface TriStateFieldProps {
  name: string;
  title: string;
  value: TriState;
  onChange: (value: TriState) => void;
  t: TFunction;
}

function TriStateField({ name, title, value, onChange, t }: TriStateFieldProps) {
  const baseId = useId();
  return (
    <div className="space-y-2">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{title}</Label>
      {/* Radix passes back a string; the only items are TRISTATE values. */}
      <RadioGroup value={value} onValueChange={(next) => onChange(next as TriState)} className="flex flex-wrap gap-x-3 gap-y-1.5">
        {TRISTATE.map((opt) => {
          const id = `${baseId}-${opt.value}`;
          return (
            <div key={opt.value} className="flex items-center gap-1.5">
              <RadioGroupItem value={opt.value} id={id} />
              <Label htmlFor={id} className="text-sm cursor-pointer leading-none whitespace-nowrap">
                {t(`filter-option.yes-no-filter.${opt.i18nLeaf}`)}
              </Label>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
}

interface SortFieldProps {
  value: ServerSortType;
  onChange: (value: ServerSortType) => void;
  t: TFunction;
}

function SortField({ value, onChange, t }: SortFieldProps) {
  const baseId = useId();
  const title = t('filter-option.yes-no-filter.order-type.name');
  return (
    <div className="space-y-2">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{title}</Label>
      {/* Radix passes back a string; the only items are SORT_OPTIONS values. */}
      <RadioGroup value={value} onValueChange={(next) => onChange(next as ServerSortType)} aria-label={title} className="gap-1.5">
        {SORT_OPTIONS.map((opt) => {
          const id = `${baseId}-${opt.value}`;
          return (
            <div key={opt.value} className="flex items-center gap-1.5">
              <RadioGroupItem value={opt.value} id={id} />
              <Label htmlFor={id} className="text-sm cursor-pointer leading-none">
                {t(opt.i18nKey)}
              </Label>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
}

export function FilterControls({ value, onChange }: FilterProps) {
  const { t } = useTranslation();
  const set = (patch: Partial<ServerFilter>) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="filter-search" className="text-xs uppercase tracking-wider text-muted-foreground">
          {t('filter-option.server-search.name')}
        </Label>
        <Input
          id="filter-search"
          value={value.search}
          onChange={(e) => set({ search: e.target.value })}
          placeholder={t('filter-option.server-search.placeholder')}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          {t('filter-option.country')}
        </Label>
        <CountryMultiSelect
          value={value.countryFilter}
          onChange={(next) => set({ countryFilter: next })}
          minPopoverWidth={0}
        />
      </div>

      <Separator />

      <SortField value={value.sort} onChange={(v) => set({ sort: v })} t={t} />

      <Separator />

      <div className="space-y-2.5">
        <CheckboxField
          id="filter-hide-empty"
          checked={value.hideEmptyServer}
          onCheckedChange={(c) => set({ hideEmptyServer: c === true })}
        >
          {t('filter-option.hide-empty')}
        </CheckboxField>
        <CheckboxField
          id="filter-hide-full"
          checked={value.hideFullServer}
          onCheckedChange={(c) => set({ hideFullServer: c === true })}
        >
          {t('filter-option.hide-full')}
        </CheckboxField>
      </div>

      <Separator />

      <TriStateField
        name="friendlyFire"
        title={t('filter-option.yes-no-filter.friendly-fire')}
        value={value.friendlyFire}
        onChange={(v) => set({ friendlyFire: v })}
        t={t}
      />
      <TriStateField
        name="whitelist"
        title={t('filter-option.yes-no-filter.whitelist')}
        value={value.whitelist}
        onChange={(v) => set({ whitelist: v })}
        t={t}
      />
      <TriStateField
        name="modded"
        title={t('filter-option.yes-no-filter.modded')}
        value={value.modded}
        onChange={(v) => set({ modded: v })}
        t={t}
      />
    </div>
  );
}

export default FilterControls;

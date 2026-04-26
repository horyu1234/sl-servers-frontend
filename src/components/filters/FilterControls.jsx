import React, { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const TRISTATE = [
  { value: 'null',  i18nLeaf: 'none' },
  { value: 'true',  i18nLeaf: 'yes' },
  { value: 'false', i18nLeaf: 'no'  },
];

function CheckboxField({ id, checked, onCheckedChange, children }) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} />
      <Label htmlFor={id} className="text-sm cursor-pointer leading-none">
        {children}
      </Label>
    </div>
  );
}

function TriStateField({ name, title, value, onChange, t }) {
  const baseId = useId();
  return (
    <div className="space-y-2">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{title}</Label>
      <RadioGroup value={value} onValueChange={onChange} className="flex flex-wrap gap-x-4 gap-y-1.5">
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

export function FilterControls({ value, onChange }) {
  const { t } = useTranslation();
  const set = (patch) => onChange({ ...value, ...patch });

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

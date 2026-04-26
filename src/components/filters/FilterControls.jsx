import React from 'react';
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

export function FilterControls({ value, onChange }) {
  const { t } = useTranslation();
  const set = (patch) => onChange({ ...value, ...patch });

  const tri = (key, title) => (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{title}</Label>
      <RadioGroup value={value[key]} onValueChange={(v) => set({ [key]: v })} className="flex gap-3">
        {TRISTATE.map((opt) => (
          <Label key={opt.value} className="flex items-center gap-1.5 text-sm cursor-pointer">
            <RadioGroupItem value={opt.value} />
            <span className="capitalize">{t(`filter-option.yes-no-filter.${opt.i18nLeaf}`)}</span>
          </Label>
        ))}
      </RadioGroup>
    </div>
  );

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
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm cursor-pointer">
          <Checkbox checked={value.hideEmptyServer} onCheckedChange={(c) => set({ hideEmptyServer: c === true })} />
          <span>{t('filter-option.hide-empty')}</span>
        </Label>
        <Label className="flex items-center gap-2 text-sm cursor-pointer">
          <Checkbox checked={value.hideFullServer} onCheckedChange={(c) => set({ hideFullServer: c === true })} />
          <span>{t('filter-option.hide-full')}</span>
        </Label>
      </div>
      <Separator />
      {tri('friendlyFire', t('filter-option.yes-no-filter.friendly-fire'))}
      {tri('whitelist',    t('filter-option.yes-no-filter.whitelist'))}
      {tri('modded',       t('filter-option.yes-no-filter.modded'))}
    </div>
  );
}

export default FilterControls;

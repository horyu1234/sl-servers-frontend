import React, { useId } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CountryMultiSelect } from '../stats/CountryMultiSelect';
import { MAX_COUNT, SORT_OPTIONS, formatRange, normalizeRange } from '../../lib/filters/filterSchema';
import type { CountRange, FilterProps, ServerFilter } from '../../lib/filters/filterSchema';
import { useDraft } from '../../lib/hooks/useDraft';
import type { ServerSortType, TriState } from '../../types/api';

const SEARCH_DELAY_MS = 300;
const RANGE_DELAY_MS = 500;
const PLAYER_PRESETS = [1, 5, 10, 20];
const COUNT_DIGITS = String(MAX_COUNT).length;

const TRISTATE: { value: TriState; i18nLeaf: string }[] = [
  { value: 'null',  i18nLeaf: 'none' },
  { value: 'true',  i18nLeaf: 'yes' },
  { value: 'false', i18nLeaf: 'no'  },
];

const FIELD_TITLE = 'text-xs uppercase tracking-wider text-muted-foreground';

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
  title: string;
  value: TriState;
  onChange: (value: TriState) => void;
  t: TFunction;
}

function TriStateField({ title, value, onChange, t }: TriStateFieldProps) {
  const baseId = useId();
  return (
    <div className="space-y-2">
      <Label className={FIELD_TITLE}>{title}</Label>
      {/* Radix passes back a string; the only items are TRISTATE values. */}
      <RadioGroup value={value} onValueChange={(next) => onChange(next as TriState)} aria-label={title} className="flex flex-wrap gap-x-3 gap-y-1.5">
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
      <Label className={FIELD_TITLE}>{title}</Label>
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

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  t: TFunction;
}

function SearchField({ value, onChange, t }: SearchFieldProps) {
  const id = useId();
  const { draft, update, flush } = useDraft(value, value, onChange, SEARCH_DELAY_MS);
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className={FIELD_TITLE}>
        {t('filter-option.server-search.name')}
      </Label>
      <Input
        id={id}
        type="search"
        value={draft}
        onChange={(e) => update(e.target.value)}
        onBlur={flush}
        onKeyDown={(e) => { if (e.key === 'Enter') flush(); }}
        placeholder={t('filter-option.server-search.placeholder')}
        autoComplete="off"
      />
    </div>
  );
}

interface RangeDraft {
  min: string;
  max: string;
}

function toDraft({ min, max }: CountRange): RangeDraft {
  return { min: min === null ? '' : String(min), max: max === null ? '' : String(max) };
}

function toCount(text: string) {
  return text === '' ? null : Number(text);
}

/** The range a draft applies: swapped ends, a minimum of 0 dropped, and so on. */
function draftRange({ min, max }: RangeDraft): CountRange {
  return normalizeRange({ min: toCount(min), max: toCount(max) });
}

function digitsOnly(text: string) {
  return text.replace(/\D/g, '').slice(0, COUNT_DIGITS);
}

interface RangeFieldProps {
  title: string;
  value: CountRange;
  onChange: (value: CountRange) => void;
  presets?: number[];
  t: TFunction;
}

function RangeField({ title, value, onChange, presets = [], t }: RangeFieldProps) {
  const id = useId();
  const { draft, update, flush } = useDraft(
    toDraft(value),
    formatRange(value) ?? '',
    (next: RangeDraft) => onChange(draftRange(next)),
    RANGE_DELAY_MS,
    (next: RangeDraft) => toDraft(draftRange(next)),
  );
  const minLabel = t('filter-option.range-min');
  const maxLabel = t('filter-option.range-max');
  const input = (end: keyof RangeDraft, label: string) => (
    <Input
      inputMode="numeric"
      pattern="[0-9]*"
      autoComplete="off"
      value={draft[end]}
      onChange={(e) => update({ ...draft, [end]: digitsOnly(e.target.value) })}
      onBlur={flush}
      onKeyDown={(e) => { if (e.key === 'Enter') flush(); }}
      placeholder={label}
      aria-label={`${title}: ${label}`}
      className="h-8 min-w-0 text-center tabular-nums"
    />
  );

  return (
    <div role="group" aria-labelledby={id} className="space-y-2">
      <div id={id} className={FIELD_TITLE}>{title}</div>
      <div className="flex items-center gap-2">
        {input('min', minLabel)}
        <span aria-hidden="true" className="text-muted-foreground">–</span>
        {input('max', maxLabel)}
      </div>
      {presets.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {presets.map((n) => {
            const active = value.min === n && value.max === null;
            return (
              <Button
                key={n}
                type="button"
                size="sm"
                variant={active ? 'default' : 'outline'}
                aria-pressed={active}
                className="h-7 px-2.5 text-xs tabular-nums"
                onClick={() => onChange(active ? { min: null, max: null } : { min: n, max: null })}
              >
                {n}+
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function FilterControls({ value, onChange }: FilterProps) {
  const { t } = useTranslation();
  const set = (patch: Partial<ServerFilter>) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-5">
      <SearchField value={value.search} onChange={(search) => set({ search })} t={t} />

      <div className="space-y-1.5">
        <Label className={FIELD_TITLE}>
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

      <RangeField
        title={t('filter-option.players')}
        value={value.players}
        onChange={(players) => set({ players })}
        presets={PLAYER_PRESETS}
        t={t}
      />
      <RangeField
        title={t('filter-option.slots')}
        value={value.slots}
        onChange={(slots) => set({ slots })}
        t={t}
      />
      <CheckboxField
        id="filter-hide-full"
        checked={value.hideFullServer}
        onCheckedChange={(c) => set({ hideFullServer: c === true })}
      >
        {t('filter-option.hide-full')}
      </CheckboxField>

      <Separator />

      <TriStateField
        title={t('filter-option.yes-no-filter.friendly-fire')}
        value={value.friendlyFire}
        onChange={(v) => set({ friendlyFire: v })}
        t={t}
      />
      <TriStateField
        title={t('filter-option.yes-no-filter.whitelist')}
        value={value.whitelist}
        onChange={(v) => set({ whitelist: v })}
        t={t}
      />
      <TriStateField
        title={t('filter-option.yes-no-filter.modded')}
        value={value.modded}
        onChange={(v) => set({ modded: v })}
        t={t}
      />
    </div>
  );
}

export default FilterControls;

import React, { useEffect, useId, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { CountryMultiSelect } from '../stats/CountryMultiSelect';
import { MAX_COUNT, SORT_OPTIONS, describeRange, formatRange, isOpenRange, normalizeRange } from '../../lib/filters/filterSchema';
import type { CountRange, FilterProps, ServerFilter } from '../../lib/filters/filterSchema';
import { useDraft } from '../../lib/hooks/useDraft';
import type { ServerSortType, TriState } from '../../types/api';

const SEARCH_DELAY_MS = 300;
const RANGE_DELAY_MS = 500;
const PLAYER_PRESETS = [1, 5, 10, 20];
// The gauge's right end. Dragging the upper thumb there leaves the maximum open.
const PLAYER_GAUGE_MAX = 50;
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
  t: TFunction;
}

function RangeField({ title, value, onChange, t }: RangeFieldProps) {
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
    </div>
  );
}

interface PresetButtonsProps {
  value: CountRange;
  onChange: (value: CountRange) => void;
  presets: number[];
}

/** Shortcuts for a minimum. Pressing the one that is on clears the range. */
function PresetButtons({ value, onChange, presets }: PresetButtonsProps) {
  return (
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
  );
}

type Thumbs = [number, number];

function toThumbs({ min, max }: CountRange): Thumbs {
  return [Math.min(min ?? 0, PLAYER_GAUGE_MAX), Math.min(max ?? PLAYER_GAUGE_MAX, PLAYER_GAUGE_MAX)];
}

function fromThumbs([low, high]: number[]): CountRange {
  return normalizeRange({ min: low, max: high >= PLAYER_GAUGE_MAX ? null : high });
}

interface GaugeFieldProps {
  title: string;
  value: CountRange;
  onChange: (value: CountRange) => void;
  presets: number[];
  t: TFunction;
}

/**
 * A two-thumb gauge for a range. The label follows the thumbs while they move, and the range is
 * applied when they are let go, so dragging doesn't reload the list on every step.
 */
function GaugeField({ title, value, onChange, presets, t }: GaugeFieldProps) {
  const id = useId();
  const sourceKey = formatRange(value) ?? '';
  const [thumbs, setThumbs] = useState<Thumbs>(() => toThumbs(value));

  useEffect(() => {
    setThumbs(toThumbs(value));
    // Only a new committed range moves the thumbs, not a new object for the same range.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceKey]);

  const settled = toThumbs(value);
  // While the thumbs sit where the range puts them, show the range itself. It can lie past the
  // gauge's end, such as 70+ from a link.
  const shown = thumbs[0] === settled[0] && thumbs[1] === settled[1] ? value : fromThumbs(thumbs);

  return (
    <div role="group" aria-labelledby={id} className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <div id={id} className={FIELD_TITLE}>{title}</div>
        <output aria-live="polite" className="text-sm font-medium tabular-nums">
          {isOpenRange(shown) ? t('filter-option.yes-no-filter.none') : describeRange(shown)}
        </output>
      </div>
      <Slider
        min={0}
        max={PLAYER_GAUGE_MAX}
        step={1}
        value={thumbs}
        onValueChange={(next) => setThumbs([next[0], next[1]])}
        onValueCommit={(next) => onChange(fromThumbs(next))}
        thumbLabels={[`${title}: ${t('filter-option.range-min')}`, `${title}: ${t('filter-option.range-max')}`]}
      />
      <div aria-hidden="true" className="flex justify-between text-[11px] tabular-nums text-muted-foreground">
        <span>0</span>
        <span>{PLAYER_GAUGE_MAX}+</span>
      </div>
      <PresetButtons value={value} onChange={onChange} presets={presets} />
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

      <GaugeField
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

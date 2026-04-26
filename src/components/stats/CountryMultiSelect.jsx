import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { CountryFlag } from '../server/CountryFlag';
import getCountryName from '../../i18n/i18n-countries';
import * as countryListActions from '../../modules/countryList';
import { cn } from '@/lib/cn';

export function CountryMultiSelect({ value, onChange }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const isoCodes = useSelector((s) => s.countryList.data);
  const fetching = useSelector((s) => s.countryList.fetching);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isoCodes || isoCodes.length === 0) {
      dispatch(countryListActions.getCountryList());
    }
  }, [dispatch, isoCodes]);

  const options = useMemo(
    () => (isoCodes ?? []).map((code) => ({ code, name: getCountryName(code) || code })),
    [isoCodes]
  );

  const toggle = (code) => {
    onChange(value.includes(code) ? value.filter((c) => c !== code) : [...value, code]);
  };
  const remove = (code) => onChange(value.filter((c) => c !== code));

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
            <span className="text-muted-foreground text-sm">
              {value.length === 0 ? t('select.placeholder') : `${value.length} selected`}
            </span>
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0" align="start">
          <Command>
            <CommandInput placeholder={t('select.placeholder')} />
            <CommandList>
              <CommandEmpty>{fetching ? '…' : t('select.empty')}</CommandEmpty>
              <CommandGroup>
                {options.map((opt) => {
                  const selected = value.includes(opt.code);
                  return (
                    <CommandItem key={opt.code} value={`${opt.code} ${opt.name}`} onSelect={() => toggle(opt.code)}>
                      <Check className={cn('mr-2 h-4 w-4', selected ? 'opacity-100' : 'opacity-0')} />
                      <CountryFlag isoCode={opt.code} className="mr-2 rounded-[1px]" />
                      <span className="truncate">{opt.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{opt.code}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((code) => (
            <Badge key={code} variant="secondary" className="gap-1 pl-1 pr-1.5 py-0.5 font-normal">
              <CountryFlag isoCode={code} className="rounded-[1px]" />
              <span>{getCountryName(code) || code}</span>
              <button
                type="button"
                onClick={() => remove(code)}
                aria-label={`Remove ${code}`}
                className="ml-0.5 rounded-full hover:bg-muted p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export default CountryMultiSelect;

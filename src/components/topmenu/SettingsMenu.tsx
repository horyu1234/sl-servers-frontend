import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import LanguageSelect from './LanguageSelect';
import SiSelect from './SiSelect';
import { useAppSelector } from '../../modules/hooks';

const withoutTrailingColon = (label: string) => label.replace(/\s*[:：]\s*$/, '');

export function SettingsMenu() {
  const { t, i18n } = useTranslation();
  const unit = useAppSelector((s) => s.setting.si);
  const languageCode = (i18n.resolvedLanguage ?? i18n.language ?? 'en').split('-')[0].toUpperCase();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs text-muted-foreground"
          aria-label={t('navbar.settings')}
        >
          <Globe aria-hidden="true" />
          <span className="tabular-nums">{languageCode} · {unit}</span>
          <ChevronDown className="opacity-60" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">{withoutTrailingColon(t('navbar.language'))}</Label>
          <LanguageSelect className="w-full" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">{withoutTrailingColon(t('navbar.unit'))}</Label>
          <SiSelect className="w-full" />
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default SettingsMenu;

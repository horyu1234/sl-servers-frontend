import React from 'react';
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import languages from '../../data/language.json';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/cn';

export default function LanguageSelect({ className }) {
  const { t } = useTranslation();
  const activeLanguage = languages.some((language) => language.code === i18n.language)
    ? i18n.language
    : languages.some((language) => language.code === i18n.resolvedLanguage)
      ? i18n.resolvedLanguage
      : 'en-US';
  const handleChange = (value) => {
    const target = languages.find((l) => l.code === value);
    i18n.changeLanguage(value).then(() => {
      toast.success(t('general.language-change', { language: target?.name ?? value }));
    });
  };
  return (
    <Select value={activeLanguage} onValueChange={handleChange}>
      <SelectTrigger className={cn('h-8 w-[180px] text-xs', className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {languages.map((language) => (
          <SelectItem key={language.code} value={language.code}>{language.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

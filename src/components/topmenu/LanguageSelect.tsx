import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import languages from '../../data/language.json';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { languageSwitchPath } from '../../site/routes';
import { cn } from '@/lib/cn';

export default function LanguageSelect({ className }: { className?: string }) {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const activeLanguage = languages.some((language) => language.code === i18n.language)
    ? i18n.language
    : languages.some((language) => language.code === i18n.resolvedLanguage)
      ? i18n.resolvedLanguage
      : 'en-US';
  const handleChange = (value: string) => {
    const target = languages.find((l) => l.code === value);
    i18n.changeLanguage(value).then(() => {
      // t from this render still speaks the previous language.
      toast.success(i18n.t('general.language-change', { language: target?.name ?? value }));
    });
    const path = languageSwitchPath(location.pathname, value);
    if (path !== null) navigate(`${path}${location.search}${location.hash}`, { replace: true });
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

import React from 'react';
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import languages from '../../data/language.json';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function LanguageSelect() {
  const { t } = useTranslation();
  const handleChange = (value) => {
    const target = languages.find((l) => l.code === value);
    i18n.changeLanguage(value).then(() => {
      toast.success(t('general.language-change', { language: target?.name ?? value }));
    });
  };
  return (
    <Select value={i18n.language} onValueChange={handleChange}>
      <SelectTrigger className="h-8 w-[180px] text-xs">
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

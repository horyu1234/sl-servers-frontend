import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import * as settingActions from '../../modules/setting';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/cn';

const OPTIONS = [
  { value: 'km', i18nKey: 'navbar.unit-km' },
  { value: 'mi', i18nKey: 'navbar.unit-mi' },
];

export default function SiSelect({ className }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const si = useSelector((s) => s.setting.si);
  return (
    <Select value={si} onValueChange={(v) => dispatch(settingActions.changeSi(v))}>
      <SelectTrigger className={cn('h-8 w-[160px] text-xs', className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>{t(opt.i18nKey)}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

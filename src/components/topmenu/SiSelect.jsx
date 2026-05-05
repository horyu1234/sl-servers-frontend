import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as settingActions from '../../modules/setting';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const OPTIONS = [
  { value: 'km', label: 'Kilometers (km)' },
  { value: 'mi', label: 'Miles (mi)' },
];

export default function SiSelect() {
  const dispatch = useDispatch();
  const si = useSelector((s) => s.setting.si);
  return (
    <Select value={si} onValueChange={(v) => dispatch(settingActions.changeSi(v))}>
      <SelectTrigger className="h-8 w-[132px] text-xs xl:w-[150px] 2xl:w-[160px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

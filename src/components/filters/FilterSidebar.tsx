import React from 'react';
import { FilterControls } from './FilterControls';
import type { FilterProps } from '../../lib/filters/filterSchema';

export function FilterSidebar({ value, onChange }: FilterProps) {
  return (
    <aside
      className="hidden lg:flex flex-col w-64 shrink-0 self-start sticky top-14 h-[calc(100vh-3.5rem)] border-r border-border bg-card/40 px-4 py-4 overflow-y-auto"
    >
      <FilterControls value={value} onChange={onChange} />
    </aside>
  );
}

export default FilterSidebar;

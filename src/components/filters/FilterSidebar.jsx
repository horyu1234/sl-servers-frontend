import React from 'react';
import { FilterControls } from './FilterControls';

export function FilterSidebar({ value, onChange }) {
  return (
    <aside className="hidden lg:block w-60 shrink-0 border-r border-border bg-card/40 px-4 py-4 overflow-y-auto">
      <FilterControls value={value} onChange={onChange} />
    </aside>
  );
}

export default FilterSidebar;

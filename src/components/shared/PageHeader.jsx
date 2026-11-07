import React from 'react';
import { cn } from '@/lib/cn';

export function PageHeader({ title, description, actions, className }) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-x-4 gap-y-2', className)}>
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="shrink-0 text-xs tabular-nums text-muted-foreground">{actions}</div>}
    </div>
  );
}

export default PageHeader;

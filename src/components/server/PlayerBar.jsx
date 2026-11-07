import React from 'react';
import { playersBarClass } from '../../lib/format/players';
import { cn } from '@/lib/cn';

export function PlayerBar({ percent, className }) {
  return (
    <span className={cn('block h-1.5 overflow-hidden rounded-full bg-muted', className)} aria-hidden="true">
      <span className={cn('block h-full rounded-full', playersBarClass(percent))} style={{ width: `${percent}%` }} />
    </span>
  );
}

export default PlayerBar;

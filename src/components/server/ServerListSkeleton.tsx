import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { SERVER_ROW_GRID } from './serverRowGrid';
import { cn } from '@/lib/cn';

const ROW_COUNT = 8;
const CARD_COUNT = 6;

function RowSkeleton() {
  return (
    <div className={cn('grid min-h-[76px] items-center gap-3 border-b border-border/70 px-4 py-2.5', SERVER_ROW_GRID)}>
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="hidden h-3 w-full min-[1440px]:block" />
      <Skeleton className="h-7 w-full" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-full" />
      <span />
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-3.5">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-7 w-full" />
      <Skeleton className="h-1.5 w-full" />
    </div>
  );
}

export function ServerListSkeleton({ view }: { view: 'list' | 'grid' }) {
  if (view === 'list') {
    return (
      <div aria-hidden="true">
        {Array.from({ length: ROW_COUNT }, (_, i) => <RowSkeleton key={i} />)}
      </div>
    );
  }
  return (
    <div className="grid gap-3 p-3 sm:grid-cols-2 sm:p-4 xl:grid-cols-3" aria-hidden="true">
      {Array.from({ length: CARD_COUNT }, (_, i) => <CardSkeleton key={i} />)}
    </div>
  );
}

export default ServerListSkeleton;

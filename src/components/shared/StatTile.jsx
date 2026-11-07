import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export function StatTile({ icon: Icon, label, value, total, note }) {
  return (
    <Card className="min-w-0">
      <CardContent className="p-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
          {Icon && <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
          <span className="truncate">{label}</span>
        </div>
        <div className="mt-1 flex min-w-0 flex-wrap items-baseline gap-x-1 tabular-nums">
          <span className="text-lg font-semibold leading-tight text-foreground sm:text-xl">{value}</span>
          {total !== undefined && (
            <span className="text-xs text-muted-foreground">/ {total}</span>
          )}
        </div>
        {note && <div className="mt-0.5 text-xs text-muted-foreground">{note}</div>}
      </CardContent>
    </Card>
  );
}

export default StatTile;

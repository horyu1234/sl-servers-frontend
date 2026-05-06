import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, MousePointerClick } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getModLoaderChartAPI } from '../../lib/api/stats';
import { cn } from '@/lib/cn';

const COLORS = [
  '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7',
  '#06b6d4', '#ec4899', '#10b981', '#8b5cf6', '#f97316',
];

function DistributionRows({ rows, interactive = false, onSelect }) {
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  const max = Math.max(...rows.map((row) => row.value), 1);

  return (
    <div className="space-y-2">
      {rows.map((row, index) => {
        const pct = total > 0 ? Math.round((row.value / total) * 100) : 0;
        const content = (
          <>
            <div className="flex min-w-0 items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  aria-hidden="true"
                />
                <span className="truncate font-medium text-foreground">{row.name}</span>
              </div>
              <div className="shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                {row.value.toLocaleString()} · {pct}%
              </div>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <span
                className="block h-full rounded-full"
                style={{
                  width: `${Math.max(3, (row.value / max) * 100)}%`,
                  backgroundColor: COLORS[index % COLORS.length],
                }}
              />
            </div>
          </>
        );

        if (!interactive) {
          return (
            <div key={row.name} className="rounded-md border border-border/70 bg-background/35 px-3 py-2.5">
              {content}
            </div>
          );
        }

        return (
          <button
            key={row.name}
            type="button"
            onClick={() => onSelect(row.name)}
            className={cn(
              'w-full rounded-md border border-border/70 bg-background/35 px-3 py-2.5 text-left transition-colors',
              'hover:border-primary/40 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            )}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}

export function ModLoaderChart() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [drill, setDrill] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getModLoaderChartAPI()
      .then((res) => { if (!cancelled) setData(res.data); })
      .catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, []);

  const top = useMemo(() => {
    if (!data) return [];
    return Object.entries(data).map(([name, versions]) => ({
      name,
      value: Object.values(versions).reduce((a, b) => a + b, 0),
    })).sort((a, b) => b.value - a.value);
  }, [data]);

  const drillRows = useMemo(() => {
    if (!data || !drill) return [];
    return Object.entries(data[drill] || {})
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [data, drill]);

  if (error) {
    return <Alert variant="destructive"><AlertDescription>{t('general.server-error')}</AlertDescription></Alert>;
  }
  if (!data) {
    return <div className="text-sm text-muted-foreground">{t('server-info.graph.loading')}</div>;
  }

  const rows = drill ? drillRows : top;
  const title = drill ? t('all-stats.mod-loader.versions-title', { name: drill }) : t('all-stats.mod-loader.title');
  const total = rows.reduce((sum, row) => sum + row.value, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        {drill && (
          <Button variant="ghost" size="sm" onClick={() => setDrill(null)} className="gap-1">
            <ChevronLeft className="h-4 w-4" /> {t('all-stats.mod-loader.back')}
          </Button>
        )}
        <span className="min-w-0 truncate text-sm text-muted-foreground">{title}</span>
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
          {total.toLocaleString()}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80 rounded-md border border-dashed border-border bg-muted/20 px-2.5 py-1.5">
        <MousePointerClick className="h-3.5 w-3.5 shrink-0" />
        <span>{drill ? t('all-stats.mod-loader.drill-back-hint') : t('all-stats.mod-loader.drill-hint')}</span>
      </div>

      <DistributionRows
        rows={rows}
        interactive={!drill}
        onSelect={(name) => setDrill(name)}
      />
    </div>
  );
}

export default ModLoaderChart;

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChevronLeft, MousePointerClick } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getModLoaderChartAPI } from '../../lib/api/stats';

const COLORS = [
  '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7',
  '#06b6d4', '#ec4899', '#10b981', '#8b5cf6', '#f97316',
];

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

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {drill && (
          <Button variant="ghost" size="sm" onClick={() => setDrill(null)} className="gap-1">
            <ChevronLeft className="h-4 w-4" /> {t('all-stats.mod-loader.back')}
          </Button>
        )}
        <span className="text-sm text-muted-foreground">{title}</span>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80 rounded-md border border-dashed border-border bg-muted/20 px-2.5 py-1.5">
        <MousePointerClick className="h-3.5 w-3.5 shrink-0" />
        <span>{drill ? t('all-stats.mod-loader.drill-back-hint') : t('all-stats.mod-loader.drill-hint')}</span>
      </div>

      <div className="h-[300px] min-w-0 w-full sm:h-[320px]">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={rows}
              dataKey="value"
              nameKey="name"
              outerRadius={120}
              onClick={(slice) => { if (!drill && slice?.name) setDrill(slice.name); }}
              isAnimationActive={false}
              style={!drill ? { cursor: 'pointer' } : undefined}
            >
              {rows.map((row, i) => (
                <Cell key={row.name} fill={COLORS[i % COLORS.length]} stroke="hsl(var(--background))" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 6, fontSize: 12 }}
              formatter={(value, name) => [value.toLocaleString(), name]}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ModLoaderChart;

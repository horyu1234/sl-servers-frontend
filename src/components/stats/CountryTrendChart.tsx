import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { parseFluxToSeries } from '../../lib/parsers/flux';
import getCountryName from '../../i18n/i18n-countries';
import { CHART_AXIS_PROPS, CHART_GRID_PROPS, CHART_LEGEND_PROPS, CHART_MARGIN, CHART_TOOLTIP_PROPS } from '../shared/chartTheme';

const PALETTE = [
  '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4',
  '#ec4899', '#10b981', '#8b5cf6', '#f97316', '#14b8a6', '#eab308',
];

const LONG_SPAN_MS = 100 * 86_400_000;

// Alone, the total uses the accent color. Next to countries it turns neutral so
// it reads as the reference line and doesn't compete with them.
function colorFor(key: string, idx: number, seriesCount: number) {
  if (key === 'ALL' && seriesCount > 1) return '#e5e7eb';
  return PALETTE[idx % PALETTE.length];
}

export function CountryTrendChart({ fluxResponse }: { fluxResponse: string }) {
  const { t } = useTranslation();
  const data = useMemo(() => parseFluxToSeries(fluxResponse, { groupBy: 'iso_code' }), [fluxResponse]);
  const seriesKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const row of data) for (const k of Object.keys(row)) if (k !== 'time') keys.add(k);
    return Array.from(keys).sort((a, b) => (a === 'ALL' ? -1 : b === 'ALL' ? 1 : a.localeCompare(b)));
  }, [data]);

  const labelFor = (key: string) => {
    if (key === 'ALL') return t('all-stats.users.graph.all-country') || 'All countries';
    return getCountryName(key) || key;
  };

  if (data.length === 0) return null;

  // Past a few months the hour means nothing and the year is what tells the points apart.
  const spanMs = new Date(data[data.length - 1].time).getTime() - new Date(data[0].time).getTime();
  const tickFormat = spanMs > LONG_SPAN_MS ? 'yyyy-MM-dd' : 'MM-dd HH:mm';

  return (
    <div className="h-[320px] min-w-0 w-full sm:h-[360px]">
      <ResponsiveContainer>
        <LineChart data={data} margin={CHART_MARGIN}>
          <CartesianGrid {...CHART_GRID_PROPS} />
          <XAxis
            dataKey="time"
            tickFormatter={(v) => format(new Date(v), tickFormat)}
            {...CHART_AXIS_PROPS}
            minTickGap={48}
          />
          <YAxis {...CHART_AXIS_PROPS} width={44} />
          <Tooltip
            {...CHART_TOOLTIP_PROPS}
            // recharts types the label as ReactNode; it is the row's time string.
            labelFormatter={(v) => format(new Date(v as string), 'yyyy-MM-dd HH:mm')}
          />
          {seriesKeys.length > 1 && <Legend {...CHART_LEGEND_PROPS} />}
          {seriesKeys.map((key, i) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={labelFor(key)}
              stroke={colorFor(key, i, seriesKeys.length)}
              strokeWidth={key === 'ALL' ? 2 : 1.5}
              dot={false}
              connectNulls
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CountryTrendChart;

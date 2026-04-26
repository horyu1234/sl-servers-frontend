import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { parseFluxToSeries } from '../../lib/parsers/flux';
import getCountryName from '../../i18n/i18n-countries';

const PALETTE = [
  '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4',
  '#ec4899', '#10b981', '#8b5cf6', '#f97316', '#14b8a6', '#eab308',
];

function colorFor(key, idx) {
  if (key === 'ALL') return '#e5e7eb';
  return PALETTE[idx % PALETTE.length];
}

export function CountryTrendChart({ fluxResponse }) {
  const { t } = useTranslation();
  const data = useMemo(() => parseFluxToSeries(fluxResponse, { groupBy: 'iso_code' }), [fluxResponse]);
  const seriesKeys = useMemo(() => {
    const keys = new Set();
    for (const row of data) for (const k of Object.keys(row)) if (k !== 'time') keys.add(k);
    return Array.from(keys).sort((a, b) => (a === 'ALL' ? -1 : b === 'ALL' ? 1 : a.localeCompare(b)));
  }, [data]);

  const labelFor = (key) => {
    if (key === 'ALL') return t('all-stats.users.graph.all-country') || 'All countries';
    return getCountryName(key) || key;
  };

  if (data.length === 0) return null;

  return (
    <div className="h-[360px] w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="time"
            tickFormatter={(v) => format(new Date(v), 'MM-dd HH:mm')}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            stroke="hsl(var(--border))"
            minTickGap={32}
          />
          <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} stroke="hsl(var(--border))" />
          <Tooltip
            contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 6, fontSize: 12 }}
            labelFormatter={(v) => format(new Date(v), 'yyyy-MM-dd HH:mm')}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {seriesKeys.map((key, i) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={labelFor(key)}
              stroke={colorFor(key, i)}
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

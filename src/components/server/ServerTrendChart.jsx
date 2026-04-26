import React, { useMemo } from 'react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { parseFluxToSeries } from '../../lib/parsers/flux';

const PALETTE = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4'];

// Single-server trend split by game version. The common case is one
// active version at a time; with multiple versions a stacked Area
// would visually occlude lower-value series, so we drop the fill and
// render lines only when more than one version is present.
export function ServerTrendChart({ fluxResponse }) {
  const data = useMemo(
    () => parseFluxToSeries(fluxResponse, { groupBy: 'version' }),
    [fluxResponse]
  );
  const versions = useMemo(() => {
    const set = new Set();
    for (const row of data) for (const k of Object.keys(row)) if (k !== 'time') set.add(k);
    return Array.from(set).sort();
  }, [data]);

  if (data.length === 0) return null;

  const singleVersion = versions.length === 1;
  const Chart = singleVersion ? AreaChart : LineChart;
  const Series = singleVersion ? Area : Line;

  return (
    <div className="h-[340px] w-full">
      <ResponsiveContainer>
        <Chart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
          {singleVersion && (
            <defs>
              {versions.map((v, i) => (
                <linearGradient key={v} id={`fill-${v}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={PALETTE[i % PALETTE.length]} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={PALETTE[i % PALETTE.length]} stopOpacity={0}    />
                </linearGradient>
              ))}
            </defs>
          )}
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
          {versions.map((v, i) => {
            const color = PALETTE[i % PALETTE.length];
            const props = {
              key: v,
              type: 'monotone',
              dataKey: v,
              name: `v${v}`,
              stroke: color,
              strokeWidth: singleVersion ? 1.5 : 2,
              connectNulls: true,
              isAnimationActive: false,
              dot: false,
            };
            return singleVersion
              ? <Series {...props} fill={`url(#fill-${v})`} />
              : <Series {...props} />;
          })}
        </Chart>
      </ResponsiveContainer>
    </div>
  );
}

export default ServerTrendChart;

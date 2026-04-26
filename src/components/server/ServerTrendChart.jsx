import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { parseFluxToSeries } from '../../lib/parsers/flux';

const PALETTE = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4'];

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

  return (
    <div className="h-[340px] w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
          <defs>
            {versions.map((v, i) => (
              <linearGradient key={v} id={`fill-${v}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={PALETTE[i % PALETTE.length]} stopOpacity={0.35} />
                <stop offset="100%" stopColor={PALETTE[i % PALETTE.length]} stopOpacity={0}    />
              </linearGradient>
            ))}
          </defs>
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
          {versions.map((v, i) => (
            <Area
              key={v}
              type="monotone"
              dataKey={v}
              name={`v${v}`}
              stroke={PALETTE[i % PALETTE.length]}
              strokeWidth={1.5}
              fill={`url(#fill-${v})`}
              connectNulls
              isAnimationActive={false}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ServerTrendChart;

import React, { useMemo } from 'react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { parseFluxToSeries } from '../../lib/parsers/flux';
import { CHART_AXIS_PROPS, CHART_GRID_PROPS, CHART_LEGEND_PROPS, CHART_MARGIN, CHART_TOOLTIP_PROPS } from '../shared/chartTheme';

const PALETTE = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4'];

// Single-server trend split by game version. The common case is one
// active version at a time; with multiple versions a stacked Area
// would visually occlude lower-value series, so we drop the fill and
// render lines only when more than one version is present.
export function ServerTrendChart({ fluxResponse }: { fluxResponse: string }) {
  const data = useMemo(
    () => parseFluxToSeries(fluxResponse, { groupBy: 'version' }),
    [fluxResponse]
  );
  const versions = useMemo(() => {
    const set = new Set<string>();
    for (const row of data) for (const k of Object.keys(row)) if (k !== 'time') set.add(k);
    return Array.from(set).sort();
  }, [data]);

  if (data.length === 0) return null;

  const singleVersion = versions.length === 1;
  const Chart = singleVersion ? AreaChart : LineChart;
  const Series = singleVersion ? Area : Line;

  return (
    <div className="h-[300px] min-w-0 w-full sm:h-[340px]">
      <ResponsiveContainer>
        <Chart data={data} margin={CHART_MARGIN}>
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
          <CartesianGrid {...CHART_GRID_PROPS} />
          <XAxis
            dataKey="time"
            tickFormatter={(v) => format(new Date(v), 'MM-dd HH:mm')}
            {...CHART_AXIS_PROPS}
            minTickGap={48}
          />
          <YAxis {...CHART_AXIS_PROPS} width={40} />
          <Tooltip
            {...CHART_TOOLTIP_PROPS}
            // recharts types the label as ReactNode; it is the row's time string.
            labelFormatter={(v) => format(new Date(v as string), 'yyyy-MM-dd HH:mm')}
          />
          {!singleVersion && <Legend {...CHART_LEGEND_PROPS} />}
          {versions.map((v, i) => {
            const color = PALETTE[i % PALETTE.length];
            const props = {
              type: 'monotone' as const,
              dataKey: v,
              name: `v${v}`,
              stroke: color,
              strokeWidth: singleVersion ? 1.5 : 2,
              connectNulls: true,
              isAnimationActive: false,
              dot: false,
            };
            return singleVersion
              ? <Series key={v} {...props} fill={`url(#fill-${v})`} />
              : <Series key={v} {...props} />;
          })}
        </Chart>
      </ResponsiveContainer>
    </div>
  );
}

export default ServerTrendChart;

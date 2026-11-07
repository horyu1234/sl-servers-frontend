import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Area, AreaChart, CartesianGrid, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { CHART_AXIS_PROPS, CHART_GRID_PROPS, CHART_TOOLTIP_PROPS } from '../shared/chartTheme';
import {
  chartRows, dayToTime, majorReleases, weekStart, weeklyRows, yearTicks,
} from '../../lib/insights/history';

const CHART_MARGIN = { top: 28, right: 24, bottom: 0, left: 0 };
const PRIMARY = 'hsl(var(--primary))';
const SURFACE = 'hsl(var(--card))';
const compactNumber = new Intl.NumberFormat('en-US', { notation: 'compact' });

function HistoryTooltip({ active, payload, releasesByWeek }) {
  const { t } = useTranslation();
  const row = payload?.[0]?.payload;
  if (!active || !row) return null;
  const releases = releasesByWeek.get(row.time) ?? [];

  return (
    <div style={CHART_TOOLTIP_PROPS.contentStyle} className="px-3 py-2">
      <div className="text-sm font-semibold tabular-nums text-foreground">
        {row.peak === null ? t('insights.global.no-data') : t('insights.players', { players: row.peak.toLocaleString() })}
      </div>
      <div className="text-xs text-muted-foreground">{row.date}</div>
      {releases.map((release) => (
        <div key={release.version} className="mt-1 text-xs text-muted-foreground">
          {t('insights.global.release-tooltip', { version: release.version })}
        </div>
      ))}
    </div>
  );
}

export function GlobalHistoryChart({ history }) {
  const rows = useMemo(() => weeklyRows(chartRows(history.daily)), [history.daily]);
  const ticks = useMemo(() => yearTicks(rows), [rows]);
  const majors = useMemo(() => majorReleases(history.releases), [history.releases]);
  const releasesByWeek = useMemo(() => {
    const weeks = new Map();
    for (const release of history.releases) {
      const time = weekStart(dayToTime(release.date));
      weeks.set(time, [...(weeks.get(time) ?? []), release]);
    }
    return weeks;
  }, [history.releases]);
  const record = history.records[0];

  if (rows.length === 0) return null;

  return (
    <div className="h-[280px] w-full min-w-0 sm:h-[340px]">
      <ResponsiveContainer>
        <AreaChart data={rows} margin={CHART_MARGIN}>
          <CartesianGrid {...CHART_GRID_PROPS} />
          <XAxis
            dataKey="time"
            type="number"
            scale="time"
            domain={['dataMin', 'dataMax']}
            ticks={ticks}
            tickFormatter={(time) => new Date(time).getUTCFullYear()}
            {...CHART_AXIS_PROPS}
          />
          <YAxis
            {...CHART_AXIS_PROPS}
            width={40}
            allowDecimals={false}
            tickFormatter={(value) => compactNumber.format(value)}
          />
          <Tooltip
            content={<HistoryTooltip releasesByWeek={releasesByWeek} />}
            cursor={CHART_TOOLTIP_PROPS.cursor}
            isAnimationActive={false}
          />
          {majors.map((release) => (
            <ReferenceLine
              key={release.version}
              x={dayToTime(release.date)}
              stroke="hsl(var(--muted-foreground))"
              strokeOpacity={0.3}
            />
          ))}
          <Area
            type="linear"
            dataKey="peak"
            stroke={PRIMARY}
            strokeWidth={2}
            fill={PRIMARY}
            fillOpacity={0.1}
            connectNulls={false}
            dot={false}
            activeDot={{ r: 4, fill: PRIMARY, stroke: SURFACE, strokeWidth: 2 }}
            isAnimationActive={false}
          />
          {record && (
            <ReferenceDot
              x={weekStart(dayToTime(record.date))}
              y={record.peak}
              r={4}
              fill={PRIMARY}
              stroke={SURFACE}
              strokeWidth={2}
              label={{
                value: record.peak.toLocaleString(),
                position: 'top',
                fill: 'hsl(var(--foreground))',
                fontSize: 12,
              }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default GlobalHistoryChart;

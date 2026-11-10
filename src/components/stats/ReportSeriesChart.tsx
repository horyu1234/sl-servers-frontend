import React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTranslation } from 'react-i18next';
import { CHART_AXIS_PROPS, CHART_GRID_PROPS, CHART_MARGIN, CHART_TOOLTIP_PROPS } from '../shared/chartTheme';
import type { ReportSeriesPoint } from '../../types/api';

const PRIMARY = 'hsl(var(--primary))';
const compactNumber = new Intl.NumberFormat('en-US', { notation: 'compact' });

interface SeriesTooltipProps {
  yearly: boolean;
  // Recharts fills these in when it clones the element passed as `content`.
  active?: boolean;
  payload?: readonly { payload?: ReportSeriesPoint }[];
}

function SeriesTooltip({ active, payload, yearly }: SeriesTooltipProps) {
  const { t } = useTranslation();
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;
  return (
    <div style={CHART_TOOLTIP_PROPS.contentStyle} className="px-3 py-2">
      <div className="text-sm font-semibold tabular-nums text-foreground">
        {t('insights.players', { players: point.peak.toLocaleString() })}
      </div>
      <div className="text-xs text-muted-foreground">{yearly ? point.date.slice(0, 7) : point.date}</div>
    </div>
  );
}

/** The peak of each day of a month report, or of each month of a year report. */
export function ReportSeriesChart({ series, yearly }: { series: ReportSeriesPoint[]; yearly: boolean }) {
  if (series.length < 2) return null;

  return (
    <div className="h-[240px] w-full min-w-0 sm:h-[280px]">
      <ResponsiveContainer>
        <BarChart data={series} margin={CHART_MARGIN}>
          <CartesianGrid {...CHART_GRID_PROPS} />
          <XAxis
            dataKey="date"
            tickFormatter={(date: string) => (yearly ? date.slice(5, 7) : date.slice(8))}
            minTickGap={12}
            {...CHART_AXIS_PROPS}
          />
          <YAxis tickFormatter={(value) => compactNumber.format(value)} width={40} allowDecimals={false} {...CHART_AXIS_PROPS} />
          <Tooltip content={<SeriesTooltip yearly={yearly} />} cursor={{ fill: 'hsl(var(--muted))' }} isAnimationActive={false} />
          <Bar dataKey="peak" fill={PRIMARY} fillOpacity={0.75} radius={[2, 2, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ReportSeriesChart;

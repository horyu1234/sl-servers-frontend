import React from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CHART_AXIS_PROPS, CHART_GRID_PROPS, CHART_MARGIN, CHART_TOOLTIP_PROPS } from '../shared/chartTheme';
import type { VersionAdoptionDay } from '../../types/api';

const PRIMARY = 'hsl(var(--primary))';

interface AdoptionTooltipProps {
  // Recharts fills these in when it clones the element passed as `content`.
  active?: boolean;
  payload?: readonly { payload?: VersionAdoptionDay }[];
}

function AdoptionTooltip({ active, payload }: AdoptionTooltipProps) {
  const day = payload?.[0]?.payload;
  if (!active || !day) return null;
  return (
    <div style={CHART_TOOLTIP_PROPS.contentStyle} className="px-3 py-2">
      <div className="text-sm font-semibold tabular-nums text-foreground">{day.sharePercent.toFixed(1)}%</div>
      <div className="text-xs tabular-nums text-muted-foreground">
        {day.servers.toLocaleString()} / {day.totalServers.toLocaleString()}
      </div>
      <div className="text-xs text-muted-foreground">{day.date}</div>
    </div>
  );
}

/** The share of active servers that ran a version on each day after it arrived. */
export function AdoptionChart({ adoption }: { adoption: VersionAdoptionDay[] }) {
  if (adoption.length < 2) return null;

  return (
    <div className="h-[240px] w-full min-w-0 sm:h-[280px]">
      <ResponsiveContainer>
        <AreaChart data={adoption} margin={CHART_MARGIN}>
          <CartesianGrid {...CHART_GRID_PROPS} />
          <XAxis dataKey="date" tickFormatter={(date: string) => date.slice(5)} minTickGap={40} {...CHART_AXIS_PROPS} />
          <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} width={44} {...CHART_AXIS_PROPS} />
          <Tooltip content={<AdoptionTooltip />} cursor={CHART_TOOLTIP_PROPS.cursor} isAnimationActive={false} />
          <Area
            type="monotone"
            dataKey="sharePercent"
            stroke={PRIMARY}
            strokeWidth={2}
            fill={PRIMARY}
            fillOpacity={0.1}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AdoptionChart;

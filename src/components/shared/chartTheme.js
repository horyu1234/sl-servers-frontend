export const CHART_MARGIN = { top: 10, right: 24, bottom: 0, left: 0 };

export const CHART_GRID_PROPS = {
  stroke: 'hsl(var(--border))',
  vertical: false,
};

export const CHART_AXIS_PROPS = {
  tick: { fill: 'hsl(var(--muted-foreground))', fontSize: 11 },
  axisLine: false,
  tickLine: false,
};

export const CHART_TOOLTIP_PROPS = {
  contentStyle: {
    background: 'hsl(var(--popover))',
    border: '1px solid hsl(var(--border))',
    borderRadius: 8,
    fontSize: 12,
  },
  labelStyle: { color: 'hsl(var(--muted-foreground))', marginBottom: 4 },
  cursor: { stroke: 'hsl(var(--input))' },
};

export const CHART_LEGEND_PROPS = {
  wrapperStyle: { fontSize: 12 },
  iconType: 'plainline',
};

import React, { useMemo } from 'react';

const WIDTH = 160;
const HEIGHT = 28;

const ACCENTS = {
  green: { stroke: '#22c55e', fill: '#22c55e' },
  amber: { stroke: '#f59e0b', fill: '#f59e0b' },
  red:   { stroke: '#ef4444', fill: '#ef4444' },
  gray:  { stroke: '#5a6371', fill: '#5a6371' },
};

function chooseAccent({ current, capacity, slope }) {
  const pct = capacity > 0 ? current / capacity : 0;
  if (pct >= 0.95) return 'red';
  if (pct >= 0.8) return 'amber';
  if (slope < -0.1) return 'gray';
  return 'green';
}

function pointsFor(data, capacity) {
  if (!data || data.length === 0) return [];
  const yMax = Math.max(capacity, ...data.map((v) => v ?? 0)) || 1;
  const stepX = WIDTH / (data.length - 1 || 1);
  return data.map((v, i) => {
    const value = v ?? 0;
    const x = Math.round(i * stepX);
    const y = Math.round(HEIGHT - 2 - (value / yMax) * (HEIGHT - 4));
    return [x, y];
  });
}

function summarise(data) {
  const numeric = data.filter((v) => typeof v === 'number');
  const peak = numeric.length ? Math.max(...numeric) : 0;
  const avg = numeric.length ? Math.round(numeric.reduce((a, b) => a + b, 0) / numeric.length) : 0;
  const first = numeric[0] ?? 0;
  const last = numeric[numeric.length - 1] ?? 0;
  const delta = first === 0 ? 0 : Math.round(((last - first) / first) * 100);
  const slope = first === 0 ? 0 : (last - first) / first;
  return { peak, avg, delta, slope };
}

export function ServerSparkline({ data, capacity = 0, current = 0, className = '' }) {
  const computed = useMemo(() => {
    if (data === null) return { state: 'new' };
    if (Array.isArray(data) && data.length === 0) return { state: 'empty' };
    if (!Array.isArray(data)) return { state: 'empty' };
    const summary = summarise(data);
    const accent = ACCENTS[chooseAccent({ current, capacity, slope: summary.slope })];
    const points = pointsFor(data, capacity);
    const linePath = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ');
    const fillPath = `${linePath} L${WIDTH},${HEIGHT} L0,${HEIGHT} Z`;
    return { state: 'ok', summary, accent, linePath, fillPath };
  }, [data, capacity, current]);

  if (computed.state === 'new') {
    return <span className={`text-[10px] uppercase tracking-wider text-muted-foreground ${className}`}>new</span>;
  }
  if (computed.state === 'empty') {
    return <span className={`text-muted-foreground ${className}`}>—</span>;
  }

  const { summary, accent, linePath, fillPath } = computed;
  const deltaClass =
    summary.delta > 5 ? 'text-[#22c55e]' : summary.delta < -5 ? 'text-[#ef4444]' : 'text-muted-foreground';
  const arrow = summary.delta > 5 ? '▲' : summary.delta < -5 ? '▼' : '—';

  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" aria-hidden="true">
        <path d={fillPath} fill={accent.fill} fillOpacity="0.18" />
        <path d={linePath} fill="none" stroke={accent.stroke} strokeWidth="1.3" />
      </svg>
      <div className="flex justify-between text-[9px] text-muted-foreground tabular-nums">
        <span>peak {summary.peak} · avg {summary.avg}</span>
        <span className={deltaClass}>{arrow} {summary.delta >= 0 ? '+' : ''}{summary.delta}%</span>
      </div>
    </div>
  );
}

export default ServerSparkline;

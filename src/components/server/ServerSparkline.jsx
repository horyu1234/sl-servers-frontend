import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const VIEW_W = 160;
const VIEW_H = 28;

const ACCENT = 'hsl(var(--primary))';

function pointsFor(data) {
  if (!data || data.length === 0) return [];
  const yMax = Math.max(...data.map((v) => v ?? 0)) || 1;
  const stepX = VIEW_W / (data.length - 1 || 1);
  return data.map((v, i) => {
    const value = v ?? 0;
    const x = Math.round(i * stepX);
    const y = Math.round(VIEW_H - 2 - (value / yMax) * (VIEW_H - 4));
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
  return { peak, avg, delta };
}

export function ServerSparkline({ data, className = '', compact = false }) {
  const { t } = useTranslation();
  const computed = useMemo(() => {
    if (data === null) return { state: 'new' };
    if (Array.isArray(data) && data.length === 0) return { state: 'empty' };
    if (!Array.isArray(data)) return { state: 'empty' };
    const summary = summarise(data);
    const points = pointsFor(data);
    const linePath = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ');
    const fillPath = `${linePath} L${VIEW_W},${VIEW_H} L0,${VIEW_H} Z`;
    return { state: 'ok', summary, linePath, fillPath };
  }, [data]);

  if (computed.state === 'new') {
    return <span className={`text-[11px] uppercase tracking-wider text-muted-foreground ${className}`}>{t('server-list.sparkline.new', 'new')}</span>;
  }
  if (computed.state === 'empty') {
    return <span className={`text-muted-foreground ${className}`}>—</span>;
  }

  const { summary, linePath, fillPath } = computed;
  const deltaClass =
    summary.delta > 5 ? 'text-primary' : summary.delta < -5 ? 'text-destructive' : 'text-muted-foreground';
  const arrow = summary.delta > 5 ? '▲' : summary.delta < -5 ? '▼' : '—';
  const sign = summary.delta >= 0 ? '+' : '';

  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ width: '100%', height: VIEW_H }}
      >
        <path d={fillPath} fill={ACCENT} fillOpacity="0.18" />
        <path d={linePath} fill="none" stroke={ACCENT} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
      </svg>
      <div
        data-testid="sparkline-summary"
        data-compact={compact ? 'true' : 'false'}
        className="flex justify-between gap-1 text-[11px] leading-4 text-muted-foreground tabular-nums"
      >
        <span className="truncate">
          {t('server-list.sparkline.peak', 'peak')} {summary.peak} · {t('server-list.sparkline.avg', 'avg')} {summary.avg}
        </span>
        <span className={`${deltaClass} whitespace-nowrap`}>{arrow} {sign}{summary.delta}%</span>
      </div>
    </div>
  );
}

export default ServerSparkline;

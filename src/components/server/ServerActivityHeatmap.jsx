import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/cn';
import {
  localGrid, localPosition, moveCell, peakOf, stepOf, viewerOffsetHours, zoneLabel,
} from '../../lib/insights/heatmap';
import { intlLocale } from '../../i18n/intlLocale';

// One hue, brighter for busier hours: on the dark surface, luminance reads as magnitude.
const STEP_ALPHAS = [0.16, 0.32, 0.52, 0.76, 1];
const BRIGHT_STEP = 3;
const OFTEN_FULL_RATE = 0.5;
const HOUR_LABELS = [0, 6, 12, 18];

function stepColor(step) {
  return `hsl(var(--primary) / ${STEP_ALPHAS[step - 1]})`;
}

function weekdayNames(language) {
  const formatter = new Intl.DateTimeFormat(language, { weekday: 'short', timeZone: 'UTC' });
  // 2024-01-01 is a Monday, the first row of the grid.
  return Array.from({ length: 7 }, (_, day) => formatter.format(Date.UTC(2024, 0, 1 + day)));
}

function HeatCell({ step, isActive, isOftenFull, onActivate }) {
  return (
    <div
      className={cn(
        'relative flex h-5 items-center justify-center rounded-[2px] sm:h-6',
        step === 0 && 'bg-muted',
        isActive && 'outline outline-1 outline-foreground',
      )}
      style={step > 0 ? { backgroundColor: stepColor(step) } : undefined}
      onMouseEnter={onActivate}
      onClick={onActivate}
    >
      {isOftenFull && (
        <span
          data-testid="often-full"
          className={cn('h-1 w-1 rounded-full', step >= BRIGHT_STEP ? 'bg-background' : 'bg-foreground')}
        />
      )}
    </div>
  );
}

export function ServerActivityHeatmap({ heatmap }) {
  const { t, i18n } = useTranslation();
  const [now] = useState(() => new Date());
  const [selected, setSelected] = useState(null);

  const offsetHours = viewerOffsetHours(now);
  const grid = useMemo(() => localGrid(heatmap, offsetHours), [heatmap, offsetHours]);
  const peak = useMemo(() => peakOf(heatmap.medians), [heatmap]);
  const language = i18n.resolvedLanguage ?? i18n.language;
  const days = useMemo(() => weekdayNames(intlLocale(language)), [language]);

  const current = localPosition(now, offsetHours);
  const active = selected ?? current;
  const activeCell = grid[active.day][active.hour];
  const isCurrent = selected === null;

  const time = t('insights.heatmap.time', { day: days[active.day], hour: active.hour });
  let readout = t('insights.heatmap.readout-empty', { time });
  if (activeCell.players !== null) {
    readout = t(isCurrent ? 'insights.heatmap.readout-now' : 'insights.heatmap.readout', {
      time,
      players: activeCell.players.toLocaleString(),
    });
    if (activeCell.fullRate > 0) {
      readout += ` · ${t('insights.heatmap.readout-full', { percent: Math.round(activeCell.fullRate * 100) })}`;
    }
  }

  const handleKeyDown = (event) => {
    const next = moveCell(active, event.key);
    if (!next) return;
    event.preventDefault();
    setSelected(next);
  };

  return (
    <Card className="min-w-0">
      <CardHeader className="p-4 sm:p-5">
        <CardTitle>{t('insights.heatmap.title')}</CardTitle>
        <p className="text-xs text-muted-foreground">
          {t('insights.heatmap.description', { weeks: heatmap.weeks, zone: zoneLabel(now) })}
        </p>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0 sm:p-5 sm:pt-0">
        <div
          role="group"
          tabIndex={0}
          aria-label={t('insights.heatmap.title')}
          onKeyDown={handleKeyDown}
          onMouseLeave={() => setSelected(null)}
          onBlur={() => setSelected(null)}
          className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          <div aria-hidden="true" className="grid grid-cols-[auto_repeat(24,minmax(0,1fr))] gap-[2px]">
            {grid.map((cells, day) => (
              <React.Fragment key={day}>
                <div className="flex min-w-7 items-center whitespace-nowrap pr-1 text-[11px] text-muted-foreground sm:min-w-9">{days[day]}</div>
                {cells.map((cell) => (
                  <HeatCell
                    key={cell.hour}
                    step={stepOf(cell.players, peak)}
                    isActive={cell.day === active.day && cell.hour === active.hour}
                    isOftenFull={cell.fullRate !== null && cell.fullRate >= OFTEN_FULL_RATE}
                    onActivate={() => setSelected({ day: cell.day, hour: cell.hour })}
                  />
                ))}
              </React.Fragment>
            ))}
            <div />
            {Array.from({ length: 24 }, (_, hour) => (
              <div key={hour} className="relative h-4 text-[11px] text-muted-foreground">
                {HOUR_LABELS.includes(hour) && <span className="absolute left-0">{hour}</span>}
              </div>
            ))}
          </div>
        </div>

        <p aria-live="polite" className="text-sm tabular-nums text-foreground">{readout}</p>

        {peak === 0 && (
          <p className="text-sm text-muted-foreground">{t('insights.heatmap.quiet', { weeks: heatmap.weeks })}</p>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span>{t('insights.heatmap.legend-low')}</span>
            <span className="flex gap-[2px]" aria-hidden="true">
              <span className="h-2.5 w-4 rounded-[2px] bg-muted" />
              {STEP_ALPHAS.map((_, index) => (
                <span key={index} className="h-2.5 w-4 rounded-[2px]" style={{ backgroundColor: stepColor(index + 1) }} />
              ))}
            </span>
            <span>{t('insights.heatmap.legend-high', { players: peak.toLocaleString() })}</span>
          </div>
          {heatmap.capacity && (
            <div className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-foreground" aria-hidden="true" />
              <span>{t('insights.heatmap.legend-full', { capacity: heatmap.capacity })}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default ServerActivityHeatmap;

import { describe, expect, it } from 'vitest';
import type { CollectionGap, ReleaseImpact } from '../../types/api';
import {
  chartRows, dayToTime, majorReleases, signedPercent, spanBetween, totalGapDays, weekStart, weeklyRows, yearTicks,
} from './history';

describe('spanBetween', () => {
  it('splits long spans into years and months', () => {
    expect(spanBetween('2025-02-26', '2026-11-07')).toEqual({ years: 1, months: 8, days: 0 });
  });

  it('does not count a month that has not finished', () => {
    expect(spanBetween('2026-01-31', '2026-02-28')).toEqual({ years: 0, months: 0, days: 28 });
  });

  it('counts days for a brand-new server', () => {
    expect(spanBetween('2026-11-01', '2026-11-07')).toEqual({ years: 0, months: 0, days: 6 });
    expect(spanBetween('2026-11-07', '2026-11-07')).toEqual({ years: 0, months: 0, days: 0 });
  });
});

describe('chartRows', () => {
  it('keeps missed days as null so the line breaks', () => {
    const rows = chartRows([
      { date: '2026-03-16', peak: 10 },
      { date: '2026-03-19', peak: 20 },
    ]);

    expect(rows.map((row) => [row.date, row.peak])).toEqual([
      ['2026-03-16', 10],
      ['2026-03-17', null],
      ['2026-03-18', null],
      ['2026-03-19', 20],
    ]);
  });

  it('crosses a month end and the leap day', () => {
    const rows = chartRows([{ date: '2024-02-28', peak: 1 }, { date: '2024-03-01', peak: 2 }]);
    expect(rows.map((row) => row.date)).toEqual(['2024-02-28', '2024-02-29', '2024-03-01']);
  });

  it('handles an empty series', () => {
    expect(chartRows([])).toEqual([]);
    expect(yearTicks([])).toEqual([]);
  });
});

describe('weekStart', () => {
  it('lands on the Monday of the week', () => {
    expect(weekStart(dayToTime('2023-10-29'))).toBe(dayToTime('2023-10-23'));
    expect(weekStart(dayToTime('2023-10-23'))).toBe(dayToTime('2023-10-23'));
  });
});

describe('weeklyRows', () => {
  it('keeps the busiest day of each week and its real date', () => {
    const weeks = weeklyRows(chartRows([
      { date: '2023-10-23', peak: 100 },
      { date: '2023-10-29', peak: 11565 },
      { date: '2023-10-30', peak: 200 },
    ]));

    expect(weeks.map((week) => [week.time, week.date, week.peak])).toEqual([
      [dayToTime('2023-10-23'), '2023-10-29', 11565],
      [dayToTime('2023-10-30'), '2023-10-30', 200],
    ]);
  });

  it('uses the days that exist in a partly collected week', () => {
    const weeks = weeklyRows(chartRows([
      { date: '2026-03-16', peak: 300 },
      { date: '2026-03-17', peak: 400 },
      { date: '2026-03-23', peak: 500 },
    ]));

    expect(weeks.map((week) => week.peak)).toEqual([400, 500]);
  });

  it('counts a null first day as no peak rather than zero', () => {
    const weeks = weeklyRows([
      { time: dayToTime('2026-03-16'), date: '2026-03-16', peak: null },
      { time: dayToTime('2026-03-17'), date: '2026-03-17', peak: 5 },
    ]);

    expect(weeks[0].peak).toBe(5);
    expect(weeks[0].date).toBe('2026-03-17');
  });

  it('breaks the line across a week with no data at all', () => {
    const weeks = weeklyRows(chartRows([
      { date: '2026-03-23', peak: 300 },
      { date: '2026-04-13', peak: 500 },
    ]));

    expect(weeks.map((week) => week.peak)).toEqual([300, null, null, 500]);
  });
});

describe('yearTicks', () => {
  it('marks each new year inside the series', () => {
    const rows = chartRows([{ date: '2023-12-30', peak: 1 }, { date: '2025-01-02', peak: 1 }]);
    expect(yearTicks(rows)).toEqual([Date.UTC(2024, 0, 1), Date.UTC(2025, 0, 1)]);
  });
});

describe('majorReleases', () => {
  it('keeps major versions, newest first, without reordering the input', () => {
    const releases = [
      { version: '13.3.0', date: '2023-10-28', major: true },
      { version: '13.3.1', date: '2023-11-15', major: false },
      { version: '14.0.0', date: '2024-12-22', major: true },
    ] as ReleaseImpact[];

    expect(majorReleases(releases).map((release) => release.version)).toEqual(['14.0.0', '13.3.0']);
    expect(releases[0].version).toBe('13.3.0');
  });
});

describe('totalGapDays', () => {
  it('adds every outage', () => {
    expect(totalGapDays([{ days: 7 }, { days: 19 }] as CollectionGap[])).toBe(26);
    expect(totalGapDays([])).toBe(0);
  });
});

describe('signedPercent', () => {
  it('always shows the direction', () => {
    expect(signedPercent(31.2)).toBe('+31.2%');
    expect(signedPercent(-14.4)).toBe('-14.4%');
    expect(signedPercent(0)).toBe('0.0%');
  });

  it('shows a dash when there is nothing to compare', () => {
    expect(signedPercent(null)).toBe('—');
  });
});

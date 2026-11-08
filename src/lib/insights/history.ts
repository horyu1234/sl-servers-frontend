import type { CollectionGap, DailyPlayerPeak, IsoDate, ReleaseImpact } from '../../types/api';

const DAY_MS = 86_400_000;

export interface HistoryRow {
  time: number;
  date: IsoDate;
  peak: number | null;
}

export function dayToTime(date: IsoDate) {
  return Date.parse(`${date}T00:00:00Z`);
}

function timeToDay(time: number) {
  return new Date(time).toISOString().slice(0, 10);
}

/** Whole calendar months between two ISO dates, never negative. */
function monthsBetween(from: IsoDate, to: IsoDate) {
  const start = new Date(dayToTime(from));
  const end = new Date(dayToTime(to));
  const months = (end.getUTCFullYear() - start.getUTCFullYear()) * 12
    + end.getUTCMonth() - start.getUTCMonth()
    - (end.getUTCDate() < start.getUTCDate() ? 1 : 0);
  return Math.max(0, months);
}

/** Span between two ISO dates as { years, months, days }; `days` is only set under a month. */
export function spanBetween(from: IsoDate, to: IsoDate) {
  const months = monthsBetween(from, to);
  if (months === 0) {
    return { years: 0, months: 0, days: Math.round((dayToTime(to) - dayToTime(from)) / DAY_MS) };
  }
  return { years: Math.floor(months / 12), months: months % 12, days: 0 };
}

/**
 * One row per calendar day. Days the collector missed stay in the series with a
 * null peak, so the line breaks across an outage rather than bridging it.
 */
export function chartRows(daily: DailyPlayerPeak[]) {
  if (daily.length === 0) return [];
  const peakByDay = new Map(daily.map((day) => [day.date, day.peak]));
  const first = dayToTime(daily[0].date);
  const last = dayToTime(daily[daily.length - 1].date);

  const rows: HistoryRow[] = [];
  for (let time = first; time <= last; time += DAY_MS) {
    const date = timeToDay(time);
    rows.push({ time, date, peak: peakByDay.get(date) ?? null });
  }
  return rows;
}

/** Monday 00:00 UTC of the week holding `time`. */
export function weekStart(time: number) {
  const daysSinceMonday = (new Date(time).getUTCDay() + 6) % 7;
  return time - daysSinceMonday * DAY_MS;
}

/**
 * Folds daily rows into one point per week, keeping that week's busiest day. Plotting
 * every day draws the weekend cycle as a solid band that hides the long-term trend.
 * `date` stays the real date of the peak, and a week with no data at all stays null.
 */
export function weeklyRows(dailyRows: HistoryRow[]) {
  const weeks = new Map<number, HistoryRow>();
  for (const row of dailyRows) {
    const time = weekStart(row.time);
    const week = weeks.get(time);
    if (!week) {
      weeks.set(time, { time, date: row.date, peak: row.peak });
    } else if (row.peak !== null && (week.peak === null || row.peak > week.peak)) {
      week.date = row.date;
      week.peak = row.peak;
    }
  }
  return Array.from(weeks.values());
}

/** January 1st of every year inside the series. */
export function yearTicks(rows: HistoryRow[]) {
  if (rows.length === 0) return [];
  const firstYear = new Date(rows[0].time).getUTCFullYear();
  const lastYear = new Date(rows[rows.length - 1].time).getUTCFullYear();

  const ticks: number[] = [];
  for (let year = firstYear + 1; year <= lastYear; year += 1) {
    ticks.push(Date.UTC(year, 0, 1));
  }
  return ticks;
}

/** Major releases, newest first. */
export function majorReleases(releases: ReleaseImpact[]) {
  return releases
    .filter((release) => release.major)
    .sort((a, b) => dayToTime(b.date) - dayToTime(a.date));
}

export function totalGapDays(gaps: CollectionGap[]) {
  return gaps.reduce((total, gap) => total + gap.days, 0);
}

export function signedPercent(value: number | null | undefined) {
  if (value === null || value === undefined) return '—';
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
}

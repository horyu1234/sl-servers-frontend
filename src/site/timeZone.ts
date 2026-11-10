// The reader's time zone. The collected data is cut into UTC hours and UTC days, and a page says
// when those fall on the reader's clock. The app reads the browser's zone; the edge function
// guesses it from where the request came from, so both usually write the same words.

const HOUR_MINUTES = 60;
const DAY_MINUTES = 24 * HOUR_MINUTES;
const DAY_HOURS = 24;
const WEEK_HOURS = 7 * DAY_HOURS;

/** Minutes the clock this code runs on is ahead of UTC: the visitor's zone in a browser. */
export function clockOffsetMinutes(date = new Date()) {
  return -date.getTimezoneOffset();
}

/**
 * Minutes a time zone such as Asia/Seoul is ahead of UTC at this moment.
 * An unknown or missing zone counts as UTC.
 */
export function offsetOfTimeZone(timeZone: string | null | undefined, now = Date.now()) {
  if (!timeZone) return 0;
  try {
    const minute = Math.floor(now / 60_000) * 60_000;
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).formatToParts(minute);
    const part = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((entry) => entry.type === type)?.value);
    const wallClock = Date.UTC(part('year'), part('month') - 1, part('day'), part('hour'), part('minute'));
    const offset = Math.round((wallClock - minute) / 60_000);
    return Number.isFinite(offset) ? offset : 0;
  } catch {
    // Intl throws on a zone name it does not know.
    return 0;
  }
}

/** The whole hours of an offset. Half-hour zones round to the nearest hour, as the heatmap's columns do. */
export function offsetHours(offsetMinutes: number) {
  return Math.round(offsetMinutes / HOUR_MINUTES);
}

/** "UTC", "UTC+9" or "UTC-3:30". */
export function zoneLabel(offsetMinutes: number) {
  if (offsetMinutes === 0) return 'UTC';
  const sign = offsetMinutes < 0 ? '-' : '+';
  const hours = Math.floor(Math.abs(offsetMinutes) / HOUR_MINUTES);
  const minutes = Math.abs(offsetMinutes) % HOUR_MINUTES;
  return `UTC${sign}${hours}${minutes ? `:${String(minutes).padStart(2, '0')}` : ''}`;
}

/** An hour of the UTC week on the reader's clock. Monday is weekday 0. */
export function readerHour(weekday: number, hour: number, offsetMinutes: number) {
  const utcSlot = weekday * DAY_HOURS + hour;
  const slot = (((utcSlot + offsetHours(offsetMinutes)) % WEEK_HOURS) + WEEK_HOURS) % WEEK_HOURS;
  return { weekday: Math.floor(slot / DAY_HOURS), hour: slot % DAY_HOURS };
}

/** The time on the reader's clock at which a UTC day starts, such as "09:00". */
export function dayStart(offsetMinutes: number) {
  const minutes = ((offsetMinutes % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES;
  const hour = String(Math.floor(minutes / HOUR_MINUTES)).padStart(2, '0');
  return `${hour}:${String(minutes % HOUR_MINUTES).padStart(2, '0')}`;
}

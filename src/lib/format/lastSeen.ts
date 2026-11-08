import type { i18n as I18n } from 'i18next';
import { intlLocale } from '../../i18n/intlLocale';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export type ElapsedUnit = 'day' | 'hour' | 'minute';

/** The time from `then` to `now` in its largest whole unit, never less than one minute. */
export function elapsed(then: number, now: number): { value: number; unit: ElapsedUnit } {
  const ms = Math.max(0, now - then);
  if (ms >= DAY) return { value: Math.floor(ms / DAY), unit: 'day' };
  if (ms >= HOUR) return { value: Math.floor(ms / HOUR), unit: 'hour' };
  return { value: Math.max(1, Math.floor(ms / MINUTE)), unit: 'minute' };
}

function baseLanguage(tag: string) {
  return tag.split('-')[0].toLowerCase();
}

/** "45 days ago" in the site language. */
export function formatAgo(then: number, now: number, i18n: I18n): string {
  const { value, unit } = elapsed(then, now);
  const language = i18n.resolvedLanguage ?? i18n.language;
  const key = `server-info.offline-notice.ago.${unit}`;
  const locale = intlLocale(language);
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'always' });
  // Intl has no phrases for some languages: for Esperanto, Chrome answers in its own language
  // and Node in a bare "-45 d". A locale file that spells the phrase out is used instead, and a
  // browser that switches to another language gets the English phrase.
  const ownPhrase = i18n.getResource(language, 'translation', `${key}_other`) !== undefined;
  if (ownPhrase || baseLanguage(formatter.resolvedOptions().locale) !== baseLanguage(locale)) {
    return i18n.t(key, { count: value });
  }
  return formatter.format(-value, unit);
}

/** Local time as YYYY-MM-DD HH:mm, like the other dates on the site. */
export function formatLocalDateTime(time: number): string {
  const date = new Date(time);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

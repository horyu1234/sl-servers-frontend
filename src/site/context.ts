// What a page model needs to write text in one language: a translator, formatters and links.
import { intlLocale } from '../i18n/intlLocale';
import { countryName } from './countryName';
import { localizedPath } from './routes';

export type Translate = (key: string, values?: Record<string, unknown>) => string;

export interface SiteContext {
  /** The site language of the text, such as ko-KR. */
  language: string;
  t: Translate;
  /** 12,345 or, with fraction digits, 12,345.6 */
  number(value: number, fractionDigits?: number): string;
  /** A UTC day such as 2023-10-29 as "October 29, 2023". */
  date(day: string): string;
  /** A month such as 2026-10 as "October 2026". */
  month(period: string): string;
  /** Monday is 0. */
  weekday(index: number): string;
  /**
   * Minutes the reader's clock is ahead of UTC. Times in the text are written for this clock.
   * 0 where the reader is not known, as for a crawler.
   */
  utcOffsetMinutes: number;
  country(isoCode: string): string;
  /** An address without a language prefix, as a link that stays in the visitor's language. */
  href(path: string): string;
}

const formatters = new Map<string, Intl.NumberFormat | Intl.DateTimeFormat>();

function cached<T extends Intl.NumberFormat | Intl.DateTimeFormat>(key: string, create: () => T): T {
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = create();
    formatters.set(key, formatter);
  }
  // The key names the kind of formatter, so the cast only restates what create() returned.
  return formatter as T;
}

/**
 * @param urlLanguage the language of the address prefix, or null on an address without one.
 *                    Links keep the prefix the visitor is under.
 * @param utcOffsetMinutes the reader's time zone, as minutes ahead of UTC.
 */
export function createSiteContext(
  language: string,
  t: Translate,
  urlLanguage: string | null,
  utcOffsetMinutes = 0,
): SiteContext {
  const locale = intlLocale(language);

  return {
    language,
    t,
    utcOffsetMinutes,
    number(value, fractionDigits = 0) {
      return cached(`n|${locale}|${fractionDigits}`, () => new Intl.NumberFormat(locale, {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      })).format(value);
    },
    date(day) {
      return cached(`d|${locale}`, () => new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }))
        .format(Date.parse(`${day}T00:00:00Z`));
    },
    month(period) {
      return cached(`m|${locale}`, () => new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', timeZone: 'UTC' }))
        .format(Date.parse(`${period}-01T00:00:00Z`));
    },
    weekday(index) {
      // 2024-01-01 is a Monday.
      return cached(`w|${locale}`, () => new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' }))
        .format(Date.UTC(2024, 0, 1 + index));
    },
    country(isoCode) {
      return countryName(isoCode.toUpperCase(), language) ?? isoCode.toUpperCase();
    },
    href(path) {
      return localizedPath(path, urlLanguage);
    },
  };
}

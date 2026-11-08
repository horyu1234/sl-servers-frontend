import { afterAll, describe, expect, it } from 'vitest';
import i18n from '../../i18n/i18n';
import { elapsed, formatAgo, formatLocalDateTime } from './lastSeen';

const NOW = Date.parse('2026-11-08T12:00:00Z');
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe('elapsed', () => {
  it.each([
    [45 * DAY + 5 * HOUR, { value: 45, unit: 'day' }],
    [DAY, { value: 1, unit: 'day' }],
    [DAY - 1, { value: 23, unit: 'hour' }],
    [HOUR, { value: 1, unit: 'hour' }],
    [59 * MINUTE, { value: 59, unit: 'minute' }],
    [10_000, { value: 1, unit: 'minute' }],
    [-5 * MINUTE, { value: 1, unit: 'minute' }],
  ])('turns %i ms into %o', (ms, expected) => {
    expect(elapsed(NOW - ms, NOW)).toEqual(expected);
  });
});

describe('formatAgo', () => {
  afterAll(() => i18n.changeLanguage('en-US'));

  it.each([
    ['en-US', 45 * DAY, '45 days ago'],
    ['en-US', DAY, '1 day ago'],
    ['ko-KR', 45 * DAY, '45일 전'],
    ['ko-KR', 3 * HOUR, '3시간 전'],
    ['de-DE', 45 * DAY, 'vor 45 Tagen'],
    ['pl-PL', MINUTE, '1 minutę temu'],
    ['ee-EE', 45 * DAY, '45 päeva eest'],
    // Intl has no Esperanto phrases, so they come from the locale file.
    ['eo-EO', 45 * DAY, 'antaŭ 45 tagoj'],
    ['eo-EO', DAY, 'antaŭ 1 tago'],
  ])('%s: %i ms ago reads "%s"', async (language, ms, expected) => {
    await i18n.changeLanguage(language);

    expect(formatAgo(NOW - ms, NOW, i18n)).toBe(expected);
  });

  it('every locale gets a phrase from Intl or its own file', async () => {
    const languages = Object.keys(i18n.options.resources ?? {});
    expect(languages.length).toBe(27);

    for (const language of languages) {
      await i18n.changeLanguage(language);
      const phrase = formatAgo(NOW - 45 * DAY, NOW, i18n);
      expect(phrase, language).toMatch(/45/);
      expect(phrase, language).not.toMatch(/^-|offline-notice/);
    }
  });
});

describe('formatLocalDateTime', () => {
  it('pads each part to the site date style', () => {
    expect(formatLocalDateTime(new Date(2026, 0, 5, 7, 3).getTime())).toBe('2026-01-05 07:03');
  });
});

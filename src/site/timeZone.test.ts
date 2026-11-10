import { describe, expect, it } from 'vitest';
import { dayStart, offsetHours, offsetOfTimeZone, readerHour, zoneLabel } from './timeZone';

describe('offsetOfTimeZone', () => {
  const winter = Date.UTC(2026, 0, 15, 12, 0, 45);
  const summer = Date.UTC(2026, 6, 15, 12, 0, 45);

  it('gives the minutes a zone is ahead of UTC', () => {
    expect(offsetOfTimeZone('Asia/Seoul', winter)).toBe(540);
    expect(offsetOfTimeZone('Asia/Kolkata', winter)).toBe(330);
    expect(offsetOfTimeZone('UTC', winter)).toBe(0);
  });

  it('follows daylight saving time', () => {
    expect(offsetOfTimeZone('America/Los_Angeles', winter)).toBe(-480);
    expect(offsetOfTimeZone('America/Los_Angeles', summer)).toBe(-420);
    expect(offsetOfTimeZone('America/St_Johns', winter)).toBe(-210);
  });

  it('counts a missing or unknown zone as UTC', () => {
    expect(offsetOfTimeZone(undefined)).toBe(0);
    expect(offsetOfTimeZone(null)).toBe(0);
    expect(offsetOfTimeZone('Mars/Olympus_Mons')).toBe(0);
  });
});

describe('zoneLabel', () => {
  it('names whole and half-hour zones', () => {
    expect(zoneLabel(0)).toBe('UTC');
    expect(zoneLabel(540)).toBe('UTC+9');
    expect(zoneLabel(-480)).toBe('UTC-8');
    expect(zoneLabel(330)).toBe('UTC+5:30');
    expect(zoneLabel(-210)).toBe('UTC-3:30');
  });
});

describe('readerHour', () => {
  it('moves an hour of the UTC week onto the reader\'s clock', () => {
    // Saturday 12:00 UTC.
    expect(readerHour(5, 12, 0)).toEqual({ weekday: 5, hour: 12 });
    expect(readerHour(5, 12, 540)).toEqual({ weekday: 5, hour: 21 });
    expect(readerHour(5, 12, -480)).toEqual({ weekday: 5, hour: 4 });
  });

  it('crosses into the next or the previous day, around the week', () => {
    // Sunday 20:00 UTC is Monday 05:00 in Seoul, and Monday 02:00 UTC is Sunday 18:00 in Los Angeles.
    expect(readerHour(6, 20, 540)).toEqual({ weekday: 0, hour: 5 });
    expect(readerHour(0, 2, -480)).toEqual({ weekday: 6, hour: 18 });
  });

  it('rounds a half-hour zone the way the heatmap does', () => {
    expect(offsetHours(330)).toBe(6);
    expect(offsetHours(-210)).toBe(-3);
    expect(readerHour(5, 12, 330)).toEqual({ weekday: 5, hour: 18 });
  });
});

describe('dayStart', () => {
  it('says when a UTC day starts on the reader\'s clock', () => {
    expect(dayStart(0)).toBe('00:00');
    expect(dayStart(540)).toBe('09:00');
    expect(dayStart(-480)).toBe('16:00');
    expect(dayStart(330)).toBe('05:30');
    expect(dayStart(-210)).toBe('20:30');
  });
});

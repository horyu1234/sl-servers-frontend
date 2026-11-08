import { describe, expect, it, vi, afterEach } from 'vitest';
import {
  localGrid, localPosition, moveCell, peakOf, stepOf, viewerOffsetHours, zoneLabel,
} from './heatmap';

function slots(entries: Record<number, number | null> = {}): (number | null)[] {
  return Array.from({ length: 168 }, (_, slot) => entries[slot] ?? 0);
}

describe('viewerOffsetHours', () => {
  afterEach(() => vi.restoreAllMocks());

  it('turns the browser offset into hours east of UTC', () => {
    vi.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(-540);
    expect(viewerOffsetHours()).toBe(9);
  });

  it('rounds half-hour zones to a whole column', () => {
    vi.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(-330);
    expect(viewerOffsetHours()).toBe(6);
  });
});

describe('localPosition', () => {
  it('uses Monday as day zero', () => {
    expect(localPosition(new Date('2026-11-02T10:00:00Z'), 0)).toEqual({ day: 0, hour: 10 });
    expect(localPosition(new Date('2026-11-08T10:00:00Z'), 0)).toEqual({ day: 6, hour: 10 });
  });

  it('crosses into the next day and week for the viewer', () => {
    expect(localPosition(new Date('2026-11-08T23:30:00Z'), 9)).toEqual({ day: 0, hour: 8 });
  });
});

describe('localGrid', () => {
  it('moves a UTC slot east for a positive offset', () => {
    const grid = localGrid({ medians: slots({ 0: 42 }) }, 9);
    expect(grid[0][9].players).toBe(42);
    expect(grid[0][0].players).toBe(0);
  });

  it('wraps the end of the UTC week into the start of the local week', () => {
    const grid = localGrid({ medians: slots({ 167: 42 }) }, 9);
    expect(grid[0][8].players).toBe(42);
  });

  it('wraps the start of the UTC week back for a negative offset', () => {
    const grid = localGrid({ medians: slots({ 0: 42 }) }, -5);
    expect(grid[6][19].players).toBe(42);
  });

  it('keeps unknown slots and full rates apart from zero', () => {
    const medians = slots();
    medians[0] = null;
    const fullRates = slots({ 1: 0.75 });

    const grid = localGrid({ medians, fullRates }, 0);

    expect(grid[0][0].players).toBeNull();
    expect(grid[0][1].fullRate).toBe(0.75);
  });

  it('has no full rates when capacity is unknown', () => {
    expect(localGrid({ medians: slots(), fullRates: null }, 0)[0][0].fullRate).toBeNull();
  });
});

describe('peakOf', () => {
  it('ignores unknown slots', () => {
    expect(peakOf([null, 3, 7, null])).toBe(7);
    expect(peakOf([null, null])).toBe(0);
  });
});

describe('stepOf', () => {
  it('separates unknown from empty from busy', () => {
    expect(stepOf(null, 10)).toBeNull();
    expect(stepOf(0, 10)).toBe(0);
    expect(stepOf(1, 10)).toBe(1);
    expect(stepOf(10, 10)).toBe(5);
  });

  it('does not divide by a zero peak', () => {
    expect(stepOf(0, 0)).toBe(0);
  });
});

describe('moveCell', () => {
  it('wraps around the grid', () => {
    expect(moveCell({ day: 0, hour: 0 }, 'ArrowLeft')).toEqual({ day: 0, hour: 23 });
    expect(moveCell({ day: 0, hour: 23 }, 'ArrowRight')).toEqual({ day: 0, hour: 0 });
    expect(moveCell({ day: 0, hour: 5 }, 'ArrowUp')).toEqual({ day: 6, hour: 5 });
    expect(moveCell({ day: 6, hour: 5 }, 'ArrowDown')).toEqual({ day: 0, hour: 5 });
  });

  it('ignores other keys', () => {
    expect(moveCell({ day: 0, hour: 0 }, 'Enter')).toBeNull();
  });
});

describe('zoneLabel', () => {
  afterEach(() => vi.restoreAllMocks());

  it('names whole and half-hour zones', () => {
    vi.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(-540);
    expect(zoneLabel()).toBe('UTC+9');
    vi.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(210);
    expect(zoneLabel()).toBe('UTC-3:30');
    vi.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(0);
    expect(zoneLabel()).toBe('UTC+0');
  });
});

const DAYS = 7;
const HOURS = 24;
const SLOTS = DAYS * HOURS;
const STEPS = 5;

/** Whole-hour offset of the viewer's zone. Half-hour zones round to the nearest column. */
export function viewerOffsetHours(date = new Date()) {
  return Math.round(-date.getTimezoneOffset() / 60);
}

/** Viewer-local position of a moment. `day` is 0 for Monday, matching the API's slot order. */
export function localPosition(date, offsetHours) {
  const shifted = new Date(date.getTime() + offsetHours * 3_600_000);
  return { day: (shifted.getUTCDay() + 6) % DAYS, hour: shifted.getUTCHours() };
}

/**
 * Rotates the API's 168 UTC slots into 7 viewer-local rows of 24 cells.
 * @param {{medians: (number|null)[], fullRates?: (number|null)[]|null}} heatmap
 * @param {number} offsetHours viewer offset from UTC
 */
export function localGrid(heatmap, offsetHours) {
  const rows = [];
  for (let day = 0; day < DAYS; day += 1) {
    const cells = [];
    for (let hour = 0; hour < HOURS; hour += 1) {
      const localSlot = day * HOURS + hour;
      const utcSlot = (((localSlot - offsetHours) % SLOTS) + SLOTS) % SLOTS;
      cells.push({
        day,
        hour,
        players: heatmap.medians[utcSlot] ?? null,
        fullRate: heatmap.fullRates?.[utcSlot] ?? null,
      });
    }
    rows.push(cells);
  }
  return rows;
}

export function peakOf(medians) {
  return medians.reduce((peak, value) => Math.max(peak, value ?? 0), 0);
}

/** 0 is an empty hour; 1-5 are equal bands up to the busiest slot; null is an unknown slot. */
export function stepOf(players, peak) {
  if (players === null) return null;
  if (players <= 0 || peak <= 0) return 0;
  return Math.min(STEPS, Math.ceil((players / peak) * STEPS));
}

/** Moves the highlighted cell by arrow key, wrapping at the edges. Other keys return null. */
export function moveCell({ day, hour }, key) {
  switch (key) {
    case 'ArrowLeft': return { day, hour: (hour + HOURS - 1) % HOURS };
    case 'ArrowRight': return { day, hour: (hour + 1) % HOURS };
    case 'ArrowUp': return { day: (day + DAYS - 1) % DAYS, hour };
    case 'ArrowDown': return { day: (day + 1) % DAYS, hour };
    default: return null;
  }
}

/** Label such as "UTC+9" or "UTC-3:30" for the viewer's zone. */
export function zoneLabel(date = new Date()) {
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes < 0 ? '-' : '+';
  const hours = Math.floor(Math.abs(offsetMinutes) / 60);
  const minutes = Math.abs(offsetMinutes) % 60;
  return `UTC${sign}${hours}${minutes ? `:${String(minutes).padStart(2, '0')}` : ''}`;
}

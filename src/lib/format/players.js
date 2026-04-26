export function parsePlayers(value) {
  if (typeof value !== 'string') return { current: 0, capacity: 0 };
  const [a, b] = value.split('/');
  const current = Number.parseInt(a, 10);
  const capacity = Number.parseInt(b, 10);
  if (Number.isNaN(current) || Number.isNaN(capacity)) {
    return { current: 0, capacity: 0 };
  }
  return { current, capacity };
}

export function playersPercent({ current, capacity }) {
  if (!capacity) return 0;
  return Math.round((current / capacity) * 100);
}

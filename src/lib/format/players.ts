export interface PlayerCount {
  current: number;
  capacity: number;
}

export function parsePlayers(value: unknown): PlayerCount {
  if (typeof value !== 'string') return { current: 0, capacity: 0 };
  const [a, b] = value.split('/');
  const current = Number.parseInt(a, 10);
  const capacity = Number.parseInt(b, 10);
  if (Number.isNaN(current) || Number.isNaN(capacity)) {
    return { current: 0, capacity: 0 };
  }
  return { current, capacity };
}

export function playersPercent({ current, capacity }: PlayerCount) {
  if (!capacity) return 0;
  return Math.min(100, Math.round((current / capacity) * 100));
}

export function playersBarClass(percent: number) {
  if (percent >= 95) return 'bg-destructive';
  if (percent >= 80) return 'bg-warning';
  return 'bg-primary';
}

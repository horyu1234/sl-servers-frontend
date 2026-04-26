// /api/servers does not return a ping today. The List page surfaces
// distance via ServerDistance. This adapter wraps the mi/km branch so
// the new row can call it without importing a connected Redux component.
export function formatDistanceKm(km, si /* 'km' | 'mi' */) {
  if (km == null) return '—';
  const value = si === 'mi' ? km / 1.609 : km;
  return `${Math.floor(value * 100) / 100} ${si}`;
}

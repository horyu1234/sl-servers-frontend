// API returns distance in km. UI lets the user pick km or mi via the
// top-bar Unit select; this util converts and formats accordingly.
const KM_PER_MI = 1.609;

export function formatDistance(km, si /* 'km' | 'mi' */) {
  if (km == null) return '—';
  const value = si === 'mi' ? km / KM_PER_MI : km;
  return `${Math.round(value)} ${si}`;
}

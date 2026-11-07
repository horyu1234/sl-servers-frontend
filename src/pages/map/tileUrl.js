const CARTO_DARK_TILES = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

// CARTO answers 200 with an "API KEY REQUIRED" placeholder image when the key
// is missing or invalid, so a bad key shows up as a watermark, not an error.
export function cartoTileUrl(apiKey) {
  return apiKey ? `${CARTO_DARK_TILES}?key=${encodeURIComponent(apiKey)}` : CARTO_DARK_TILES;
}

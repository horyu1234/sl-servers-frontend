import { describe, it, expect } from 'vitest';
import { cartoTileUrl } from './tileUrl';

describe('cartoTileUrl', () => {
  it('adds the key as a query parameter', () => {
    expect(cartoTileUrl('abc123')).toBe(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=abc123'
    );
  });

  it('encodes the key so it cannot break the URL or Leaflet templating', () => {
    expect(cartoTileUrl('a+b/{c}')).toContain('?key=a%2Bb%2F%7Bc%7D');
  });

  it.each([undefined, ''])('omits the parameter when the key is %j', (key) => {
    expect(cartoTileUrl(key)).not.toContain('?');
  });
});

import { describe, it, expect } from 'vitest';
import { isPastebinKey, pastebinEmbedUrl, pastebinPageUrl } from './pastebin';

describe('pastebin keys', () => {
  it('builds URLs for a real paste key', () => {
    expect(isPastebinKey('dujQCM81')).toBe(true);
    expect(pastebinPageUrl('dujQCM81')).toBe('https://pastebin.com/dujQCM81');
    expect(pastebinEmbedUrl('dujQCM81')).toBe('https://pastebin.com/embed_iframe/dujQCM81');
  });

  it.each([
    ['empty', ''],
    ['missing', undefined],
    ['null', null],
    ['non-string', 12345678],
    ['too short', 'abc123'],
    ['too long', 'dujQCM81a'],
    ['path traversal', '../../aa'],
    ['query string', 'abc?x=12'],
    ['full URL', 'https://evil.example/dujQCM81'],
    ['trailing newline', 'dujQCM81\n'],
  ])('rejects a %s value', (_label, key) => {
    expect(isPastebinKey(key)).toBe(false);
    expect(pastebinPageUrl(key)).toBeNull();
    expect(pastebinEmbedUrl(key)).toBeNull();
  });
});

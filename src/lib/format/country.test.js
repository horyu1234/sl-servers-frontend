import { describe, it, expect } from 'vitest';
import { isoToFlagEmoji } from './country';

describe('isoToFlagEmoji', () => {
  it('converts KR to the South Korea flag emoji', () => {
    expect(isoToFlagEmoji('KR')).toBe('🇰🇷');
  });
  it('converts lowercase input', () => {
    expect(isoToFlagEmoji('us')).toBe('🇺🇸');
  });
  it('returns empty string for invalid input', () => {
    expect(isoToFlagEmoji('')).toBe('');
    expect(isoToFlagEmoji('XYZ')).toBe('');
    expect(isoToFlagEmoji('K1')).toBe('');
    expect(isoToFlagEmoji(null)).toBe('');
    expect(isoToFlagEmoji(undefined)).toBe('');
  });
});

import { describe, it, expect } from 'vitest';
import { plainServerName } from './serverName';

describe('plainServerName', () => {
  it('strips color markup and keeps only the first line', () => {
    const html = '<span style="color:#ff0000">[KR]</span> Site-19<br/>Discord: example';
    expect(plainServerName(html)).toBe('[KR] Site-19');
  });

  it('skips blank leading lines', () => {
    expect(plainServerName('<br/>  <br/>Real name')).toBe('Real name');
  });

  it('returns an empty string for missing info', () => {
    expect(plainServerName(undefined)).toBe('');
  });
});

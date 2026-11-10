import { describe, expect, it } from 'vitest';
import { escapeHtml, plainServerName, truncate } from './plainText';

// What the old implementation answered: the browser's own parser, which the edge function lacks.
function domServerName(html: string) {
  const text = new DOMParser().parseFromString(html.replace(/<br\s*\/?>/gi, '\n'), 'text/html').body.textContent ?? '';
  return text.split('\n').map((line) => line.trim()).find(Boolean) ?? '';
}

describe('plainServerName', () => {
  it.each([
    '<span style="color:#ff0000">[KR]</span> Site-19<br/>Discord: example',
    '<br/>  <br/>Real name',
    '<b>Bold</b> &amp; <i>italic</i> &lt;3',
    'Tom &quot;The Cat&quot; &#39;s server &#x1F600;',
    '[CN]梦时镜·纯净服务器#3〔群号:1022230020〕',
    'plain name',
  ])('reads %s like the browser does', (html) => {
    expect(plainServerName(html)).toBe(domServerName(html));
  });

  it('collapses the runs of spaces servers pad their names with', () => {
    expect(plainServerName('Clown   Server              24h')).toBe('Clown Server 24h');
  });

  it('returns an empty string for missing info', () => {
    expect(plainServerName(undefined)).toBe('');
    expect(plainServerName(null)).toBe('');
  });

  it('leaves an entity it does not know as it is', () => {
    expect(plainServerName('a &bogus; b')).toBe('a &bogus; b');
  });
});

describe('escapeHtml', () => {
  it('escapes everything that could leave a text node or an attribute', () => {
    expect(escapeHtml(`<script>alert("x")</script> & 'y'`)).toBe('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#39;y&#39;');
  });
});

describe('truncate', () => {
  it('keeps a text that fits', () => {
    expect(truncate('short', 10)).toBe('short');
  });

  it('cuts at a word and marks the cut', () => {
    expect(truncate('one two three four five', 14)).toBe('one two three…');
  });

  it('cuts inside a word when there is no space near the limit', () => {
    expect(truncate('abcdefghijklmnopqrstuvwxyz', 10)).toBe('abcdefghi…');
  });
});

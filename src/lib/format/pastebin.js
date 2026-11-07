// Every paste key the server list reported on 2026-11-07 (1,114 of 1,114) has
// this shape. The value comes from server owners, so anything else is treated
// as "no embeddable paste" rather than being placed into a URL.
const PASTE_KEY = /^[A-Za-z0-9]{8}$/;

export function isPastebinKey(key) {
  return typeof key === 'string' && PASTE_KEY.test(key);
}

export function pastebinPageUrl(key) {
  return isPastebinKey(key) ? `https://pastebin.com/${key}` : null;
}

export function pastebinEmbedUrl(key) {
  return isPastebinKey(key) ? `https://pastebin.com/embed_iframe/${key}` : null;
}

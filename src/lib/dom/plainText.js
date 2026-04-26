// Parse a possibly-HTML server description string into plain text.
// Uses DOMParser, which builds an inert document and never runs scripts,
// so this is safe to call on backend-supplied HTML.
export function plainTextFromHtml(html) {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body?.textContent ?? '';
}

// server.info is rich text with colors and <br/> separated lines. DOMParser
// builds an inert document, so nothing in the markup runs or loads here.
export function plainServerName(html: string | null | undefined) {
  if (!html) return '';
  const withLineBreaks = html.replace(/<br\s*\/?>/gi, '\n');
  const text = new DOMParser().parseFromString(withLineBreaks, 'text/html').body.textContent ?? '';
  return text.split('\n').map((line) => line.trim()).find(Boolean) ?? '';
}

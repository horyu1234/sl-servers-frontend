// The written pages (about, data, privacy, contact, API guide) are plain data, so the React
// app and the edge function can both draw them.
//
// Text may hold three inline marks: [label](address), `code` and **bold**. An address that
// starts with "/" is a page of this site and keeps the visitor's language.

export type DocBlock =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'table'; head: string[]; rows: string[][] }
  | { type: 'code'; text: string };

export interface Doc {
  /** The document title without the site name. */
  title: string;
  description: string;
  heading: string;
  /** Opening paragraph under the heading. */
  intro: string[];
  blocks: DocBlock[];
}

/** One document in each language it has been written in. English is always there. */
export type DocSet = { 'en-US': Doc } & Record<string, Doc>;

export type InlineToken =
  | { type: 'text'; text: string }
  | { type: 'link'; text: string; href: string }
  | { type: 'code'; text: string }
  | { type: 'bold'; text: string };

const INLINE = /\[([^\]]+)\]\(([^)\s]+)\)|`([^`]+)`|\*\*([^*]+)\*\*/g;

export function parseInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let last = 0;
  for (const match of text.matchAll(INLINE)) {
    if (match.index > last) tokens.push({ type: 'text', text: text.slice(last, match.index) });
    if (match[1] !== undefined) tokens.push({ type: 'link', text: match[1], href: match[2] });
    else if (match[3] !== undefined) tokens.push({ type: 'code', text: match[3] });
    else tokens.push({ type: 'bold', text: match[4] });
    last = match.index + match[0].length;
  }
  if (last < text.length) tokens.push({ type: 'text', text: text.slice(last) });
  return tokens;
}

/** The text of an inline string without its marks, for descriptions and plain output. */
export function plainInline(text: string) {
  return parseInline(text).map((token) => token.text).join('');
}

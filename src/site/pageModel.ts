// A page as data: its head, its opening text and its tables. The React pages draw it, and the
// edge function writes the same text into the HTML that crawlers and slow connections get first.
import type { SiteContext } from './context';
import type { DocBlock } from './docs/types';

export interface Cell {
  text: string;
  /** Address without a language prefix. */
  href?: string;
  /** ISO country code whose flag goes before the text. */
  flag?: string;
}

export type CellValue = string | Cell;

export interface Table {
  head: string[];
  rows: CellValue[][];
  /** Indexes of the columns that hold numbers. They are right-aligned. */
  numeric?: number[];
}

export interface Section {
  heading?: string;
  paragraphs?: string[];
  links?: Cell[];
  table?: Table;
  /** Small print under the table. */
  note?: string;
}

export interface Tile {
  label: string;
  value: string;
  note?: string;
}

export interface PageModel {
  /** The whole document title. */
  title: string;
  description: string;
  heading: string;
  intro: string[];
  tiles?: Tile[];
  sections: Section[];
  /** Long-form text of the written pages. */
  blocks?: DocBlock[];
  /** From the home page down to this page, which comes last and has no link. */
  breadcrumbs: Cell[];
  noindex?: boolean;
  /** Languages the page's own text exists in. Unset for pages built from the locale files. */
  languages?: string[];
}

export function cellText(cell: CellValue) {
  return typeof cell === 'string' ? cell : cell.text;
}

/** "+8.4%", "-16.9%" or an em dash when there is nothing to compare with. */
export function signedPercent(ctx: SiteContext, value: number | null | undefined) {
  if (value === null || value === undefined) return '—';
  return `${value > 0 ? '+' : value < 0 ? '−' : ''}${ctx.number(Math.abs(value), 1)}%`;
}

/** The i18next context that picks the wording of a sentence about a change. */
export function trend(value: number | null | undefined): 'up' | 'down' | 'flat' | 'none' {
  if (value === null || value === undefined) return 'none';
  if (value > 0) return 'up';
  if (value < 0) return 'down';
  return 'flat';
}

export function percentOf(ctx: SiteContext, value: number) {
  return ctx.number(Math.abs(value), 1);
}

export function homeCrumb(ctx: SiteContext): Cell {
  return { text: ctx.t('navbar.server-list'), href: '/' };
}

/** The hour-of-week slot with the highest typical peak, or null when every slot is empty or unknown. */
export function busiestSlot(medians: (number | null)[] | null | undefined) {
  let best: { weekday: number; hour: number; players: number } | null = null;
  (medians ?? []).forEach((players, slot) => {
    if (players === null || players < 1) return;
    if (!best || players > best.players) best = { weekday: Math.floor(slot / 24), hour: slot % 24, players };
  });
  return best as { weekday: number; hour: number; players: number } | null;
}

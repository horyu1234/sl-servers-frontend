// A page as data: its head, its opening text and its tables. The React pages draw it, and the
// edge function writes the same text into the HTML that crawlers and slow connections get first.
import type { SiteContext } from './context';
import type { DocBlock } from './docs/types';
import { dayStart, readerHour, zoneLabel } from './timeZone';

/** Which way a number moved. It only picks a color: the sign is always in the text too. */
export type Tone = 'up' | 'down';

/** The color of each tone. The app and the edge function both use these classes. */
export const TONE_CLASS: Record<Tone, string> = {
  up: 'text-primary',
  down: 'text-destructive',
};

export interface Cell {
  text: string;
  /** Address without a language prefix. */
  href?: string;
  /** ISO country code whose flag goes before the text. */
  flag?: string;
  tone?: Tone;
}

export type CellValue = string | Cell;

export interface Table {
  head: string[];
  rows: CellValue[][];
  /** Indexes of the columns that hold numbers. They are right-aligned. */
  numeric?: number[];
}

export interface Section {
  /** Names the section in the address, as in /rankings#rising. A page with section tabs needs it. */
  id?: string;
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
  /** Set when the value or the note is a change. */
  valueTone?: Tone;
  noteTone?: Tone;
}

export interface PageModel {
  /** The whole document title. */
  title: string;
  description: string;
  heading: string;
  intro: string[];
  tiles?: Tile[];
  sections: Section[];
  /**
   * The sections are views of one thing, such as the boards of the rankings. The app then shows
   * one at a time behind a menu, so a long first section does not bury the others.
   */
  sectionTabs?: boolean;
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

export function toneOf(value: number | null | undefined): Tone | undefined {
  if (value === null || value === undefined || value === 0) return undefined;
  return value > 0 ? 'up' : 'down';
}

/** A change as a table cell: "+8.4%" in the color of a rise, "−16.9%" in the color of a fall. */
export function changeCell(ctx: SiteContext, value: number | null | undefined): Cell {
  return { text: signedPercent(ctx, value), tone: toneOf(value) };
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

/**
 * The hour-of-week slot with the highest typical peak, or null when every slot is empty or
 * unknown. The slot is in UTC; hourWords puts it on the reader's clock.
 */
export function busiestSlot(medians: (number | null)[] | null | undefined) {
  let best: { weekday: number; hour: number; players: number } | null = null;
  (medians ?? []).forEach((players, slot) => {
    if (players === null || players < 1) return;
    if (!best || players > best.players) best = { weekday: Math.floor(slot / 24), hour: slot % 24, players };
  });
  return best as { weekday: number; hour: number; players: number } | null;
}

/** An hour of the UTC week in words on the reader's clock: "Saturday", "21" and "UTC+9". */
export function hourWords(ctx: SiteContext, slot: { weekday: number; hour: number }) {
  const local = readerHour(slot.weekday, slot.hour, ctx.utcOffsetMinutes);
  return {
    weekday: ctx.weekday(local.weekday),
    hour: String(local.hour).padStart(2, '0'),
    zone: zoneLabel(ctx.utcOffsetMinutes),
  };
}

/**
 * Where a day of the data starts on the reader's clock: "09:00" and "UTC+9". Daily numbers are
 * cut at midnight UTC and cannot be cut again in the browser, so the text says when that is.
 */
export function dayWords(ctx: SiteContext) {
  return { dayStart: dayStart(ctx.utcOffsetMinutes), zone: zoneLabel(ctx.utcOffsetMinutes) };
}

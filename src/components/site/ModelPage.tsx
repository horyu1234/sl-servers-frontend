import React, { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CountryFlag } from '../server/CountryFlag';
import { LocaleLink } from '../shell/LocaleLink';
import { PageHeader } from '../shared/PageHeader';
import { StatTile } from '../shared/StatTile';
import { DocBlocks } from './DocBlocks';
import { usePageHead } from '../../lib/hooks/usePageHead';
import { TONE_CLASS, cellText } from '../../site/pageModel';
import type { Cell, CellValue, PageModel, Section, Table, Tile } from '../../site/pageModel';
import { cn } from '@/lib/cn';

function CellContent({ cell }: { cell: CellValue }) {
  if (typeof cell === 'string') return <>{cell}</>;
  const label = (
    <span className="inline-flex min-w-0 max-w-full items-center gap-1.5 align-bottom">
      {cell.flag && <CountryFlag isoCode={cell.flag} className="shrink-0 rounded-[1px] shadow-sm" />}
      <span className={cn('truncate', cell.tone && TONE_CLASS[cell.tone])}>{cell.text}</span>
    </span>
  );
  if (!cell.href) return label;
  return (
    <LocaleLink to={cell.href} className="text-foreground underline-offset-2 hover:text-primary hover:underline">
      {label}
    </LocaleLink>
  );
}

export function DataTable({ table }: { table: Table }) {
  const numeric = new Set(table.numeric ?? []);
  // A table without a head is a list of names and values.
  const hasHead = table.head.length > 0;

  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:-mx-5 sm:px-5">
      <table className="w-full text-sm tabular-nums">
        {hasHead && (
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              {table.head.map((label, column) => (
                <th
                  key={column}
                  scope="col"
                  className={cn('whitespace-nowrap py-1.5 pr-3 font-normal last:pr-0', numeric.has(column) && 'text-right')}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-border">
          {table.rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, column) => (
                <td
                  key={column}
                  className={cn(
                    'py-2 pr-3 last:pr-0',
                    numeric.has(column) ? 'whitespace-nowrap text-right text-muted-foreground' : 'max-w-[22rem]',
                    !hasHead && column === 0 && 'text-muted-foreground',
                  )}
                >
                  <CellContent cell={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LinkList({ links }: { links: Cell[] }) {
  return (
    <ul className="grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2 lg:grid-cols-3">
      {links.map((link) => (
        <li key={`${link.href}|${link.text}`} className="min-w-0 truncate">
          <CellContent cell={link} />
        </li>
      ))}
    </ul>
  );
}

export function SectionCard({ section }: { section: Section }) {
  return (
    <Card className="min-w-0">
      {section.heading && (
        <CardHeader className="p-4 sm:p-5">
          <CardTitle>{section.heading}</CardTitle>
          {section.paragraphs?.map((paragraph) => (
            <p key={paragraph} className="text-xs text-muted-foreground">{paragraph}</p>
          ))}
        </CardHeader>
      )}
      <CardContent className={cn('space-y-3 p-4 sm:p-5', section.heading && 'pt-0 sm:pt-0')}>
        {section.table && <DataTable table={section.table} />}
        {section.links && <LinkList links={section.links} />}
        {section.note && <p className="text-xs text-muted-foreground">{section.note}</p>}
      </CardContent>
    </Card>
  );
}

// Height of the site's sticky menu, which the section menu sticks under.
const SITE_MENU_HEIGHT = 56;

/**
 * Sections shown one at a time behind a menu. The fragment of the address picks the section, so
 * a section can be linked, and the menu stays in reach while a long table scrolls. The other
 * sections stay in the document, hidden, so the page holds the same text as the HTML from the edge.
 */
export function SectionTabs({ sections }: { sections: Section[] }) {
  const { t } = useTranslation();
  const { hash } = useLocation();
  const topRef = useRef<HTMLDivElement>(null);
  const active = sections.find((section) => `#${section.id}` === hash) ?? sections[0];

  // Brings the menu to the top of the window. `always` is for a page opened on a section:
  // the browser scrolled for the HTML it first got, which was longer than this page.
  const showTop = (always: boolean) => {
    if (!topRef.current) return;
    const top = Math.max(0, topRef.current.getBoundingClientRect().top + window.scrollY - SITE_MENU_HEIGHT);
    if (always || window.scrollY > top) window.scrollTo({ top });
  };

  useEffect(() => {
    if (sections.some((section) => `#${section.id}` === hash)) showTop(true);
    // Only for the address the page was opened with.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div ref={topRef} />
      <nav
        aria-label={t('pages.common.sections')}
        className="sticky top-14 z-20 -mx-3 border-b border-border bg-background/90 px-3 py-2 backdrop-blur sm:-mx-4 sm:px-4"
      >
        <ul className="flex gap-1.5 overflow-x-auto">
          {sections.map((section) => (
            <li key={section.id} className="shrink-0">
              <Link
                to={{ hash: `#${section.id}` }}
                replace
                // Coming from far down a long table, the next section opens at its top.
                onClick={() => showTop(false)}
                aria-current={section === active ? 'true' : undefined}
                className={cn(
                  'flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm no-underline transition-colors',
                  section === active ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                {section.heading}
                {section.table && <span className="text-xs tabular-nums opacity-60">{section.table.rows.length}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {sections.map((section) => (
        <div key={section.id} hidden={section !== active}>
          <SectionCard section={section} />
        </div>
      ))}
    </>
  );
}

export function TileGrid({ tiles }: { tiles: Tile[] }) {
  return (
    <div className={cn('grid grid-cols-2 gap-3 lg:grid-cols-4', tiles.length > 4 && 'xl:grid-cols-5')}>
      {tiles.map((tile) => (
        <StatTile
          key={tile.label}
          label={tile.label}
          value={tile.valueTone ? <span className={TONE_CLASS[tile.valueTone]}>{tile.value}</span> : tile.value}
          note={tile.noteTone ? <span className={TONE_CLASS[tile.noteTone]}>{tile.note}</span> : tile.note}
        />
      ))}
    </div>
  );
}

export function Breadcrumbs({ items }: { items: Cell[] }) {
  const { t } = useTranslation();
  if (items.length < 2) return null;

  return (
    <nav aria-label={t('pages.common.breadcrumb')} className="mb-2 text-xs text-muted-foreground">
      <ol className="flex min-w-0 flex-wrap items-center gap-1">
        {items.map((item, index) => (
          <li key={`${item.href}|${item.text}`} className="flex min-w-0 items-center gap-1">
            {index > 0 && <ChevronRight className="h-3 w-3 shrink-0 opacity-60" aria-hidden="true" />}
            {item.href
              ? <LocaleLink to={item.href} className="truncate no-underline hover:text-foreground">{item.text}</LocaleLink>
              : <span className="max-w-[16rem] truncate" aria-current="page">{cellText(item)}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

interface ModelPageProps {
  model: PageModel;
  /** Shown under the page header, above everything else. */
  top?: ReactNode;
  /** Charts and other parts that only the browser draws. They go between the tiles and the tables. */
  children?: ReactNode;
}

/** Draws a page model: breadcrumbs, heading, opening text, tiles, tables and long-form text. */
export function ModelPage({ model, top, children }: ModelPageProps) {
  usePageHead(model);
  const isDocument = model.blocks !== undefined;

  return (
    <div className={cn('mx-auto w-full px-3 py-4 sm:px-4 sm:py-6', isDocument ? 'max-w-3xl' : 'max-w-screen-xl')}>
      <Breadcrumbs items={model.breadcrumbs} />
      <PageHeader title={model.heading} />
      {top && <div className="mt-3">{top}</div>}
      <div className="mt-3 max-w-3xl space-y-2 text-sm leading-6 text-muted-foreground">
        {model.intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>
      <div className="mt-4 space-y-4">
        {model.tiles && model.tiles.length > 0 && <TileGrid tiles={model.tiles} />}
        {children}
        {model.sectionTabs && model.sections.length > 1
          ? <SectionTabs sections={model.sections} />
          : model.sections.map((section, index) => <SectionCard key={section.heading ?? index} section={section} />)}
        {model.blocks && <DocBlocks blocks={model.blocks} />}
      </div>
    </div>
  );
}

export default ModelPage;

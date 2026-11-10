// Writes a page model into the built index.html. The result is what crawlers read and what a
// visitor sees until the app has loaded and takes over #root.
//
// The classes are the ones the app uses for the same parts, so the page does not jump when
// React replaces it. Tailwind finds them here because it scans the whole project.
import type { SiteContext } from '../site/context';
import { parseInline } from '../site/docs/types';
import type { DocBlock } from '../site/docs/types';
import { SITE_NAME } from '../site/head';
import type { PageHead } from '../site/head';
import type { Cell, CellValue, PageModel, Section, Table, Tile } from '../site/pageModel';
import { siteLinks } from '../site/pages/links';
import { escapeHtml } from '../site/plainText';
import { SITE_ORIGIN, absoluteUrl } from '../site/routes';

export const HEAD_START = '<!--head:start-->';
export const HEAD_END = '<!--head:end-->';
export const EMPTY_ROOT = '<div id="root"></div>';
const HTML_TAG = /<html lang="[^"]*">/;

const LINK = 'text-primary underline-offset-2 hover:underline';

function link(ctx: SiteContext, href: string, text: string, className = LINK) {
  if (href.startsWith('/')) return `<a href="${escapeHtml(ctx.href(href))}" class="${className}">${escapeHtml(text)}</a>`;
  return `<a href="${escapeHtml(href)}" rel="noreferrer" class="${className}">${escapeHtml(text)}</a>`;
}

function inline(ctx: SiteContext, text: string) {
  return parseInline(text).map((token) => {
    if (token.type === 'link') return link(ctx, token.href, token.text);
    if (token.type === 'code') return `<code class="break-words rounded bg-muted px-1 py-0.5 text-foreground">${escapeHtml(token.text)}</code>`;
    if (token.type === 'bold') return `<strong class="font-semibold text-foreground">${escapeHtml(token.text)}</strong>`;
    return escapeHtml(token.text);
  }).join('');
}

function cell(ctx: SiteContext, value: CellValue) {
  if (typeof value === 'string') return escapeHtml(value);
  return value.href ? link(ctx, value.href, value.text, 'text-foreground underline-offset-2 hover:underline') : escapeHtml(value.text);
}

function table(ctx: SiteContext, { head, rows, numeric }: Table) {
  const right = new Set(numeric ?? []);
  const align = (column: number) => (right.has(column) ? ' text-right' : '');
  const thead = head.length === 0 ? '' : `<thead><tr class="text-left text-xs text-muted-foreground">${
    head.map((label, column) => `<th scope="col" class="py-1.5 pr-3 font-normal${align(column)}">${escapeHtml(label)}</th>`).join('')
  }</tr></thead>`;
  const tbody = rows.map((row) => `<tr>${
    row.map((value, column) => `<td class="py-2 pr-3${align(column)}">${cell(ctx, value)}</td>`).join('')
  }</tr>`).join('');
  return `<div class="overflow-x-auto"><table class="w-full text-sm tabular-nums">${thead}<tbody class="divide-y divide-border">${tbody}</tbody></table></div>`;
}

function linkList(ctx: SiteContext, links: Cell[]) {
  return `<ul class="grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2 lg:grid-cols-3">${
    links.map((item) => `<li class="truncate">${cell(ctx, item)}</li>`).join('')
  }</ul>`;
}

function section(ctx: SiteContext, { heading, paragraphs, table: data, links, note }: Section) {
  return `<section class="space-y-3 rounded-lg border border-border bg-card p-4 sm:p-5">${[
    heading ? `<h2 class="font-semibold leading-none tracking-tight text-foreground">${escapeHtml(heading)}</h2>` : '',
    ...(paragraphs ?? []).map((paragraph) => `<p class="text-xs text-muted-foreground">${escapeHtml(paragraph)}</p>`),
    data ? table(ctx, data) : '',
    links ? linkList(ctx, links) : '',
    note ? `<p class="text-xs text-muted-foreground">${escapeHtml(note)}</p>` : '',
  ].join('')}</section>`;
}

function tiles(items: Tile[]) {
  return `<dl class="grid grid-cols-2 gap-3 lg:grid-cols-4${items.length > 4 ? ' xl:grid-cols-5' : ''}">${items.map((tile) => (
    `<div class="rounded-lg border border-border bg-card p-3 sm:px-4">`
    + `<dt class="truncate text-xs text-muted-foreground">${escapeHtml(tile.label)}</dt>`
    + `<dd class="mt-1 text-lg font-semibold tabular-nums leading-tight text-foreground sm:text-xl">${escapeHtml(tile.value)}</dd>`
    + (tile.note ? `<dd class="mt-0.5 text-xs text-muted-foreground">${escapeHtml(tile.note)}</dd>` : '')
    + '</div>'
  )).join('')}</dl>`;
}

function block(ctx: SiteContext, item: DocBlock) {
  switch (item.type) {
    case 'h2':
      return `<h2 class="pt-4 text-lg font-semibold tracking-tight text-foreground">${escapeHtml(item.text)}</h2>`;
    case 'h3':
      return `<h3 class="pt-1 text-sm font-semibold text-foreground">${escapeHtml(item.text)}</h3>`;
    case 'p':
      return `<p>${inline(ctx, item.text)}</p>`;
    case 'ul':
      return `<ul class="list-disc space-y-1.5 pl-5">${item.items.map((entry) => `<li>${inline(ctx, entry)}</li>`).join('')}</ul>`;
    case 'code':
      return `<pre class="overflow-x-auto rounded-lg border border-border bg-muted/40 p-3 text-xs leading-5 text-foreground"><code>${escapeHtml(item.text)}</code></pre>`;
    case 'table':
      return `<div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="text-left text-xs text-muted-foreground">${
        item.head.map((label) => `<th scope="col" class="py-1.5 pr-4 font-normal">${escapeHtml(label)}</th>`).join('')
      }</tr></thead><tbody class="divide-y divide-border">${
        item.rows.map((row) => `<tr>${row.map((value) => `<td class="py-2 pr-4 align-top">${inline(ctx, value)}</td>`).join('')}</tr>`).join('')
      }</tbody></table></div>`;
  }
}

function breadcrumbs(ctx: SiteContext, items: Cell[]) {
  if (items.length < 2) return '';
  return `<nav aria-label="${escapeHtml(ctx.t('pages.common.breadcrumb'))}" class="mb-2 text-xs text-muted-foreground">${
    items.map((item) => (item.href
      ? link(ctx, item.href, item.text, 'no-underline hover:text-foreground')
      : `<span aria-current="page">${escapeHtml(item.text)}</span>`)).join(' › ')
  }</nav>`;
}

/** The page as HTML for #root: the site's menu, the model's text and tables, and the footer links. */
export function renderBody(ctx: SiteContext, model: PageModel) {
  const links = siteLinks(ctx);
  const menu = [...links.browse, ...links.statistics.slice(0, 1), { text: 'API', href: '/api' }];
  const footer = [...links.browse, ...links.statistics, ...links.site];
  const navLink = 'whitespace-nowrap text-muted-foreground no-underline hover:text-foreground';
  const width = model.blocks ? 'max-w-3xl' : 'max-w-screen-xl';

  return '<div class="flex min-h-screen flex-col bg-background text-foreground">'
    + '<header class="border-b border-border">'
    + '<div class="mx-auto flex h-14 items-center gap-4 overflow-hidden px-4 text-sm">'
    + link(ctx, '/', 'SCP: SL Servers', 'whitespace-nowrap font-semibold text-foreground no-underline')
    + `<nav class="flex gap-4">${menu.map((item) => link(ctx, item.href ?? '/', item.text, navLink)).join('')}</nav>`
    + '</div></header>'
    + `<main class="mx-auto w-full ${width} flex-1 px-3 py-4 sm:px-4 sm:py-6">`
    + breadcrumbs(ctx, model.breadcrumbs)
    + `<h1 class="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">${escapeHtml(model.heading)}</h1>`
    + `<div class="mt-3 max-w-3xl space-y-2 text-sm leading-6 text-muted-foreground">${
      model.intro.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')
    }</div>`
    + '<div class="mt-4 space-y-4">'
    + (model.tiles && model.tiles.length > 0 ? tiles(model.tiles) : '')
    + model.sections.map((item) => section(ctx, item)).join('')
    + (model.blocks
      ? `<div class="space-y-3 text-sm leading-6 text-muted-foreground">${model.blocks.map((item) => block(ctx, item)).join('')}</div>`
      : '')
    + '</div></main>'
    + '<footer class="mt-8 border-t border-border">'
    + `<nav class="mx-auto flex max-w-screen-xl flex-wrap gap-x-4 gap-y-1 px-4 py-6 text-sm">${
      footer.map((item) => link(ctx, item.href ?? '/', item.text, navLink)).join('')
    }</nav></footer>`
    + '</div>';
}

function jsonLd(data: unknown) {
  // "<" would let a server name close the script element.
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
}

function structuredData(ctx: SiteContext, head: PageHead, model: PageModel) {
  if (head.noindex) return '';
  if (model.breadcrumbs.length < 2) {
    return jsonLd({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      alternateName: 'SCP List',
      url: `${SITE_ORIGIN}/`,
    });
  }
  return jsonLd({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: model.breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.text,
      item: item.href ? absoluteUrl(ctx.href(item.href)) : head.canonical,
    })),
  });
}

/** The tags between the head markers of index.html. usePageHead keeps the same tags in step later. */
export function renderHead(ctx: SiteContext, head: PageHead, model: PageModel) {
  return [
    `<title>${escapeHtml(head.title)}</title>`,
    `<meta name="description" content="${escapeHtml(head.description)}">`,
    `<meta property="og:title" content="${escapeHtml(head.title)}">`,
    `<meta property="og:description" content="${escapeHtml(head.description)}">`,
    `<meta property="og:url" content="${escapeHtml(head.canonical)}">`,
    `<link rel="canonical" href="${escapeHtml(head.canonical)}">`,
    ...head.alternates.map(({ hreflang, href }) => `<link rel="alternate" hreflang="${escapeHtml(hreflang)}" href="${escapeHtml(href)}">`),
    head.noindex ? '<meta name="robots" content="noindex">' : '',
    structuredData(ctx, head, model),
  ].filter(Boolean).join('\n    ');
}

/**
 * Puts a page into the built index.html. A shell without the markers comes back unchanged:
 * an old build must never be served half rewritten.
 */
export function renderDocument(shell: string, ctx: SiteContext, head: PageHead, model: PageModel) {
  const start = shell.indexOf(HEAD_START);
  const end = shell.indexOf(HEAD_END);
  if (start < 0 || end < start || !shell.includes(EMPTY_ROOT)) return shell;

  return (shell.slice(0, start + HEAD_START.length)
    + `\n    ${renderHead(ctx, head, model)}\n    `
    + shell.slice(end))
    .replace(HTML_TAG, `<html lang="${escapeHtml(head.lang)}">`)
    // A function as the replacement keeps "$" in a server name from being read as a pattern.
    .replace(EMPTY_ROOT, () => `<div id="root">${renderBody(ctx, model)}</div>`);
}

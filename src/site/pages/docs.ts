// The written pages. They are kept apart from the other page models so that pages which do
// not show them, the server list above all, do not download their text.
import type { SiteContext } from '../context';
import { ABOUT } from '../docs/about';
import { API_GUIDE } from '../docs/apiGuide';
import { CONTACT } from '../docs/contact';
import { METHODOLOGY } from '../docs/methodology';
import { PRIVACY } from '../docs/privacy';
import type { Doc, DocSet } from '../docs/types';
import { withSiteName } from '../head';
import { DEFAULT_LANGUAGE } from '../locales';
import { homeCrumb } from '../pageModel';
import type { Cell, PageModel } from '../pageModel';
import { pathOf } from '../routes';
import type { PageName } from '../routes';

const DOCS: Partial<Record<PageName, DocSet>> = {
  about: ABOUT,
  methodology: METHODOLOGY,
  privacy: PRIVACY,
  contact: CONTACT,
  api: API_GUIDE,
};

/** The languages a written page exists in, or undefined for a page that is not a written one. */
export function docLanguages(page: PageName) {
  const docs = DOCS[page];
  return docs ? Object.keys(docs) : undefined;
}

/** The document in the context's language, or in English when it has not been translated. */
export function docFor(ctx: SiteContext, page: PageName): Doc | null {
  const docs = DOCS[page];
  if (!docs) return null;
  return docs[ctx.language] ?? docs[DEFAULT_LANGUAGE];
}

export function docModel(ctx: SiteContext, page: PageName): PageModel | null {
  const docs = DOCS[page];
  const doc = docFor(ctx, page);
  if (!docs || !doc) return null;

  const crumbs: Cell[] = [homeCrumb(ctx)];
  if (page === 'methodology') crumbs.push({ text: ctx.t('navbar.about'), href: pathOf('about') });
  crumbs.push({ text: doc.heading });

  return {
    title: withSiteName(doc.title),
    description: doc.description,
    heading: doc.heading,
    intro: doc.intro,
    blocks: doc.blocks,
    sections: [],
    breadcrumbs: crumbs,
    languages: docLanguages(page),
  };
}

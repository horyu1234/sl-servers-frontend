import { describe, expect, it } from 'vitest';
import {
  countries, country, history, insights, rankings, report, reports, server, testContext, versionDetail, versions,
} from '../site/pages/testData';
import { parsePath } from '../site/routes';
import { API_PATHS, buildPage } from './pages';
import { fakeApi } from './testUtils';

const ctx = testContext();

function build(path: string, answers: Record<string, unknown> = {}) {
  return buildPage(ctx, parsePath(path).route, fakeApi(answers));
}

describe('buildPage', () => {
  it('answers 404 for an address that is not a page', async () => {
    const page = await build('/nothing-here');

    expect(page.status).toBe(404);
    expect(page.model.noindex).toBe(true);
  });

  it('builds a server page from the server and its insights', async () => {
    const page = await build('/servers/7', {
      [API_PATHS.server('7')]: server,
      [API_PATHS.insights('7')]: insights,
    });

    expect(page.status).toBe(200);
    expect(page.model.heading).toBe('[KR] Site-19 & Friends');
    expect(page.model.intro).toHaveLength(4);
  });

  it('builds a server page without insights', async () => {
    const page = await build('/servers/7', { [API_PATHS.server('7')]: server });

    expect(page.status).toBe(200);
    expect(page.model.intro).toHaveLength(1);
  });

  it('answers 404 when the API says there is no such server', async () => {
    expect((await build('/servers/7', { [API_PATHS.server('7')]: null })).status).toBe(404);
  });

  it('keeps the server page when the API does not answer', async () => {
    const page = await build('/servers/7');

    expect(page.status).toBe(200);
    expect(page.model.heading).toBe('Server info');
  });

  it.each([
    ['/countries/kr', { [API_PATHS.countries]: countries, [API_PATHS.country('KR')]: country }, 'SCP: SL servers in South Korea'],
    ['/countries/KR', { [API_PATHS.country('KR')]: country }, 'SCP: SL servers in South Korea'],
    ['/versions/14.2.9', { [API_PATHS.versions]: versions, [API_PATHS.version('14.2.9')]: versionDetail }, 'SCP: SL 14.2.9'],
    ['/reports/2026-10', { [API_PATHS.reports]: reports, [API_PATHS.report('2026-10')]: report }, 'October 2026 report'],
  ])('builds %s from its detail', async (path, answers, heading) => {
    const page = await build(path, answers);

    expect(page.status).toBe(200);
    expect(page.model.heading).toBe(heading);
    expect(page.model.intro.length).toBeGreaterThan(1);
  });

  it.each([
    ['/countries/zz', { [API_PATHS.countries]: countries }],
    ['/versions/1.2.3', { [API_PATHS.versions]: versions }],
    ['/reports/2019-01', { [API_PATHS.reports]: reports }],
    ['/reports/2019', { [API_PATHS.reports]: reports }],
  ])('answers 404 for %s when the list that arrived does not hold it', async (path, answers) => {
    expect((await build(path, answers)).status).toBe(404);
  });

  it.each([
    ['/countries/zz'],
    ['/versions/1.2.3'],
    ['/reports/2019-01'],
  ])('keeps %s when no list arrived to prove it missing', async (path) => {
    const page = await build(path);

    expect(page.status).toBe(200);
    expect(page.model.intro).toEqual([]);
  });

  it('keeps a page that the list holds while its detail is missing', async () => {
    const page = await build('/countries/kr', { [API_PATHS.countries]: countries });

    expect(page.status).toBe(200);
    expect(page.model.heading).toBe('SCP: SL servers in South Korea');
  });

  it.each([
    ['/', {}],
    ['/stats', {}],
    ['/map', {}],
    ['/credit', {}],
    ['/api', {}],
    ['/about', {}],
    ['/about/data', {}],
    ['/about/funding', {}],
    ['/privacy', {}],
    ['/contact', {}],
    ['/rankings', {}],
    ['/rankings', { [API_PATHS.rankings]: rankings }],
    ['/countries', { [API_PATHS.countries]: countries }],
    ['/versions', { [API_PATHS.versions]: versions }],
    ['/reports', { [API_PATHS.reports]: reports }],
    ['/records', { [API_PATHS.history]: history }],
    ['/records', {}],
  ])('always has a page for %s', async (path, answers) => {
    const page = await build(path, answers);

    expect(page.status).toBe(200);
    expect(page.model.title).not.toBe('');
    expect(page.model.noindex ?? false).toBe(false);
  });

  it('adds the popular servers to the home page when the rankings arrive', async () => {
    const page = await build('/', { [API_PATHS.rankings]: rankings });

    expect(page.model.sections.map((section) => section.heading)).toContain('Most popular');
  });
});

import { describe, expect, it } from 'vitest';
import { PREFIXED_LANGUAGES } from '../locales';
import { cellText } from '../pageModel';
import type { PageModel } from '../pageModel';
import { parsePath } from '../routes';
import { creditModel, listModel, mapModel, notFoundModel, statsModel } from './basic';
import { docModel } from './docs';
import { siteLinks } from './links';
import { countriesModel, countryModel } from './countries';
import { fallbackModel } from './fallback';
import { rankingsModel } from './rankings';
import { recordsModel, yearlyRecords } from './records';
import { periodLabel, reportModel, reportsModel } from './reports';
import { serverModel, serverSentences } from './server';
import {
  countries, country, history, insights, rankings, report, reports, server, testContext, versionDetail, versions,
  yearReport,
} from './testData';
import { versionModel, versionsModel } from './versions';

const en = testContext();
const ko = testContext('ko-KR', 'ko-KR');

function allModels(ctx = en): Record<string, PageModel> {
  return {
    list: listModel(ctx, { rankings, countries }),
    stats: statsModel(ctx, history),
    map: mapModel(ctx),
    credit: creditModel(ctx),
    notFound: notFoundModel(ctx),
    server: serverModel(ctx, server, insights),
    countries: countriesModel(ctx, countries),
    country: countryModel(ctx, country),
    rankings: rankingsModel(ctx, rankings),
    versions: versionsModel(ctx, versions),
    version: versionModel(ctx, versionDetail),
    records: recordsModel(ctx, history, countries),
    reports: reportsModel(ctx, reports),
    report: reportModel(ctx, report),
    yearReport: reportModel(ctx, yearReport),
  };
}

function texts(model: PageModel) {
  return [
    model.title,
    model.description,
    model.heading,
    ...model.intro,
    ...model.breadcrumbs.map(cellText),
    ...(model.tiles ?? []).flatMap((tile) => [tile.label, tile.value, tile.note ?? '']),
    ...model.sections.flatMap((section) => [
      section.heading ?? '',
      section.note ?? '',
      ...(section.paragraphs ?? []),
      ...(section.links ?? []).map(cellText),
      ...(section.table?.head ?? []),
      ...(section.table?.rows ?? []).flat().map(cellText),
    ]),
  ];
}

function links(model: PageModel) {
  return [
    ...model.breadcrumbs,
    ...model.sections.flatMap((section) => [
      ...(section.links ?? []),
      ...(section.table?.rows ?? []).flat().filter((cell) => typeof cell !== 'string'),
    ]),
  ].flatMap((cell) => (cell.href ? [cell.href] : []));
}

describe.each(['en-US', ...PREFIXED_LANGUAGES])('every page model in %s', (language) => {
  const ctx = testContext(language, language === 'en-US' ? null : language);
  const models = Object.entries(allModels(ctx));

  it.each(models)('%s has no missing translation and no unfilled placeholder', (_name, model) => {
    for (const text of texts(model)) {
      expect(text).not.toMatch(/\{\{|\}\}/);
      expect(text).not.toMatch(/^(pages|navbar|footer|insights|server-info|server-list)\.[a-z-]+/);
      expect(text).not.toMatch(/undefined|NaN/);
    }
  });

  it.each(models)('%s only links to pages that exist', (_name, model) => {
    for (const href of links(model)) {
      expect(parsePath(href).route, href).not.toBeNull();
    }
  });

  it.each(models)('%s has a title and a description of a useful length', (_name, model) => {
    expect(model.title.length).toBeGreaterThan(3);
    expect(model.description.length).toBeGreaterThan(10);
    expect(model.description.length).toBeLessThanOrEqual(300);
  });
});

describe('server page', () => {
  it('describes the server in sentences', () => {
    expect(serverSentences(en, server, insights)).toEqual([
      '[KR] Site-19 & Friends is a modded SCP: Secret Laboratory server hosted in South Korea that runs game version 14.2.9. Friendly fire is on.',
      'It first appeared in the server list on October 24, 2023. Its record is 107 players at once, set on May 15, 2024.',
      'Over the last 30 days its daily peak averaged 24.5 players. That ranks #12 of the 1,100 servers online worldwide and #2 of 22 in South Korea. It was online 99% of that time.',
      'It is usually busiest on Saturday around 12:00 (UTC), with about 28 players.',
    ]);
  });

  it('says only what it knows when the insights are missing', () => {
    expect(serverSentences(en, { ...server, modded: false, friendlyFire: false, whitelist: true }, null)).toEqual([
      '[KR] Site-19 & Friends is an unmodded SCP: Secret Laboratory server hosted in South Korea that runs game version 14.2.9. Friendly fire is off. Only whitelisted players can join.',
    ]);
  });

  it('says when an offline server was last online', () => {
    const offline = { ...server, online: false, lastSeen: '2026-10-01T12:00:00Z' };

    expect(serverSentences(en, offline, null).at(-1)).toBe('The server is offline now. It was last online on October 1, 2026.');
    expect(serverSentences(en, { ...offline, lastSeen: null }, null).at(-1)).toBe('The server is offline now.');
  });

  it('writes the same in Korean', () => {
    expect(serverSentences(ko, server, insights)[0]).toBe(
      '이 서버([KR] Site-19 & Friends)는 대한민국에서 호스팅되는 SCP: Secret Laboratory 모드 서버이며, 게임 버전은 14.2.9입니다. 아군 공격이 켜져 있습니다.',
    );
  });

  it('titles the page with the plain first line of the name', () => {
    const model = serverModel(en, server, insights);

    expect(model.title).toBe('[KR] Site-19 & Friends · SCP: Secret Laboratory Server List');
    expect(model.heading).toBe('[KR] Site-19 & Friends');
    expect(model.description).toContain('18/30 players online on version 14.2.9');
    expect(model.breadcrumbs[1]).toEqual({ text: 'South Korea', href: '/countries/kr' });
  });

  it('falls back to the server number when the name is empty', () => {
    expect(serverModel(en, { ...server, info: '' }, null).heading).toBe('#7');
  });

  it('lists similar servers and the rank tiles when the API sends a standing', () => {
    const model = serverModel(en, server, insights);

    expect(model.tiles?.map((tile) => tile.value)).toEqual(['24.5', '#12', '#2', '99%']);
    expect(model.sections.at(-1)?.links).toEqual([{ text: 'Neighbour server', href: '/servers/8' }]);
  });

  it('keeps a server that closed long ago out of the index', () => {
    expect(serverModel(en, { ...server, online: false, ip: null }, null).noindex).toBe(true);
    expect(serverModel(en, { ...server, online: false }, null).noindex).toBe(false);
    expect(serverModel(en, server, null).noindex).toBe(false);
  });
});

describe('country pages', () => {
  it('ranks the countries in a table', () => {
    const model = countriesModel(en, countries);

    expect(model.intro[0]).toBe('SCP: Secret Laboratory servers are online in 4 countries right now. Russia, China and United States draw the most players.');
    expect(model.sections[0].table?.rows[0].map(cellText)).toEqual(['1', 'Russia', '270', '800', '1,500.5', '+4.2%', '35.0%', '4,502']);
    expect(model.sections[0].table?.rows[0][1]).toMatchObject({ href: '/countries/ru', flag: 'RU' });
  });

  it.each([
    [4.2, 'up 4.2% from the 30 days before'],
    [-3.1, 'down 3.1% from the 30 days before'],
    [0, 'the same as in the 30 days before'],
  ])('words a change of %s%% as "%s"', (change, phrase) => {
    const model = countryModel(en, { ...country, standing: { ...country.standing, changePercent30d: change } });

    expect(model.intro[1]).toContain(phrase);
  });

  it('leaves the comparison out when there is nothing to compare with', () => {
    const model = countryModel(en, country);

    expect(model.intro[1]).toBe('Over the last 30 days the daily peak averaged 120.4 players. That is 20.0% of all countries combined and ranks #4 of 4.');
    expect(model.tiles?.[2].note).toBe('— vs the 30 days before');
  });

  it('names the busiest hour and lists the top servers', () => {
    const model = countryModel(en, country);

    expect(model.intro).toContain('Servers here are usually busiest on Sunday around 11:00 (UTC).');
    expect(model.sections[0].table?.rows.map((row) => cellText(row[1]))).toEqual(['[KR] Site-19', 'Neighbour']);
  });

  it('uses the singular for a single server', () => {
    const model = countryModel(en, { ...country, standing: { ...country.standing, onlineServers: 1 } });

    expect(model.intro[0]).toBe('South Korea has 1 SCP: Secret Laboratory server online right now, with 500 players on it.');
  });
});

describe('changes', () => {
  it('color a rise and a fall, and leave no change and no comparison plain', () => {
    const rows = countriesModel(en, countries).sections[0].table?.rows ?? [];

    expect(rows.map((row) => row[5])).toEqual([
      { text: '+4.2%', tone: 'up' },
      { text: '−3.1%', tone: 'down' },
      { text: '0.0%', tone: undefined },
      { text: '—', tone: undefined },
    ]);
  });

  it('color the tile that states one', () => {
    const version = versionModel(en, versionDetail).tiles?.find((tile) => tile.value === '−16.9%');
    const month = reportModel(en, report).tiles?.find((tile) => tile.note === '+4.2% vs September 2026');

    expect(version?.valueTone).toBe('down');
    expect(month?.noteTone).toBe('up');
    expect(countryModel(en, country).tiles?.every((tile) => tile.noteTone === undefined)).toBe(true);
  });
});

describe('rankings page', () => {
  it('has a board for each ranking that has servers', () => {
    const model = rankingsModel(en, { ...rankings, rising: [] });

    expect(model.sections.map((section) => section.heading)).toEqual(['Most popular', 'Newcomers', 'Longest running']);
    expect(model.sections.map((section) => section.id)).toEqual(['popular', 'newcomers', 'veterans']);
    expect(model.sectionTabs).toBe(true);
    expect(model.intro[1]).toBe('Dream <Mirror> #1 leads with an average daily peak of 58.3 players.');
  });

  it('does not date a server that is older than the records', () => {
    const veterans = rankingsModel(en, rankings).sections.at(-1);

    expect(veterans?.table?.rows[0].map(cellText)).toContain('Before Sept 2020');
  });
});

describe('version pages', () => {
  it('lists every version with how long half of the servers took', () => {
    const rows = versionsModel(en, versions).sections[0].table?.rows.map((row) => row.map(cellText)) ?? [];

    expect(rows[0]).toEqual(['14.2.9', 'November 1, 2026', 'Minor', '5,590', '4,643', '−16.9%', '2 days', '972']);
    expect(rows[1][6]).toBe('Same day');
    expect(rows[2]).toEqual(['14.0.0', 'February 1, 2025', 'Major', '—', '—', '—', '—', '0']);
  });

  it('tells how a version was taken up', () => {
    expect(versionModel(en, versionDetail).intro).toEqual([
      'Version 14.2.9 of SCP: Secret Laboratory, a minor update, first ran on public servers on November 1, 2026.',
      'In the 14 days after it arrived, the median daily peak was 4,643 players, down 16.9% from 5,590 in the 14 days before. Seasons and holidays move these numbers too, so this is not the effect of the update alone.',
      'It took 2 days for half of the active servers to run it. At its height on November 8, 2026, 980 servers ran it, 87.3% of the servers active that day.',
      '972 servers online now run 14.2.9.',
    ]);
  });

  it('copes with a version that has no comparison, never spread and is gone', () => {
    const model = versionModel(en, { ...versionDetail, summary: versions.versions[2], adoption: [] });

    expect(model.intro).toEqual([
      'Version 14.0.0 of SCP: Secret Laboratory, a major update, first ran on public servers on February 1, 2025.',
      'It never ran on half of the active servers. At its height on November 8, 2026, 980 servers ran it, 87.3% of the servers active that day.',
      'No server online now runs it. It was last seen on August 1, 2025.',
    ]);
    expect(model.description).not.toContain('went from');
    expect(model.sections.map((section) => section.heading)).toEqual(['Other versions']);
  });

  it('shows the chosen days of the first two months in the adoption table', () => {
    const adoption = versionModel(en, versionDetail).sections[0];

    // Day 4 is in the data's gap, and November 5 is day 4, which the table skips.
    expect(adoption.table?.rows.map((row) => cellText(row[0]))).toEqual(['0', '1', '2']);
  });
});

describe('records page', () => {
  it('finds the peak, the mean and the number of days of each year', () => {
    expect(yearlyRecords(history.daily)).toEqual([
      { year: 2026, peak: 3701, peakDate: '2026-11-09', averageDailyPeak: 3701, days: 1 },
      // Two days share the peak. The earlier one keeps the record.
      { year: 2024, peak: 9592, peakDate: '2024-01-06', averageDailyPeak: 9592, days: 2 },
      { year: 2023, peak: 11565, peakDate: '2023-10-29', averageDailyPeak: 10282.5, days: 2 },
    ]);
  });

  it('opens with the all-time record and what the numbers count', () => {
    const model = recordsModel(en, history, countries);

    expect(model.intro[0]).toBe('The most players ever online at once on public SCP: Secret Laboratory servers is 11,565, recorded on October 29, 2023, around the release of version 13.3.0.');
    expect(model.intro[2]).toBe('The latest full day, November 9, 2026, peaked at 3,701 players, which ranks #1,831 of 2,194 days on record.');
  });

  it('orders the update table by the size of the jump and skips updates without a comparison', () => {
    const jumps = recordsModel(en, history, null).sections.find((section) => section.heading === 'Biggest jumps after an update');

    expect(jumps?.table?.rows.map((row) => cellText(row[0]))).toEqual(['14.2.8', '14.2.9']);
  });

  it('stands without the country list', () => {
    const headings = recordsModel(en, history, null).sections.map((section) => section.heading);

    expect(headings).not.toContain('Country records');
  });
});

describe('report pages', () => {
  it('names a month and a year in each language', () => {
    expect(periodLabel(en, '2026-10')).toBe('October 2026');
    expect(periodLabel(en, '2025')).toBe('2025');
    expect(periodLabel(ko, '2026-10')).toBe('2026년 10월');
    expect(periodLabel(ko, '2025')).toBe('2025년');
  });

  it('sums a month up in sentences', () => {
    expect(reportModel(en, report).intro).toEqual([
      'In October 2026, public SCP: Secret Laboratory servers peaked at 5,590 players on October 18, 2026. The daily peak averaged 4,480.5 players, and the quietest day was October 7, 2026 with 3,900.',
      'The average daily peak was up 4.2% from September 2026. Against October 2025 it was down 13.8%.',
      '1,650 servers were online at some point, and 240 of them appeared for the first time.',
      'Russia hosted the most players with 33.4% of the total, followed by China and United States.',
      'Version 14.2.8 arrived on October 17, 2026.',
    ]);
  });

  it('counts the updates instead of listing them when there are many', () => {
    const busy = { ...report, releases: [history.releases[2], history.releases[0], history.releases[1]] };

    expect(reportModel(en, busy).intro.at(-1)).toBe('3 game versions arrived in the period, from 14.0.0 to 14.2.9.');
    expect(reportModel(en, busy).sections.map((section) => section.heading)).toContain('Updates');
  });

  it('links a server only when it still has a page', () => {
    const servers = reportModel(en, report).sections.find((section) => section.heading === 'Top servers');

    expect(servers?.table?.rows[0][1]).toEqual({ text: 'Dream <Mirror> #1', href: '/servers/99728' });
    expect(servers?.table?.rows[1][1]).toEqual({ text: '#4' });
  });

  it('breaks a year down by month and links each month', () => {
    const model = reportModel(en, yearReport);
    const months = model.sections.find((section) => section.heading === 'Month by month');

    expect(model.heading).toBe('2025 report');
    expect(months?.table?.rows[0]).toEqual([{ text: 'January 2025', href: '/reports/2025-01' }, '8,200', '6,100.4']);
  });
});

describe('written pages', () => {
  it.each(['about', 'methodology', 'funding', 'privacy', 'contact', 'api'] as const)('%s exists in English and Korean with the same structure', (page) => {
    const english = docModel(en, page);
    const korean = docModel(ko, page);

    expect(english?.languages).toEqual(['en-US', 'ko-KR']);
    expect(korean?.heading).not.toBe(english?.heading === 'API' ? '' : english?.heading);
    expect(korean?.blocks?.map((block) => block.type)).toEqual(english?.blocks?.map((block) => block.type));
  });

  it('shows the English text in a language the page is not written in', () => {
    const russian = testContext('ru-RU');

    expect(docModel(russian, 'privacy')?.heading).toBe('Privacy policy');
  });

  it('is not a written page for other addresses', () => {
    expect(docModel(en, 'stats')).toBeNull();
  });
});

describe('home page and hubs', () => {
  it('links the popular servers and the countries from the home page when the data is there', () => {
    const headings = listModel(en, { rankings, countries }).sections.map((section) => section.heading);

    expect(headings).toEqual(['Explore', 'Most popular', 'Countries']);
    expect(listModel(en).sections.map((section) => section.heading)).toEqual(['Explore']);
  });

  it('lists every section of the site once in the footer links', () => {
    const { browse, statistics, site } = siteLinks(en);
    const hrefs = [...browse, ...statistics, ...site].map((link) => link.href);

    expect(new Set(hrefs).size).toBe(hrefs.length);
    for (const href of hrefs) expect(parsePath(href ?? '').route).not.toBeNull();
  });
});

describe('the reader\'s clock', () => {
  const seoul = testContext('en-US', null, 540);
  const koreanInSeoul = testContext('ko-KR', 'ko-KR', 540);

  it('moves the busiest hour onto it', () => {
    // Saturday 12:00 UTC for the server, Sunday 11:00 UTC for the country.
    expect(serverSentences(seoul, server, insights).at(-1))
      .toBe('It is usually busiest on Saturday around 21:00 (UTC+9), with about 28 players.');
    expect(countryModel(seoul, country).intro).toContain('Servers here are usually busiest on Sunday around 20:00 (UTC+9).');
    expect(serverSentences(koreanInSeoul, server, insights).at(-1)).toContain('토요일 21시(UTC+9) 무렵');
  });

  it('says when a day of the data starts on it', () => {
    expect(rankingsModel(seoul, rankings).intro[0]).toContain('Days start at 09:00 (UTC+9).');
    expect(reportsModel(seoul, reports).intro[0]).toContain('Days start at 09:00 (UTC+9).');
    expect(reportsModel(en, reports).intro[0]).toContain('Days start at 00:00 (UTC).');
    expect(reportsModel(koreanInSeoul, reports).intro[0]).toContain('하루는 09:00(UTC+9)에 시작합니다.');
    expect(countryModel(seoul, country).sections[0].note).toContain('Days start at 09:00 (UTC+9).');
  });

  it('is filled into the written pages', () => {
    expect(JSON.stringify(docModel(seoul, 'methodology')?.blocks)).toContain('which is 09:00 in your time zone (UTC+9)');
    expect(JSON.stringify(docModel(koreanInSeoul, 'methodology')?.blocks)).toContain('시간대(UTC+9)로는 09:00입니다');
    for (const page of ['about', 'methodology', 'funding', 'privacy', 'contact', 'api'] as const) {
      expect(JSON.stringify(docModel(seoul, page)?.blocks)).not.toMatch(/\{\{(dayStart|zone)\}\}/);
    }
  });

  it('never leaves a placeholder or the word UTC alone in a page', () => {
    for (const ctx of [seoul, koreanInSeoul]) {
      for (const [name, model] of Object.entries(allModels(ctx))) {
        const text = JSON.stringify([model.intro, model.sections, model.tiles]);
        expect(text, name).not.toMatch(/\{\{/);
        expect(text.replace(/UTC[+-][\d:]+/g, ''), name).not.toContain('UTC');
      }
    }
  });
});

describe('page without data', () => {
  it.each([
    ['/servers/7', 'Server info'],
    ['/countries/kr', 'SCP: SL servers in South Korea'],
    ['/versions/14.2.9', 'SCP: SL 14.2.9'],
    ['/reports/2026-10', 'October 2026 report'],
    ['/rankings', 'Server rankings'],
  ])('%s still has its heading', (path, heading) => {
    const { route } = parsePath(path);

    expect(route && fallbackModel(en, route)?.heading).toBe(heading);
  });

  it('is not needed for pages that have no data', () => {
    const { route } = parsePath('/about');

    expect(route && fallbackModel(en, route)).toBeNull();
  });
});

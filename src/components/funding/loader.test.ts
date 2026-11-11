import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getAdsStatus, isLive, requestAd, resetAdsForTest, startAds } from './loader';

const CHANGE_EVENT = 'silktide:consentchange';
const SCRIPT = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9284546494175734';

// The jsdom of this test file. Vitest shares it as a global.
declare const jsdom: { reconfigure(options: { url: string }): void };

function scripts() {
  return Array.from(document.querySelectorAll('script')).filter((script) => script.src === SCRIPT);
}

/** Answers the cookie banner the way it does itself: the keys first, then the event. */
function answerBanner(personalised?: boolean) {
  localStorage.setItem('silktideCookieBanner_InitialChoice', '1');
  if (personalised !== undefined) localStorage.setItem('silktideCookieChoice_advertising', String(personalised));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Lets the loader read the answer: it waits a moment after the event. */
const settle = () => new Promise<void>((resolve) => { queueMicrotask(resolve); });

beforeEach(() => {
  jsdom.reconfigure({ url: 'https://scplist.kr/' });
  localStorage.clear();
  resetAdsForTest();
  for (const script of scripts()) script.remove();
  delete window.adsbygoogle;
});

afterEach(() => {
  vi.restoreAllMocks();
  jsdom.reconfigure({ url: 'http://localhost:3000/' });
});

describe('the AdSense script', () => {
  it('is not loaded outside the live site', () => {
    jsdom.reconfigure({ url: 'https://add-ads.sl-servers-frontend.pages.dev/' });
    answerBanner(true);

    startAds();

    expect(isLive()).toBe(false);
    expect(getAdsStatus()).toBe('idle');
    expect(scripts()).toHaveLength(0);
  });

  it('waits for the answer to the cookie banner', async () => {
    startAds();

    expect(getAdsStatus()).toBe('waiting');
    expect(scripts()).toHaveLength(0);

    answerBanner(true);
    await settle();

    expect(getAdsStatus()).toBe('loading');
    expect(scripts()).toHaveLength(1);
    expect(window.adsbygoogle?.requestNonPersonalizedAds).toBe(0);
  });

  it('asks for ads that are not personalised after a no', () => {
    answerBanner(false);

    startAds();

    expect(scripts()).toHaveLength(1);
    expect(window.adsbygoogle?.requestNonPersonalizedAds).toBe(1);
  });

  it('treats a visitor who answered before the banner asked about ads as a no', () => {
    answerBanner();

    startAds();

    expect(scripts()).toHaveLength(1);
    expect(window.adsbygoogle?.requestNonPersonalizedAds).toBe(1);
  });

  it('follows a change of mind for the ads asked for after it', async () => {
    answerBanner(true);
    startAds();
    expect(window.adsbygoogle?.requestNonPersonalizedAds).toBe(0);

    answerBanner(false);
    await settle();
    expect(window.adsbygoogle?.requestNonPersonalizedAds).toBe(1);

    answerBanner(true);
    await settle();
    expect(window.adsbygoogle?.requestNonPersonalizedAds).toBe(0);
  });

  it('is loaded once however many slots ask', () => {
    answerBanner(true);

    startAds();
    startAds();

    expect(scripts()).toHaveLength(1);
  });

  it('is ready once it has loaded, and blocked when it does not load', () => {
    answerBanner(true);
    startAds();
    scripts()[0].dispatchEvent(new Event('load'));
    expect(getAdsStatus()).toBe('ready');

    resetAdsForTest();
    startAds();
    scripts()[1].dispatchEvent(new Event('error'));
    expect(getAdsStatus()).toBe('blocked');
  });

  it('queues a request until the script takes the queue over', () => {
    requestAd();

    expect(window.adsbygoogle).toEqual([{}]);
  });

  it('keeps the page going when the script refuses a request', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    window.adsbygoogle = { push: () => { throw new Error('No slot size for availableWidth=0'); } };

    expect(() => requestAd()).not.toThrow();
    expect(warn).toHaveBeenCalledOnce();
  });
});

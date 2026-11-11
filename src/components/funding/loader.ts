// Google AdSense: when its script loads and how ads follow the visitor's cookie choice.
//
// The files of this folder are named without "ad" on purpose. The build names a script after
// its file, and ad blockers refuse scripts whose address looks like an ad. A refused script
// would take the whole page down with it, not just the ad.
import * as Sentry from '@sentry/react';
import { hasInitialChoice, readConsent, subscribe } from '../consent/silktideClient';

export const AD_CLIENT = 'ca-pub-9284546494175734';

// Ads are only requested on the site itself. A preview or a local server is not a site AdSense
// knows, so a slot draws a box of the ad's size there instead.
const LIVE_HOST = 'scplist.kr';

/**
 * idle: no slot has asked yet. waiting: the cookie banner is still open.
 * loading and ready: the script is on its way or here. blocked: it did not load.
 */
export type AdsStatus = 'idle' | 'waiting' | 'loading' | 'ready' | 'blocked';

let status: AdsStatus = 'idle';
const listeners = new Set<() => void>();

function setStatus(next: AdsStatus) {
  status = next;
  for (const listener of listeners) listener();
}

export function isLive() {
  return window.location.hostname === LIVE_HOST;
}

export function getAdsStatus() {
  return status;
}

export function subscribeAds(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function queue() {
  // The queue is a plain array until the script replaces it with its own object.
  if (!window.adsbygoogle) window.adsbygoogle = [];
  return window.adsbygoogle;
}

// A visitor who answered the banner before it asked about ads has no stored answer. They are
// not asked again and get ads that are not personalised, the same as after a "no".
function choiceMade() {
  return readConsent('advertising').status !== 'unknown' || hasInitialChoice();
}

/** Ads are personalised only after a "yes". The setting applies to every request made after it. */
function applyChoice() {
  queue().requestNonPersonalizedAds = readConsent('advertising').granted ? 0 : 1;
}

// Google moves the frames of an ad between hosts without notice. A host that frame-src in
// public/_headers does not allow leaves the ad blank and shows nowhere else, so it is reported.
// Sentry only sends it for a visitor who allowed analytics.
const reportedHosts = new Set<string>();

function reportBlockedFrame(event: SecurityPolicyViolationEvent) {
  if (event.effectiveDirective !== 'frame-src') return;
  let host = event.blockedURI;
  try {
    host = new URL(event.blockedURI).host;
  } catch {
    // Not an address. Report it as it came.
  }
  // Other frames are refused on purpose, such as a link followed inside the Pastebin embed.
  if (!/google|doubleclick/.test(host) || reportedHosts.has(host)) return;
  reportedHosts.add(host);
  Sentry.captureMessage(`frame-src refused an ad frame from ${host}`, 'warning');
}

function loadScript() {
  applyChoice();
  setStatus('loading');
  document.addEventListener('securitypolicyviolation', reportBlockedFrame);

  const script = document.createElement('script');
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT}`;
  script.onload = () => setStatus('ready');
  script.onerror = () => setStatus('blocked');
  document.head.appendChild(script);
}

function onConsentChange() {
  // The banner stores its answers one by one and reports each. Waiting a moment reads them all.
  queueMicrotask(() => {
    if (status === 'waiting') {
      if (choiceMade()) loadScript();
    } else if (status === 'loading' || status === 'ready') {
      applyChoice();
    }
  });
}

/**
 * Loads the AdSense script, once. The first slot that has an ad to show calls this, so a page
 * without ads never loads it. It waits until the visitor has answered the cookie banner.
 */
export function startAds() {
  if (status !== 'idle' || !isLive()) return;
  try {
    subscribe(onConsentChange);
    if (choiceMade()) loadScript();
    else setStatus('waiting');
  } catch (e) {
    // Ads must never be the reason the app does not start.
    // eslint-disable-next-line no-console
    console.warn('[ads] failed to start:', e);
    setStatus('blocked');
  }
}

/** Asks for an ad for the next `ins` element on the page that has none. */
export function requestAd() {
  try {
    queue().push({});
  } catch (e) {
    // The script reports a slot it cannot fill by throwing. The slot stays empty.
    // eslint-disable-next-line no-console
    console.warn('[ads] request failed:', e);
  }
}

// Some ad blockers let the script load, or put an empty one in its place, and swallow every
// request. Once a request has gone without an answer, the slots after it start closed.
let unanswered = false;

export function adsUnanswered() {
  return unanswered;
}

/** Notes whether the last ad asked for was answered, with an ad or with the news that there is none. */
export function noteAdAnswer(answered: boolean) {
  unanswered = !answered;
}

/** For tests: forgets that the script was ever asked for. */
export function resetAdsForTest() {
  status = 'idle';
  unanswered = false;
  listeners.clear();
}

# GTM + Microsoft Clarity (Consent-Gated) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Google Tag Manager (`GTM-KC5HBS5T`) and Microsoft Clarity (`whmgvzi2gl`) to the SCP:SL server browser frontend in a fully GDPR-compliant way — no third-party network requests until the user grants `analytics` consent through the existing Silktide banner.

**Architecture:** Two new side-effect modules (`gtmGate.js`, `clarityGate.js`) mirror the existing `sentryGate.js` lock-once pattern. A small React component (`AnalyticsRevokeNotice.jsx`) shows a sonner toast offering Reload when consent is revoked mid-session, since the loaded scripts cannot be cleanly torn down. A helper (`analyticsState.js`) aggregates the three gates' `isInitialized()` exports for the notice.

**Tech Stack:** React 19, Vite, Vitest + jsdom, react-i18next, sonner, Silktide Consent Manager.

**Spec:** `docs/superpowers/specs/2026-04-26-gtm-clarity-consent-gated-design.md`

---

## File Structure

| Path | Action | Responsibility |
|---|---|---|
| `src/components/consent/sentryGate.js` | Modify | Add `isInitialized()` export |
| `src/components/consent/sentryGate.test.js` | Modify | Add a test for `isInitialized()` |
| `src/components/consent/gtmGate.js` | Create | Inject GTM script when analytics consent granted |
| `src/components/consent/gtmGate.test.js` | Create | Verify gate behavior (TDD) |
| `src/components/consent/clarityGate.js` | Create | Inject Clarity script when analytics consent granted |
| `src/components/consent/clarityGate.test.js` | Create | Verify gate behavior (TDD) |
| `src/components/consent/analyticsState.js` | Create | Aggregate `isInitialized()` of all 3 gates |
| `src/components/consent/AnalyticsRevokeNotice.jsx` | Create | Toast prompt to reload after revoke |
| `src/components/consent/AnalyticsRevokeNotice.test.jsx` | Create | Verify toast trigger logic (TDD) |
| `src/main.jsx` | Modify | Import gtmGate, clarityGate; mount notice |
| `index.html` | Modify | Generalize the `analytics` description copy |
| `src/i18n/locale/*.json` (27 files) | Modify | Add `consent.revoke.{title,description,reload}` keys |

---

## Task 1: Add `isInitialized()` export to `sentryGate.js`

**Files:**
- Modify: `src/components/consent/sentryGate.js`
- Modify: `src/components/consent/sentryGate.test.js`

- [ ] **Step 1: Write the failing test**

Append this test inside the existing `describe('sentryGate', () => { ... })` block in `src/components/consent/sentryGate.test.js`:

```js
  it('exposes isInitialized() that flips to true after first init', async () => {
    const mod = await import('./sentryGate');
    expect(mod.isInitialized()).toBe(false);
    setConsent(true);
    expect(mod.isInitialized()).toBe(true);
    setConsent(false); // revoke must not flip back
    expect(mod.isInitialized()).toBe(true);
  });
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test src/components/consent/sentryGate.test.js`
Expected: the new test fails because `isInitialized` is not exported.

- [ ] **Step 3: Add the export to the implementation**

In `src/components/consent/sentryGate.js`, add a single export immediately above the `function initSentry()` line:

```js
export function isInitialized() {
  return initialized;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test src/components/consent/sentryGate.test.js`
Expected: all sentryGate tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/consent/sentryGate.js src/components/consent/sentryGate.test.js
git commit -m "feat(consent): export isInitialized() from sentryGate"
```

---

## Task 2: Create `gtmGate.js` with TDD

**Files:**
- Create: `src/components/consent/gtmGate.test.js`
- Create: `src/components/consent/gtmGate.js`

- [ ] **Step 1: Write the failing test file**

Create `src/components/consent/gtmGate.test.js` with this content:

```js
import { describe, it, expect, beforeEach, vi } from 'vitest';

const KEY = 'silktideCookieChoice_analytics';
const CHANGE_EVENT = 'silktide:consentchange';
const GTM_SRC_PREFIX = 'https://www.googletagmanager.com/gtm.js?id=GTM-KC5HBS5T';

function setConsent(value) {
  localStorage.setItem(KEY, value ? 'true' : 'false');
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function gtmScripts() {
  return Array.from(document.querySelectorAll('script')).filter(
    (s) => s.src && s.src.startsWith(GTM_SRC_PREFIX)
  );
}

// Track listeners added to window so we can remove stale ones between tests.
// vi.resetModules() re-imports the module but cannot remove window listeners
// registered by a previous import, leading to duplicate evaluate() calls.
const trackedHandlers = { storage: new Set(), [CHANGE_EVENT]: new Set() };
const origAdd = window.addEventListener.bind(window);
window.addEventListener = function (type, handler, ...rest) {
  if (trackedHandlers[type]) trackedHandlers[type].add(handler);
  return origAdd(type, handler, ...rest);
};

describe('gtmGate', () => {
  beforeEach(() => {
    for (const [type, set] of Object.entries(trackedHandlers)) {
      for (const h of set) window.removeEventListener(type, h);
      set.clear();
    }
    for (const s of gtmScripts()) s.remove();
    delete window.dataLayer;
    localStorage.clear();
    vi.resetModules();
  });

  it('does not inject the GTM script when consent is unknown', async () => {
    await import('./gtmGate');
    expect(gtmScripts()).toHaveLength(0);
    expect(window.dataLayer).toBeUndefined();
  });

  it('does not inject the GTM script when consent is denied', async () => {
    localStorage.setItem(KEY, 'false');
    await import('./gtmGate');
    expect(gtmScripts()).toHaveLength(0);
  });

  it('injects the GTM script exactly once when consent is granted at import', async () => {
    localStorage.setItem(KEY, 'true');
    const mod = await import('./gtmGate');
    expect(gtmScripts()).toHaveLength(1);
    expect(window.dataLayer).toEqual([
      expect.objectContaining({ 'gtm.start': expect.any(Number), event: 'gtm.js' }),
    ]);
    expect(mod.isInitialized()).toBe(true);
  });

  it('injects the GTM script when consent transitions denied -> granted', async () => {
    localStorage.setItem(KEY, 'false');
    await import('./gtmGate');
    expect(gtmScripts()).toHaveLength(0);
    setConsent(true);
    expect(gtmScripts()).toHaveLength(1);
  });

  it('does not inject twice when consent toggles granted -> denied -> granted (lock-once)', async () => {
    localStorage.setItem(KEY, 'true');
    await import('./gtmGate');
    expect(gtmScripts()).toHaveLength(1);
    setConsent(false);
    setConsent(true);
    expect(gtmScripts()).toHaveLength(1);
  });

  it('uses async script loading so it does not block render', async () => {
    localStorage.setItem(KEY, 'true');
    await import('./gtmGate');
    expect(gtmScripts()[0].async).toBe(true);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm test src/components/consent/gtmGate.test.js`
Expected: all tests fail because `./gtmGate` does not exist.

- [ ] **Step 3: Create the implementation**

Create `src/components/consent/gtmGate.js` with this content:

```js
import { readConsent, subscribe } from './silktideClient';

const CONTAINER_ID = 'GTM-KC5HBS5T';
let initialized = false;

export function isInitialized() {
  return initialized;
}

function initGtm() {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${CONTAINER_ID}`;
  document.head.appendChild(script);

  initialized = true;
}

function evaluate() {
  if (!initialized && readConsent('analytics').granted) {
    initGtm();
  }
}

try {
  evaluate();
  subscribe(evaluate);
} catch (e) {
  // Observability gate failed; the app must still boot.
  // eslint-disable-next-line no-console
  console.warn('[gtmGate] failed to initialise consent gate:', e);
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm test src/components/consent/gtmGate.test.js`
Expected: all 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/consent/gtmGate.js src/components/consent/gtmGate.test.js
git commit -m "feat(consent): add GTM gate that injects only with analytics consent"
```

---

## Task 3: Create `clarityGate.js` with TDD

**Files:**
- Create: `src/components/consent/clarityGate.test.js`
- Create: `src/components/consent/clarityGate.js`

- [ ] **Step 1: Write the failing test file**

Create `src/components/consent/clarityGate.test.js` with this content:

```js
import { describe, it, expect, beforeEach, vi } from 'vitest';

const KEY = 'silktideCookieChoice_analytics';
const CHANGE_EVENT = 'silktide:consentchange';
const CLARITY_SRC = 'https://www.clarity.ms/tag/whmgvzi2gl';

function setConsent(value) {
  localStorage.setItem(KEY, value ? 'true' : 'false');
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function clarityScripts() {
  return Array.from(document.querySelectorAll('script')).filter(
    (s) => s.src === CLARITY_SRC
  );
}

const trackedHandlers = { storage: new Set(), [CHANGE_EVENT]: new Set() };
const origAdd = window.addEventListener.bind(window);
window.addEventListener = function (type, handler, ...rest) {
  if (trackedHandlers[type]) trackedHandlers[type].add(handler);
  return origAdd(type, handler, ...rest);
};

describe('clarityGate', () => {
  beforeEach(() => {
    for (const [type, set] of Object.entries(trackedHandlers)) {
      for (const h of set) window.removeEventListener(type, h);
      set.clear();
    }
    for (const s of clarityScripts()) s.remove();
    delete window.clarity;
    localStorage.clear();
    vi.resetModules();
  });

  it('does not inject the Clarity script when consent is unknown', async () => {
    await import('./clarityGate');
    expect(clarityScripts()).toHaveLength(0);
    expect(window.clarity).toBeUndefined();
  });

  it('does not inject the Clarity script when consent is denied', async () => {
    localStorage.setItem(KEY, 'false');
    await import('./clarityGate');
    expect(clarityScripts()).toHaveLength(0);
  });

  it('injects the Clarity script exactly once when consent is granted at import', async () => {
    localStorage.setItem(KEY, 'true');
    const mod = await import('./clarityGate');
    expect(clarityScripts()).toHaveLength(1);
    expect(typeof window.clarity).toBe('function');
    expect(Array.isArray(window.clarity.q)).toBe(true);
    expect(mod.isInitialized()).toBe(true);
  });

  it('queues calls made before the remote script finishes loading', async () => {
    localStorage.setItem(KEY, 'true');
    await import('./clarityGate');
    window.clarity('event', 'manual-test');
    expect(window.clarity.q).toHaveLength(1);
    expect(Array.from(window.clarity.q[0])).toEqual(['event', 'manual-test']);
  });

  it('injects the Clarity script when consent transitions denied -> granted', async () => {
    localStorage.setItem(KEY, 'false');
    await import('./clarityGate');
    expect(clarityScripts()).toHaveLength(0);
    setConsent(true);
    expect(clarityScripts()).toHaveLength(1);
  });

  it('does not inject twice when consent toggles granted -> denied -> granted (lock-once)', async () => {
    localStorage.setItem(KEY, 'true');
    await import('./clarityGate');
    expect(clarityScripts()).toHaveLength(1);
    setConsent(false);
    setConsent(true);
    expect(clarityScripts()).toHaveLength(1);
  });

  it('uses async script loading so it does not block render', async () => {
    localStorage.setItem(KEY, 'true');
    await import('./clarityGate');
    expect(clarityScripts()[0].async).toBe(true);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm test src/components/consent/clarityGate.test.js`
Expected: all tests fail because `./clarityGate` does not exist.

- [ ] **Step 3: Create the implementation**

Create `src/components/consent/clarityGate.js` with this content:

```js
import { readConsent, subscribe } from './silktideClient';

const PROJECT_ID = 'whmgvzi2gl';
let initialized = false;

export function isInitialized() {
  return initialized;
}

function initClarity() {
  // Equivalent to the official Clarity bootstrap snippet, inlined so the
  // bundler/linter can see it. The queue function buffers calls made before
  // the remote tag.js finishes loading. `q` is also seeded eagerly so it
  // exists as soon as the gate runs (the queue function would otherwise only
  // create it on the first invocation).
  window.clarity = window.clarity || function () {
    (window.clarity.q = window.clarity.q || []).push(arguments);
  };
  window.clarity.q = window.clarity.q || [];

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${PROJECT_ID}`;
  const first = document.getElementsByTagName('script')[0];
  if (first && first.parentNode) {
    first.parentNode.insertBefore(script, first);
  } else {
    document.head.appendChild(script);
  }

  initialized = true;
}

function evaluate() {
  if (!initialized && readConsent('analytics').granted) {
    initClarity();
  }
}

try {
  evaluate();
  subscribe(evaluate);
} catch (e) {
  // Observability gate failed; the app must still boot.
  // eslint-disable-next-line no-console
  console.warn('[clarityGate] failed to initialise consent gate:', e);
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm test src/components/consent/clarityGate.test.js`
Expected: all 7 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/consent/clarityGate.js src/components/consent/clarityGate.test.js
git commit -m "feat(consent): add Microsoft Clarity gate behind analytics consent"
```

---

## Task 4: Create `analyticsState.js` aggregator

This file is a 5-line aggregator with no logic of its own — the unit tests for the three gates already verify their `isInitialized()` behavior. Skipping a dedicated test file here is intentional (YAGNI); `AnalyticsRevokeNotice.test.jsx` will exercise this helper indirectly.

**Files:**
- Create: `src/components/consent/analyticsState.js`

- [ ] **Step 1: Create the file**

Create `src/components/consent/analyticsState.js` with this content:

```js
import { isInitialized as gtmInit } from './gtmGate';
import { isInitialized as clarityInit } from './clarityGate';
import { isInitialized as sentryInit } from './sentryGate';

export function wereAnyAnalyticsScriptsLoaded() {
  return gtmInit() || clarityInit() || sentryInit();
}
```

- [ ] **Step 2: Verify the import graph still resolves**

Run: `pnpm test src/components/consent/`
Expected: all consent tests still pass (this file changes nothing about runtime behavior; it just re-exports).

- [ ] **Step 3: Commit**

```bash
git add src/components/consent/analyticsState.js
git commit -m "feat(consent): add analyticsState aggregator for revoke notice"
```

---

## Task 5: Create `AnalyticsRevokeNotice.jsx` with TDD

**Files:**
- Create: `src/components/consent/AnalyticsRevokeNotice.test.jsx`
- Create: `src/components/consent/AnalyticsRevokeNotice.jsx`

- [ ] **Step 1: Write the failing test file**

Create `src/components/consent/AnalyticsRevokeNotice.test.jsx` with this content:

```jsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, act } from '@testing-library/react';

const KEY = 'silktideCookieChoice_analytics';
const CHANGE_EVENT = 'silktide:consentchange';

const toastMessageSpy = vi.fn();
vi.mock('sonner', () => ({
  toast: { message: (...args) => toastMessageSpy(...args) },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

const wereAnyAnalyticsScriptsLoadedSpy = vi.fn(() => false);
vi.mock('./analyticsState', () => ({
  wereAnyAnalyticsScriptsLoaded: () => wereAnyAnalyticsScriptsLoadedSpy(),
}));

function setConsent(value) {
  localStorage.setItem(KEY, value ? 'true' : 'false');
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

describe('AnalyticsRevokeNotice', () => {
  beforeEach(() => {
    toastMessageSpy.mockClear();
    wereAnyAnalyticsScriptsLoadedSpy.mockClear();
    wereAnyAnalyticsScriptsLoadedSpy.mockReturnValue(false);
    localStorage.clear();
    vi.resetModules();
  });

  it('does not show a toast on initial mount when consent is denied', async () => {
    localStorage.setItem(KEY, 'false');
    const { default: AnalyticsRevokeNotice } = await import('./AnalyticsRevokeNotice');
    render(<AnalyticsRevokeNotice />);
    expect(toastMessageSpy).not.toHaveBeenCalled();
  });

  it('does not show a toast on initial mount when consent is granted', async () => {
    localStorage.setItem(KEY, 'true');
    const { default: AnalyticsRevokeNotice } = await import('./AnalyticsRevokeNotice');
    render(<AnalyticsRevokeNotice />);
    expect(toastMessageSpy).not.toHaveBeenCalled();
  });

  it('does not show a toast on transition denied -> granted (forward direction)', async () => {
    localStorage.setItem(KEY, 'false');
    const { default: AnalyticsRevokeNotice } = await import('./AnalyticsRevokeNotice');
    render(<AnalyticsRevokeNotice />);
    act(() => setConsent(true));
    expect(toastMessageSpy).not.toHaveBeenCalled();
  });

  it('shows a toast on transition granted -> denied when at least one script was loaded', async () => {
    wereAnyAnalyticsScriptsLoadedSpy.mockReturnValue(true);
    localStorage.setItem(KEY, 'true');
    const { default: AnalyticsRevokeNotice } = await import('./AnalyticsRevokeNotice');
    render(<AnalyticsRevokeNotice />);
    act(() => setConsent(false));
    expect(toastMessageSpy).toHaveBeenCalledTimes(1);
    expect(toastMessageSpy).toHaveBeenCalledWith(
      'consent.revoke.title',
      expect.objectContaining({
        description: 'consent.revoke.description',
        action: expect.objectContaining({ label: 'consent.revoke.reload' }),
      })
    );
  });

  it('does not show a toast on revoke when no scripts were loaded', async () => {
    wereAnyAnalyticsScriptsLoadedSpy.mockReturnValue(false);
    localStorage.setItem(KEY, 'true');
    const { default: AnalyticsRevokeNotice } = await import('./AnalyticsRevokeNotice');
    render(<AnalyticsRevokeNotice />);
    act(() => setConsent(false));
    expect(toastMessageSpy).not.toHaveBeenCalled();
  });

  it('reload action calls window.location.reload', async () => {
    const reloadSpy = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { reload: reloadSpy },
    });

    wereAnyAnalyticsScriptsLoadedSpy.mockReturnValue(true);
    localStorage.setItem(KEY, 'true');
    const { default: AnalyticsRevokeNotice } = await import('./AnalyticsRevokeNotice');
    render(<AnalyticsRevokeNotice />);
    act(() => setConsent(false));

    const call = toastMessageSpy.mock.calls[0];
    const opts = call[1];
    opts.action.onClick();
    expect(reloadSpy).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm test src/components/consent/AnalyticsRevokeNotice.test.jsx`
Expected: all tests fail because `./AnalyticsRevokeNotice` does not exist.

- [ ] **Step 3: Create the implementation**

Create `src/components/consent/AnalyticsRevokeNotice.jsx` with this content:

```jsx
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useConsent } from './useConsent';
import { wereAnyAnalyticsScriptsLoaded } from './analyticsState';

export default function AnalyticsRevokeNotice() {
  const { granted } = useConsent('analytics');
  const { t } = useTranslation();
  const prevGrantedRef = useRef(granted);

  useEffect(() => {
    const wasGranted = prevGrantedRef.current;
    prevGrantedRef.current = granted;

    if (wasGranted && !granted && wereAnyAnalyticsScriptsLoaded()) {
      toast.message(t('consent.revoke.title'), {
        description: t('consent.revoke.description'),
        duration: 10000,
        action: {
          label: t('consent.revoke.reload'),
          onClick: () => window.location.reload(),
        },
      });
    }
  }, [granted, t]);

  return null;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm test src/components/consent/AnalyticsRevokeNotice.test.jsx`
Expected: all 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/consent/AnalyticsRevokeNotice.jsx src/components/consent/AnalyticsRevokeNotice.test.jsx
git commit -m "feat(consent): toast prompt to reload after analytics revoke"
```

---

## Task 6: Wire the gates and notice into `main.jsx`

**Files:**
- Modify: `src/main.jsx`

- [ ] **Step 1: Add the new imports**

In `src/main.jsx`, after the existing line `import './components/consent/sentryGate';` add two more side-effect imports and one component import. The relevant import block should look like this:

```jsx
import './components/consent/sentryGate';
import './components/consent/gtmGate';
import './components/consent/clarityGate';
import App from './components/App';
import {Provider} from "react-redux";
import store from "./store";
import reportWebVitals from './reportWebVitals';
import {NoticeProvider} from "./components/notice/NoticeContext";
import NoticeBanner from "./components/shell/NoticeBanner";
import AnalyticsRevokeNotice from './components/consent/AnalyticsRevokeNotice';
import {Toaster} from "./components/ui/sonner";
import "./i18n/i18n";
```

- [ ] **Step 2: Mount the notice inside `NoticeProvider`**

Update the JSX tree in `src/main.jsx` to mount `<AnalyticsRevokeNotice />` next to `<NoticeBanner />`:

```jsx
root.render(
    <React.StrictMode>
        <NoticeProvider>
            <NoticeBanner/>
            <AnalyticsRevokeNotice/>
            <Provider store={store}>
                <App/>
            </Provider>
        </NoticeProvider>
        <Toaster richColors closeButton position="top-right" theme="dark"/>
    </React.StrictMode>
);
```

- [ ] **Step 3: Run the full test suite to verify nothing regressed**

Run: `pnpm test`
Expected: all tests pass.

- [ ] **Step 4: Verify the build succeeds**

Run: `pnpm build`
Expected: build completes without errors.

- [ ] **Step 5: Commit**

```bash
git add src/main.jsx
git commit -m "feat(consent): wire GTM/Clarity gates and revoke notice into bootstrap"
```

---

## Task 7: Generalize the `analytics` description in `index.html`

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Replace the analytics description**

In `index.html`, find the `analytics` cookie type entry (currently around lines 85-91). Replace its `description` property only — leave `id`, `name`, `required`, `onAccept`, and `onReject` untouched.

Old:

```js
description: "<p>These cookies allow us to detect crashes and performance problems through Sentry, including session replays of broken pages. We use this only to fix bugs and improve the experience; we do not sell or share this data with advertisers.</p>",
```

New:

```js
description: "<p>These cookies allow us to measure how the site is used and to detect crashes and performance problems. We use Sentry (errors, session replays of broken pages), Google Analytics (aggregate usage via Google Tag Manager), and Microsoft Clarity (session replays for UX research). We use this only to fix bugs and improve the experience; we do not sell or share this data with advertisers.</p>",
```

- [ ] **Step 2: Verify the dev server starts and renders the banner with the new copy**

Run: `pnpm start`

In a fresh incognito window open `http://localhost:3185`, click the cookie icon (bottom-right) → Preferences → confirm the Analytics row shows the new description text. Stop the dev server.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(consent): generalize analytics cookie description for GTM/Clarity"
```

---

## Task 8: Add `consent.revoke.*` keys to all 27 locale files

The English text below is the source of truth. Korean is hand-translated. The other 25 locales receive the English text as a placeholder (the project's existing translation workflow handles localization afterwards).

**Files:**
- Modify: `src/i18n/locale/en-US.json`
- Modify: `src/i18n/locale/ko-KR.json`
- Modify: `src/i18n/locale/bg-BG.json`
- Modify: `src/i18n/locale/ca-ES.json`
- Modify: `src/i18n/locale/cs-CZ.json`
- Modify: `src/i18n/locale/de-DE.json`
- Modify: `src/i18n/locale/dk-DK.json`
- Modify: `src/i18n/locale/ee-EE.json`
- Modify: `src/i18n/locale/eo-EO.json`
- Modify: `src/i18n/locale/es-ES.json`
- Modify: `src/i18n/locale/fi-FI.json`
- Modify: `src/i18n/locale/fr-FR.json`
- Modify: `src/i18n/locale/is-IS.json`
- Modify: `src/i18n/locale/it-IT.json`
- Modify: `src/i18n/locale/lij-IT.json`
- Modify: `src/i18n/locale/lv-LV.json`
- Modify: `src/i18n/locale/nb-NO.json`
- Modify: `src/i18n/locale/pl-PL.json`
- Modify: `src/i18n/locale/pt-BR.json`
- Modify: `src/i18n/locale/ru-RU.json`
- Modify: `src/i18n/locale/sv-SV.json`
- Modify: `src/i18n/locale/th-TH.json`
- Modify: `src/i18n/locale/tr-TR.json`
- Modify: `src/i18n/locale/uk-UA.json`
- Modify: `src/i18n/locale/zh-CN.json`
- Modify: `src/i18n/locale/zh-LZH.json`
- Modify: `src/i18n/locale/zh-TW.json`

- [ ] **Step 1: Add the Korean translation to `ko-KR.json`**

Open `src/i18n/locale/ko-KR.json` and add a new top-level key `consent` (insert it after the last existing top-level key, before the closing `}`). The block to add:

```json
  "consent": {
    "revoke": {
      "title": "다음 페이지 로드 후 추적이 중지됩니다",
      "description": "이 탭에서 이미 로드된 분석 스크립트는 새로고침 전까지 계속 실행됩니다. 선택을 즉시 적용하려면 새로고침해주세요.",
      "reload": "새로고침"
    }
  }
```

Take care to add a comma to the previous top-level key's closing brace so the JSON stays valid.

- [ ] **Step 2: Add the English block to the remaining 26 locale files**

For every other locale file in the list above (including `en-US.json`), add this block as a new top-level key, following the same comma convention:

```json
  "consent": {
    "revoke": {
      "title": "Tracking will stop on next page load",
      "description": "Analytics scripts already loaded in this tab will continue to run until you reload. Reload now to fully apply your choice.",
      "reload": "Reload"
    }
  }
```

- [ ] **Step 3: Verify every locale file is still valid JSON**

Run: `node -e "for (const f of require('fs').readdirSync('src/i18n/locale')) { JSON.parse(require('fs').readFileSync('src/i18n/locale/' + f, 'utf8')); console.log('OK', f); }"`
Expected: 27 lines all printed as `OK <filename>`.

- [ ] **Step 4: Verify the consent key is present in every file**

Run: `node -e "for (const f of require('fs').readdirSync('src/i18n/locale')) { const j = JSON.parse(require('fs').readFileSync('src/i18n/locale/' + f, 'utf8')); if (!j.consent || !j.consent.revoke || !j.consent.revoke.title || !j.consent.revoke.description || !j.consent.revoke.reload) { console.error('MISSING', f); process.exit(1); } } console.log('all 27 files have consent.revoke.*');"`
Expected: `all 27 files have consent.revoke.*`.

- [ ] **Step 5: Run the full test suite**

Run: `pnpm test`
Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/i18n/locale/
git commit -m "i18n(consent): add consent.revoke.* keys for analytics revoke toast"
```

---

## Task 9: Manual integration verification

**No file changes; verifies the end-to-end flow in a browser.**

- [ ] **Step 1: Start the dev server**

Run: `pnpm start`

- [ ] **Step 2: Verify NO third-party requests when consent is denied**

Open `http://localhost:3185` in a fresh incognito window. Open DevTools → Network tab → filter by `googletagmanager.com OR clarity.ms OR sentry`. In the Silktide banner click **Reject non-essential**.

Expected: zero requests to `googletagmanager.com`, `clarity.ms`, or `sentry.io`.

- [ ] **Step 3: Verify all three load when consent is granted**

In another fresh incognito window open `http://localhost:3185`. In the Silktide banner click **Accept all**.

Expected: Network tab shows requests to:
- `https://www.googletagmanager.com/gtm.js?id=GTM-KC5HBS5T`
- `https://www.clarity.ms/tag/whmgvzi2gl`
- `*.sentry.io` (existing)

`window.dataLayer` is an array containing `{ 'gtm.start': ..., event: 'gtm.js' }` (verify in DevTools Console).
`typeof window.clarity === 'function'` is true.

- [ ] **Step 4: Verify the revoke toast**

In the same window from Step 3 (consent currently granted, scripts loaded), click the cookie icon (bottom-right) → Preferences → toggle **Analytics** OFF → Save.

Expected: a toast appears (top-right) with the title "Tracking will stop on next page load" and a "Reload" action button. Clicking Reload reloads the page; on reload, no requests go to GTM/Clarity/Sentry.

- [ ] **Step 5: Verify the description copy update**

Still on the page, open the cookie preferences again and confirm the Analytics row's description includes the words "Google Analytics" and "Microsoft Clarity".

- [ ] **Step 6: Stop the dev server**

Press `Ctrl+C` in the terminal running `pnpm start`.

- [ ] **Step 7: Final summary commit (optional)**

If any task left uncommitted polish (typo, comment), commit it now. Otherwise this step is a no-op.

---

## Done Criteria

- All gate tests pass: `pnpm test src/components/consent/`
- Full suite passes: `pnpm test`
- `pnpm build` succeeds
- Manual verification (Task 9) shows zero third-party requests until consent is granted, and the revoke toast appears + works
- 27 locale files contain `consent.revoke.{title,description,reload}` keys and parse as valid JSON

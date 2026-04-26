# Google Tag Manager + Microsoft Clarity (Consent-Gated)

**Date:** 2026-04-26
**Status:** Design approved, pending implementation plan
**Container IDs:** `GTM-KC5HBS5T` (GTM), `whmgvzi2gl` (Microsoft Clarity)

## Goal

Integrate Google Tag Manager and Microsoft Clarity into the SCP:SL server browser frontend in a way that strictly complies with GDPR: no third-party network requests to `googletagmanager.com` or `clarity.ms` may occur until the user has granted **analytics** consent through the existing Silktide Consent Manager. The integration must mirror the architecture of the existing `sentryGate.js` so the codebase has a single coherent pattern for consent-gated third parties.

## Non-Goals

- Google Consent Mode v2 (load GTM with denied defaults). Rejected because the project does not show ads, and a stricter "no script unless consented" gate is consistent with the existing Sentry approach.
- Configuring Google Analytics or Clarity tags inside the GTM container. Both are injected directly from code as separate gates per the user's choice (option B in question 3) — they share an `analytics` consent dependency but are otherwise independent.
- A new `marketing` consent category. Both tools are used for usage analytics rather than advertising, so they fit the existing `analytics` category once its description is generalized.

## Architecture

Two new side-effect modules in `src/components/consent/` mirror `sentryGate.js`:

```
src/
  main.jsx                                  // adds two import lines
  components/
    consent/
      silktideClient.js                     // unchanged
      useConsent.js                         // unchanged
      sentryGate.js                         // unchanged (adds isInitialized export)
      gtmGate.js                            // NEW
      clarityGate.js                        // NEW
      analyticsState.js                     // NEW (helper for revoke notice)
      AnalyticsRevokeNotice.jsx             // NEW (toast on consent revoke)
      gtmGate.test.js                       // NEW
      clarityGate.test.js                   // NEW
      AnalyticsRevokeNotice.test.jsx        // NEW
index.html                                  // updates analytics description copy
src/i18n/locale/*.json                      // adds consent.revoke.* keys (27 locale files)
```

Both gates:
- Are imported as side effects from `src/main.jsx`.
- Read consent via `readConsent('analytics')` and `subscribe(...)` from `silktideClient.js`.
- Inject their respective external script into `document.head` only when consent is granted.
- Use a one-shot `initialized` flag — once injected, the script is never removed and re-injection is suppressed (lock-once). Revoke is handled at the UX layer (toast prompting reload).

## Why this differs from the standard GTM install snippet

The user-supplied GTM install instructions ask for:
1. A synchronous `<script>` block in `<head>`.
2. A `<noscript>` `<iframe>` immediately after `<body>`.

We deliberately omit both:
- The `<script>` block would cause a network request to `googletagmanager.com/gtm.js` on every page load before any consent decision exists. That violates GDPR.
- The `<noscript>` iframe is a fallback for users with JS disabled. The Silktide consent UI itself requires JS, so a JS-disabled user cannot grant consent and therefore must not be tracked. Including the noscript iframe would track users who have no way to opt out.

Instead, the gate dynamically injects the equivalent script tag at runtime once consent is granted.

## Components

### `src/components/consent/gtmGate.js`

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
  console.warn('[gtmGate] failed to initialise consent gate:', e);
}
```

**Differences from `sentryGate.js`:**
- No `running` flag and no revoke branch — GTM has no `close()` API. Once injected, GTM stays for the page session.
- Exports `isInitialized()` so `AnalyticsRevokeNotice` can decide whether to prompt for reload.

### `src/components/consent/clarityGate.js`

```js
import { readConsent, subscribe } from './silktideClient';

const PROJECT_ID = 'whmgvzi2gl';
let initialized = false;

export function isInitialized() {
  return initialized;
}

function initClarity() {
  // Equivalent to the official Clarity bootstrap snippet.
  // We inline rather than eval the snippet so the bundler can lint it.
  window.clarity = window.clarity || function () {
    (window.clarity.q = window.clarity.q || []).push(arguments);
  };
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${PROJECT_ID}`;
  const first = document.getElementsByTagName('script')[0];
  first.parentNode.insertBefore(script, first);

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
  console.warn('[clarityGate] failed to initialise consent gate:', e);
}
```

### `src/components/consent/sentryGate.js` change

Add a single export so `AnalyticsRevokeNotice` can ask whether Sentry was loaded:

```js
export function isInitialized() {
  return initialized;
}
```

No other changes — existing `initialized`/`running` semantics are preserved.

### `src/components/consent/analyticsState.js`

```js
import { isInitialized as gtmInit } from './gtmGate';
import { isInitialized as clarityInit } from './clarityGate';
import { isInitialized as sentryInit } from './sentryGate';

export function wereAnyAnalyticsScriptsLoaded() {
  return gtmInit() || clarityInit() || sentryInit();
}
```

### `src/components/consent/AnalyticsRevokeNotice.jsx`

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

### `src/main.jsx` changes

```jsx
import './components/consent/sentryGate';
import './components/consent/gtmGate';        // NEW
import './components/consent/clarityGate';    // NEW
import AnalyticsRevokeNotice from './components/consent/AnalyticsRevokeNotice'; // NEW
```

Mount the notice inside the existing provider tree:

```jsx
<NoticeProvider>
  <NoticeBanner/>
  <AnalyticsRevokeNotice/>      {/* NEW */}
  <Provider store={store}>
    <App/>
  </Provider>
</NoticeProvider>
```

### `index.html` change

Update only the `analytics` cookie type description. Container config and other categories untouched.

```js
{
  id: "analytics",
  name: "Analytics",
  description: "<p>These cookies allow us to measure how the site is used and to detect crashes and performance problems. We use Sentry (errors, session replays of broken pages), Google Analytics (aggregate usage via Google Tag Manager), and Microsoft Clarity (session replays for UX research). We use this only to fix bugs and improve the experience; we do not sell or share this data with advertisers.</p>",
  required: false,
  onAccept: __stcmNotify,
  onReject: __stcmNotify
}
```

### i18n keys

Added to all 27 locale files in `src/i18n/locale/`:

```json
"consent": {
  "revoke": {
    "title": "Tracking will stop on next page load",
    "description": "Analytics scripts already loaded in this tab will continue to run until you reload. Reload now to fully apply your choice.",
    "reload": "Reload"
  }
}
```

`en-US.json` and `ko-KR.json` get hand-translated values (English above; Korean equivalent during implementation). The remaining 25 locale files receive the English text as a placeholder so i18next does not fall back to the key string and so the JSON shape stays consistent across locales — translations follow the project's existing translation workflow afterwards.

## Data Flow

### Page load sequence

1. `index.html` parses → Silktide script (sync) restores consent state from localStorage and calls `updateCookieBannerConfig({...})`.
2. `/src/main.jsx` (defer/module) evaluates side-effect imports in order:
   - `sentryGate` → `evaluate()` → if granted, `Sentry.init()`.
   - `gtmGate` → `evaluate()` → if granted, inject `gtm.js` and seed `dataLayer`.
   - `clarityGate` → `evaluate()` → if granted, inject Clarity bootstrap.
3. React renders. `AnalyticsRevokeNotice` mounts and seeds `prevGrantedRef` with the current consent value (so the initial render does not fire the toast).

The three gates run sequentially in microseconds; their external script downloads are `async`, so render is unblocked.

### Consent transition matrix

| From | To | gtmGate / clarityGate | sentryGate | AnalyticsRevokeNotice |
|---|---|---|---|---|
| unknown | granted | inject script | `Sentry.init()` | no toast (forward direction) |
| unknown | denied | no-op | no-op | no toast (no scripts were loaded) |
| granted | denied | no-op (locked, scripts stay) | `Sentry.close()` (events stop, listeners stay) | **toast with Reload action** |
| denied | granted | no-op (locked) | no-op (locked after first init) | no toast |

A user who refuses on first visit and never accepts will never see a single byte sent to GTM/Clarity. A user who accepts and then revokes in the same session sees the toast, and a reload returns the page to a fully clean state.

### Cross-tab updates

`silktideClient.subscribe()` listens for both `silktide:consentchange` (same-tab, dispatched by `__stcmNotify` in `index.html`) and the native `storage` event (cross-tab). Both flow through the same `evaluate()` callback, so consent changes in another tab are honored in the current one.

## Error Handling

| Scenario | Behavior |
|---|---|
| `localStorage.getItem` throws (Safari private mode, locked-down browsers) | `try/catch` around `evaluate()` + `subscribe()` warns to console; gate stays inert; app boots normally. |
| `googletagmanager.com` blocked by uBlock/network policy | `<script>` `onerror` is ignored. `dataLayer` push remains in memory; no functional impact. |
| `clarity.ms` blocked | Same. `window.clarity` remains a queue function; calls accumulate harmlessly. |
| Storm of consent change events (multiple tabs) | `initialized` flag short-circuits any second injection. `dataLayer` is only seeded once. |
| One gate throws on import | Its own `try/catch` contains the failure; other gates and the React render proceed. |

## Testing

Vitest + jsdom, mirroring the existing `sentryGate.test.js` / `silktideClient.test.js` style. Each gate test uses `vi.resetModules()` + dynamic `import()` so the side-effect module re-evaluates against the per-test localStorage state.

### `gtmGate.test.js`

- inject GTM script when analytics consent is granted at import
- do not inject when denied
- do not inject when unknown
- inject when consent transitions denied → granted (dispatch `silktide:consentchange`)
- do not inject twice when consent toggles granted → denied → granted (lock-once)
- survive `localStorage` throwing on first read

Each test asserts:
- presence/absence of a `<script>` whose `src` starts with `https://www.googletagmanager.com/gtm.js?id=GTM-KC5HBS5T`
- `window.dataLayer` shape (`[{'gtm.start': Number, event: 'gtm.js'}, ...]` or undefined)
- `isInitialized()` return value

### `clarityGate.test.js`

1:1 mirror of the GTM test, asserting:
- `<script>` `src` ends with `clarity.ms/tag/whmgvzi2gl`
- `window.clarity` is a function with a `q` queue array

### `AnalyticsRevokeNotice.test.jsx`

- show toast on transition granted → denied when at least one gate reports `isInitialized() === true`
- do not show toast when no scripts were loaded (all `isInitialized()` false)
- do not show toast on initial denied (no transition)
- do not show toast on denied → granted (forward direction)
- reload action calls `window.location.reload`

Mocks:
- `vi.mock('sonner', () => ({ toast: { message: vi.fn() } }))`
- `vi.mock('react-i18next', ...)` to return identity `t`
- `vi.mock('./gtmGate', ...)` and siblings to control `isInitialized()`
- `Object.defineProperty(window, 'location', { value: { reload: vi.fn() } })`

Per-test setup clears `document.head` of injected scripts, resets `window.dataLayer` / `window.clarity`, calls `localStorage.clear()`, and `vi.resetModules()`.

### Manual integration verification

In `pnpm start`, in a fresh incognito window:

1. Reject non-essential → DevTools Network shows zero requests to `googletagmanager.com` or `clarity.ms`.
2. Accept all → both domains receive requests; GTM Preview mode confirms container fires; Clarity dashboard shows the session.
3. Open cookie icon → toggle Analytics off → toast appears with Reload action; clicking it clears injected scripts on the next page load.

## Open Questions / Future Work

- If the GTM container later loads ad pixels, the `analytics` description copy and possibly the category itself will need to be revisited (split into `analytics` vs. `marketing`).
- If we want true in-session revocation (no reload required), we will need to migrate to Google Consent Mode v2 for GTM and use Clarity's `clarity('consent', false)` API; this is deferred until there is concrete demand.

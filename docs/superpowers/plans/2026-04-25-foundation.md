# Plan A — Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the Tailwind v4 + shadcn/ui foundation, the GDPR-compliant Silktide consent layer with deferred Sentry init, and rebuild the application shell — so that subsequent plans (B–E) can build pages on top of it.

**Architecture:** Add new dependencies without removing old ones (cutover happens in Plan F). Tailwind v4 + Bootstrap CSS coexist temporarily. Generate shadcn primitives via the official CLI into `src/components/ui/`. Wrap Silktide's CDN-loaded global with a thin React adapter that exposes `useConsent(category)` via `useSyncExternalStore`. Sentry's `init` no longer runs at module load — a tiny `sentryGate` subscribes to consent changes and starts/stops Sentry accordingly. The app shell (Container/TopMenu/Footer/Notice) is rewritten with shadcn primitives + lucide icons, preserving every existing route and i18n key.

**Tech Stack:** React 19, Vite 8, Vitest 4 + Testing Library, Tailwind v4, shadcn/ui (Radix), lucide-react, sonner, isomorphic-dompurify, Silktide Consent Manager (CDN), `@sentry/react` v10.

**Spec reference:** `docs/superpowers/specs/2026-04-25-design-overhaul-design.md`, sections §3, §4, §5, §7, §10 (commits 01–06).

**Branch:** `main` (per user direction; no PR; commits land directly).

**Dependency-pinning policy:** Every direct dependency must be pinned exactly in `package.json` (no `^`/`~`). After every `pnpm add`, verify `package.json` and remove any range prefixes manually if `pnpm` adds them.

---

## Files map

This plan creates or modifies the following files. Read this section before starting any task; it locks in the decomposition.

**Created:**
- `src/lib/cn.js` — Tailwind class merger (`clsx` + `tailwind-merge`).
- `src/styles/globals.css` — Tailwind v4 entry + design tokens.
- `components.json` — shadcn CLI config (project root).
- `src/components/ui/*.jsx` — generated shadcn primitives (button, input, select, checkbox, radio-group, slider, card, badge, drawer, sheet, dialog, tabs, tooltip, popover, scroll-area, separator, skeleton, sonner, alert).
- `src/components/consent/silktideClient.js` — wraps `window.silktideCookieBannerManager` + reads localStorage state.
- `src/components/consent/silktideClient.test.js` — unit tests for read/subscribe.
- `src/components/consent/useConsent.js` — `useSyncExternalStore` hook on top of `silktideClient`.
- `src/components/consent/useConsent.test.jsx` — hook tests via `renderHook`.
- `src/components/consent/ConsentProvider.jsx` — mounts Silktide script + i18n bridge.
- `src/components/consent/i18nBridge.js` — keeps Silktide banner text in sync with `i18n.language`.
- `src/components/consent/sentryGate.js` — subscribes to consent and starts/stops Sentry.
- `src/components/consent/sentryGate.test.js` — verifies grant/revoke transitions.
- `src/components/shell/Container.jsx` — moved from `src/components/Container.jsx`.
- `src/components/shell/TopMenu.jsx` — rewritten using shadcn + lucide.
- `src/components/shell/Footer.jsx` — rewritten using Tailwind grid.
- `src/components/shell/NoticeBanner.jsx` — rewritten using shadcn `Alert`.
- `src/components/shell/SafeHtml.jsx` — sanitized HTML renderer used by Footer notice.
- `src/components/shell/Container.test.jsx` — smoke render with all routes.

**Modified:**
- `package.json` — new deps added; old deps untouched until Plan F.
- `vite.config.js` — add `@tailwindcss/vite` plugin.
- `index.html` — add Silktide stylesheet+script tags (deferred load).
- `src/main.jsx` — remove eager `Sentry.init`; import `sentryGate` once; mount `ConsentProvider`; add `Toaster` from sonner.
- `src/components/App.jsx` — remove `react-cookie-consent` and `react-toastify` `ToastContainer`; update import paths to `shell/*`; lazy routes unchanged.
- `src/index.css` — keep file but mark legacy CSS variables as "to be removed in Plan F" via comment.

**Untouched in this plan (handled by Plans B–F):**
- `src/pages/**` (all pages) — Plans B/C/D/E.
- `src/components/topmenu/{LanguageSelect,SiSelect}.jsx` — Plan B will modernize these; for now they are reused unchanged inside the new `shell/TopMenu.jsx`.
- `src/components/notice/NoticeContext.jsx` — provider stays put; only the visual `NoticeBanner` moves into `shell/`.
- `src/modules/**` — never touched in any plan.
- All existing dependencies marked for removal — Plan F.

---

## Task 1: Install foundation dependencies (commit 01)

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml` (auto-updated by pnpm)

- [ ] **Step 1.1: Add Tailwind v4 + shadcn dependencies**

Run from project root:

```bash
pnpm add tailwindcss@latest @tailwindcss/vite@latest \
         class-variance-authority@latest clsx@latest tailwind-merge@latest \
         tailwindcss-animate@latest \
         @radix-ui/react-slot@latest
```

Expected: pnpm prints "Done in …" and `package.json` `dependencies` contains all 7 packages.

- [ ] **Step 1.2: Add icon, chart, virtualization, toast, sanitizer deps**

```bash
pnpm add lucide-react@latest recharts@latest \
         @tanstack/react-virtual@latest sonner@latest \
         isomorphic-dompurify@latest
```

`isomorphic-dompurify` powers `SafeHtml` in Task 6 (replaces the legacy raw inner-HTML pattern in the Footer notice).

- [ ] **Step 1.3: Pin every newly added dependency exactly (no `^`/`~`)**

Open `package.json`. For each new entry under `dependencies`, strip any leading `^` or `~`. Example: `"tailwindcss": "^4.1.0"` becomes `"tailwindcss": "4.1.0"`.

This matches the existing supply-chain policy (see `README.md` §"Supply Chain Security"). After editing, run `pnpm install` once more so the lockfile reflects the pinned spec without changing resolved versions.

- [ ] **Step 1.4: Verify dev server still starts**

```bash
pnpm start
```

Expected: Vite prints `Local: http://localhost:3185/` and the existing app loads in a browser without console errors. Stop the server with Ctrl-C.

- [ ] **Step 1.5: Verify build still passes**

```bash
pnpm build
```

Expected: Vite prints `✓ built in …` and `build/` directory is regenerated. No errors.

- [ ] **Step 1.6: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore(deps): install Tailwind v4, shadcn primitives, recharts, lucide-react, @tanstack/react-virtual, sonner, dompurify

Adds new deps only. Bootstrap, react-bootstrap, FontAwesome, react-select,
react-datepicker, react-toastify, react-cookie-consent, highcharts, and
@influxdata/giraffe remain installed and used; they are removed in the
final cleanup commit (Plan F). All new direct deps are pinned exactly per
the supply-chain policy in README.md."
```

---

## Task 2: Configure Tailwind v4 + design tokens + `cn()` util (commit 02)

**Files:**
- Create: `src/lib/cn.js`
- Create: `src/styles/globals.css`
- Modify: `vite.config.js`
- Modify: `src/main.jsx` (add globals.css import, keep existing imports)

- [ ] **Step 2.1: Add Tailwind plugin to Vite config**

Edit `vite.config.js` — add the import and include the plugin:

```js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3185,
    open: false,
  },
  build: {
    outDir: 'build',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
});
```

- [ ] **Step 2.2: Write `src/lib/cn.js`**

Create `src/lib/cn.js`:

```js
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2.3: Write `src/styles/globals.css` with Tailwind v4 entry and SaaS-dark tokens**

Create `src/styles/globals.css`:

```css
@import "tailwindcss";
@plugin "tailwindcss-animate";

/* Dark-mode-only tokens. Applied at :root because the app is dark-only. */
@layer base {
  :root {
    --background: 220 14% 5%;          /* #0b0d10 */
    --foreground: 220 14% 91%;         /* #e6e8eb */
    --card: 220 14% 7%;                /* #11141a */
    --card-foreground: 220 14% 91%;
    --muted: 220 14% 12%;
    --muted-foreground: 220 9% 46%;    /* #5a6371 */
    --border: 220 14% 14%;             /* #1c1f24 */
    --input: 220 14% 12%;
    --ring: 142 71% 45%;
    --primary: 142 71% 45%;            /* #22c55e — single SaaS accent */
    --primary-foreground: 142 60% 6%;
    --destructive: 0 84% 60%;          /* #ef4444 */
    --destructive-foreground: 0 0% 98%;
    --warning: 38 92% 50%;             /* #f59e0b */
    --radius: 0.5rem;
  }

  html {
    color-scheme: dark;
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
  }
}
```

- [ ] **Step 2.4: Import globals.css from main.jsx**

Edit `src/main.jsx` — add the new import line **after** the existing `./styles/global.css` import (so Tailwind layers come last and win specificity ties):

```js
import './styles/global.css';
import './styles/globals.css';   // NEW
```

(The legacy file is `global.css` singular; the new one is `globals.css` plural per shadcn convention. They coexist in this plan.)

- [ ] **Step 2.5: Smoke-verify Tailwind by inspecting the live page**

Open the app in a browser (`pnpm start`). Open DevTools → Elements. Pick any element and confirm the `:root` styles include the new CSS variables (`--background`, `--primary`, etc.). Confirm Tailwind's reset has applied (e.g. `*` has `border-color: hsl(var(--border))`).

- [ ] **Step 2.6: Verify build passes and Tailwind output is present**

```bash
pnpm build
grep -lq "hsl(var(--primary))" build/assets/*.css || echo "TAILWIND OUTPUT MISSING"
```

Expected: no "TAILWIND OUTPUT MISSING" line. The grep finds at least one CSS file.

- [ ] **Step 2.7: Commit**

```bash
git add vite.config.js src/lib/cn.js src/styles/globals.css src/main.jsx
git commit -m "feat(ui): set up Tailwind v4 config and design tokens

Adds @tailwindcss/vite plugin, src/styles/globals.css with the SaaS-dark
token set (single primary accent #22c55e, neutrals #0b0d10 to #e6e8eb),
and src/lib/cn.js (clsx + tailwind-merge). Bootstrap CSS coexists;
Tailwind output is loaded after Bootstrap so utility classes win when
collisions happen."
```

---

## Task 3: Initialize shadcn and generate primitives (commit 03)

**Files:**
- Create: `components.json` (shadcn CLI config, project root)
- Create: `src/components/ui/*.jsx` (one file per primitive — generated)
- Modify: `package.json` (CLI may add `@radix-ui/*` packages)

- [ ] **Step 3.1: Initialize shadcn config**

Run from project root:

```bash
pnpm dlx shadcn@latest init
```

Answer prompts:
- TypeScript? **No** (project uses JSX/JS).
- Style? **Default**.
- Base color? **Neutral** (we override via `globals.css` tokens; pick neutral so shadcn doesn't add competing variables).
- Global CSS path? **src/styles/globals.css**.
- CSS variables? **Yes**.
- `cn` utility path? **src/lib/cn**.
- React Server Components? **No**.
- `components.json` path? Accept default (project root).

Expected: `components.json` is created at the project root.

- [ ] **Step 3.2: Generate primitives**

```bash
pnpm dlx shadcn@latest add button input select checkbox \
  radio-group slider card badge drawer sheet dialog tabs \
  tooltip popover scroll-area separator skeleton sonner \
  alert
```

Note: `alert` is added so the rebuilt `NoticeBanner` (Task 6) can use it.

Expected: `src/components/ui/` is populated with one `.jsx` file per primitive. `package.json` gains `@radix-ui/*` packages and `vaul` (Drawer).

- [ ] **Step 3.3: Pin every newly added dependency exactly**

Repeat the rule from Step 1.3 — open `package.json`, strip any leading `^`/`~` from any new entries the shadcn CLI added. Run `pnpm install` to refresh lockfile.

- [ ] **Step 3.4: Write a smoke test that renders Button**

Create `src/components/ui/button.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './button';

describe('Button (shadcn primitive)', () => {
  it('renders with given children', () => {
    render(<Button>Press me</Button>);
    expect(screen.getByRole('button', { name: 'Press me' })).toBeInTheDocument();
  });

  it('applies variant=destructive class', () => {
    render(<Button variant="destructive">Danger</Button>);
    const btn = screen.getByRole('button', { name: 'Danger' });
    expect(btn.className).toMatch(/destructive/);
  });
});
```

- [ ] **Step 3.5: Run the smoke test**

```bash
pnpm test src/components/ui/button.test.jsx --run
```

Expected: PASS. If the file isn't found, re-run `pnpm dlx shadcn@latest add button` and try again.

- [ ] **Step 3.6: Verify build passes**

```bash
pnpm build
```

Expected: no errors.

- [ ] **Step 3.7: Commit**

```bash
git add components.json src/components/ui package.json pnpm-lock.yaml
git commit -m "feat(ui): generate shadcn primitive components

Generates Button, Input, Select, Checkbox, RadioGroup, Slider, Card, Badge,
Drawer, Sheet, Dialog, Tabs, Tooltip, Popover, ScrollArea, Separator,
Skeleton, Sonner Toaster, and Alert under src/components/ui/. CSS vars
already defined in globals.css drive the appearance. Smoke test on Button
asserts render + variant class application. Radix peer deps are pinned
exactly."
```

---

## Task 4: Silktide CMP + `useConsent` adapter (commit 04)

**Files:**
- Modify: `index.html` (add Silktide stylesheet + script tags)
- Create: `src/components/consent/silktideClient.js`
- Create: `src/components/consent/silktideClient.test.js`
- Create: `src/components/consent/useConsent.js`
- Create: `src/components/consent/useConsent.test.jsx`
- Create: `src/components/consent/ConsentProvider.jsx`
- Create: `src/components/consent/i18nBridge.js`
- Modify: `src/main.jsx` (mount `ConsentProvider`, add `Toaster`)
- Modify: `src/components/App.jsx` (remove `react-cookie-consent` + `ToastContainer`)

### Discovery (must run first)

- [ ] **Step 4.0: Inspect Silktide localStorage shape (one-time spike, ~30 min)**

Open the Silktide install page (https://silktide.com/consent-manager/install/) and the advanced configuration docs. Generate or grab a sample `<script>` snippet. Paste it temporarily into `index.html` and load the dev server. In the browser DevTools → Application → Local Storage, observe what keys Silktide writes after you grant or reject the banner. Record the exact shape — typical Silktide pattern is a single key (e.g. `silktideCookieChoices` or `silktideConsentChoices`) holding a JSON object keyed by category names like `necessary`, `functional`, `analytics`, `advertising`, with values `true` or `false`.

If the actual key name differs from `silktideCookieChoices`, update the constant in Step 4.4 and the test seeds in Steps 4.2/4.6/5.1.

After the spike, **revert** the temporary `index.html` change before continuing — the script will be re-added properly in Step 4.1.

### Code

- [ ] **Step 4.1: Add Silktide CSS + script to `index.html`**

Edit `index.html` — insert just before the `</head>` tag:

```html
    <!-- Silktide Consent Manager
     ================================================== -->
    <link rel="stylesheet" href="https://cdn.silktide.com/consent-manager/v1/silktide-consent-manager.css"/>
    <script defer src="https://cdn.silktide.com/consent-manager/v1/cookie-banner.js"></script>
```

Use `defer` so the script doesn't block render. The script tag URL above is illustrative — confirm the current canonical URLs from the Silktide install wizard during Step 4.0 and adjust if needed.

- [ ] **Step 4.2: Write the failing test for `silktideClient`**

Create `src/components/consent/silktideClient.test.js`:

```js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readConsent, subscribe, CATEGORIES } from './silktideClient';

const STORAGE_KEY = 'silktideCookieChoices';

describe('silktideClient.readConsent', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns "unknown" when nothing has been written yet', () => {
    expect(readConsent('analytics')).toEqual({ granted: false, status: 'unknown' });
  });

  it('returns "granted" when the category is true in localStorage', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ analytics: true, advertising: false, functional: true, necessary: true }));
    expect(readConsent('analytics')).toEqual({ granted: true, status: 'granted' });
  });

  it('returns "denied" when the category is false in localStorage', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ analytics: false, advertising: false, functional: true, necessary: true }));
    expect(readConsent('analytics')).toEqual({ granted: false, status: 'denied' });
  });

  it('treats a malformed JSON value as "unknown"', () => {
    localStorage.setItem(STORAGE_KEY, 'not-json{');
    expect(readConsent('analytics')).toEqual({ granted: false, status: 'unknown' });
  });

  it('exposes the four standard categories', () => {
    expect(CATEGORIES).toEqual(['necessary', 'functional', 'analytics', 'advertising']);
  });
});

describe('silktideClient.subscribe', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('fires the callback when the storage key changes', () => {
    const cb = vi.fn();
    const unsubscribe = subscribe(cb);
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
    expect(cb).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it('stops firing after unsubscribe', () => {
    const cb = vi.fn();
    const unsubscribe = subscribe(cb);
    unsubscribe();
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
    expect(cb).not.toHaveBeenCalled();
  });

  it('ignores storage events for unrelated keys', () => {
    const cb = vi.fn();
    subscribe(cb);
    window.dispatchEvent(new StorageEvent('storage', { key: 'something-else' }));
    expect(cb).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 4.3: Run the test — should FAIL**

```bash
pnpm test src/components/consent/silktideClient.test.js --run
```

Expected: FAIL with "Cannot find module './silktideClient'".

- [ ] **Step 4.4: Implement `silktideClient.js`**

Create `src/components/consent/silktideClient.js`:

```js
const STORAGE_KEY = 'silktideCookieChoices';

export const CATEGORIES = ['necessary', 'functional', 'analytics', 'advertising'];

function parseChoices() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function readConsent(category) {
  const choices = parseChoices();
  if (!choices || typeof choices[category] !== 'boolean') {
    return { granted: false, status: 'unknown' };
  }
  return { granted: choices[category], status: choices[category] ? 'granted' : 'denied' };
}

const listeners = new Set();
let storageHandlerInstalled = false;

function handleStorageEvent(event) {
  if (event.key !== STORAGE_KEY) return;
  for (const cb of listeners) cb();
}

export function subscribe(callback) {
  if (!storageHandlerInstalled) {
    window.addEventListener('storage', handleStorageEvent);
    storageHandlerInstalled = true;
  }
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
    if (listeners.size === 0) {
      window.removeEventListener('storage', handleStorageEvent);
      storageHandlerInstalled = false;
    }
  };
}

// The DOM `storage` event only fires across tabs. Silktide writes from the
// same tab, so we additionally poll every 500ms (one cheap localStorage read).
let lastSnapshot = '';
let pollHandle = null;

export function startSameTabPolling() {
  if (pollHandle != null) return;
  lastSnapshot = localStorage.getItem(STORAGE_KEY) ?? '';
  pollHandle = setInterval(() => {
    const current = localStorage.getItem(STORAGE_KEY) ?? '';
    if (current !== lastSnapshot) {
      lastSnapshot = current;
      for (const cb of listeners) cb();
    }
  }, 500);
}

export function stopSameTabPolling() {
  if (pollHandle != null) {
    clearInterval(pollHandle);
    pollHandle = null;
  }
}
```

- [ ] **Step 4.5: Re-run the test — should PASS**

```bash
pnpm test src/components/consent/silktideClient.test.js --run
```

Expected: all 8 tests PASS.

- [ ] **Step 4.6: Write the failing test for `useConsent`**

Create `src/components/consent/useConsent.test.jsx`:

```jsx
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useConsent } from './useConsent';

const STORAGE_KEY = 'silktideCookieChoices';

describe('useConsent', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns "unknown" before the user makes a choice', () => {
    const { result } = renderHook(() => useConsent('analytics'));
    expect(result.current).toEqual({ granted: false, status: 'unknown' });
  });

  it('reflects the current localStorage state on mount', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ analytics: true, functional: true, advertising: false, necessary: true }));
    const { result } = renderHook(() => useConsent('analytics'));
    expect(result.current).toEqual({ granted: true, status: 'granted' });
  });

  it('updates when the storage event fires', () => {
    const { result } = renderHook(() => useConsent('analytics'));
    act(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ analytics: true, functional: true, advertising: false, necessary: true }));
      window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
    });
    expect(result.current).toEqual({ granted: true, status: 'granted' });
  });
});
```

- [ ] **Step 4.7: Run the test — should FAIL**

```bash
pnpm test src/components/consent/useConsent.test.jsx --run
```

Expected: FAIL with "Cannot find module './useConsent'".

- [ ] **Step 4.8: Implement `useConsent.js`**

Create `src/components/consent/useConsent.js`:

```js
import { useSyncExternalStore } from 'react';
import { readConsent, subscribe } from './silktideClient';

export function useConsent(category) {
  return useSyncExternalStore(
    subscribe,
    () => readConsent(category),
    () => ({ granted: false, status: 'unknown' }) // SSR/initial
  );
}
```

- [ ] **Step 4.9: Re-run the test — should PASS**

```bash
pnpm test src/components/consent/useConsent.test.jsx --run
```

Expected: 3 tests PASS.

- [ ] **Step 4.10: Write `i18nBridge.js`**

Create `src/components/consent/i18nBridge.js`:

```js
import i18n from '../../i18n/i18n';

// Pushes localized banner copy into Silktide whenever i18n.language changes.
// Reuses the existing 27-locale `cookie-notice` keys.
export function attachI18nBridge() {
  function push() {
    const cmp = window.silktideCookieBannerManager;
    if (!cmp || typeof cmp.updateCookieBannerConfig !== 'function') return;
    cmp.updateCookieBannerConfig({
      text: {
        bannerTitle: i18n.t('cookie-notice.message'),
        acceptButtonText: i18n.t('cookie-notice.dismiss'),
        rejectButtonText: i18n.t('cookie-notice.dismiss'),
      },
    });
  }

  push();
  i18n.on('languageChanged', push);
  return () => i18n.off('languageChanged', push);
}
```

- [ ] **Step 4.11: Write `ConsentProvider.jsx`**

Create `src/components/consent/ConsentProvider.jsx`:

```jsx
import { useEffect } from 'react';
import { startSameTabPolling, stopSameTabPolling } from './silktideClient';
import { attachI18nBridge } from './i18nBridge';

export function ConsentProvider({ children }) {
  useEffect(() => {
    startSameTabPolling();
    const detach = attachI18nBridge();
    return () => {
      stopSameTabPolling();
      detach();
    };
  }, []);

  return children;
}
```

- [ ] **Step 4.12: Wire `ConsentProvider` and `Toaster` into `main.jsx`; remove eager Sentry init**

Replace `src/main.jsx` with:

```jsx
import React from 'react';
import {createRoot} from "react-dom/client";
import App from './components/App';
import {Provider} from "react-redux";
import store from "./store";
import reportWebVitals from './reportWebVitals';
import {NoticeProvider} from "./components/notice/NoticeContext";
import NoticeBanner from "./components/notice/NoticeBanner";
import {ConsentProvider} from "./components/consent/ConsentProvider";
import {Toaster} from "./components/ui/sonner";
import "./i18n/i18n";

import '@fontsource-variable/inter';
import 'bootswatch/dist/darkly/bootstrap.min.css';
import './index.css';
import './styles/global.css';
import './styles/globals.css';

const root = createRoot(document.getElementById('root'));

root.render(
    <React.StrictMode>
        <ConsentProvider>
            <NoticeProvider>
                <NoticeBanner/>
                <Provider store={store}>
                    <App/>
                </Provider>
            </NoticeProvider>
            <Toaster richColors closeButton position="top-right" theme="dark"/>
        </ConsentProvider>
    </React.StrictMode>
);

reportWebVitals();
```

This file no longer imports `@sentry/react` or calls `Sentry.init`. That moves to Task 5. The `NoticeProvider` and `NoticeBanner` still live at their original paths in this commit; only the visual `NoticeBanner` swaps file location in Task 6.

- [ ] **Step 4.13: Replace `App.jsx` to drop `react-cookie-consent` + `ToastContainer`**

Replace `src/components/App.jsx` with:

```jsx
import React from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Container from "./Container";

const Info = React.lazy(() => import('../pages/info/Info'));
const List = React.lazy(() => import('../pages/list/List'));
const Map = React.lazy(() => import('../pages/map/Map'));
const Stats = React.lazy(() => import('../pages/stats/Stats'));
const Credit = React.lazy(() => import('../pages/credit/Credit'));
const Api = React.lazy(() => import('../pages/api/Api'));
const NotFound = React.lazy(() => import('../pages/NotFound'));

const Loading = () => (
    <div className="d-flex justify-content-center align-items-center" style={{height: '100vh'}}>
        <div className="spinner-border text-primary" role="status" style={{width: '3rem', height: '3rem'}}>
            <span className="visually-hidden">Loading...</span>
        </div>
    </div>
);

const App = () => (
    <BrowserRouter>
        <React.Suspense fallback={<Loading />}>
            <Routes>
                <Route path="/" element={<Container view={<List/>}/>}/>
                <Route path="/servers/:serverId" element={<Container view={<Info/>}/>}/>
                <Route path="/stats" element={<Container view={<Stats/>}/>}/>
                <Route path="/map" element={<Container view={<Map/>}/>}/>
                <Route path="/credit" element={<Container view={<Credit/>}/>}/>
                <Route path="/api" element={<Container view={<Api/>}/>}/>
                <Route path="*" element={<Container view={<NotFound/>}/>}/>
            </Routes>
        </React.Suspense>
    </BrowserRouter>
);

export default App;
```

This drops the `<ToastContainer>` (replaced by `<Toaster>` in `main.jsx`) and the `<CookieConsent>` block (replaced by Silktide). The `useTranslation()` hook and its imports are removed because they had no remaining use after the consent block was deleted. The Container path is updated in Task 6.

- [ ] **Step 4.14: Run the full test suite — must remain green**

```bash
pnpm test --run
```

Expected: every test passes. The existing `App.test.jsx` should still render.

- [ ] **Step 4.15: Manual verification**

Run `pnpm start`. Open `http://localhost:3185/`. The Silktide banner should appear. Click "accept" — DevTools → Application → Local Storage shows `silktideCookieChoices` with `{analytics: true, ...}`. Reload — the banner does not re-appear.

- [ ] **Step 4.16: Commit**

```bash
git add index.html src/components/consent src/main.jsx src/components/App.jsx
git commit -m "feat(consent): replace react-cookie-consent with Silktide CMP + useConsent adapter

Mounts the Silktide CDN script in index.html (deferred). Adds a thin React
adapter — silktideClient + useConsent (useSyncExternalStore) +
ConsentProvider + i18nBridge — that exposes a stable internal API so
swapping CMPs later is a single-file change. Storage events catch
cross-tab updates; a 500ms poll catches same-tab updates Silktide makes.
The 27 existing cookie-notice i18n keys are reused via Silktide's
updateCookieBannerConfig. The old react-cookie-consent component and the
react-toastify ToastContainer are removed from App.jsx; sonner's Toaster
replaces ToastContainer."
```

---

## Task 5: Defer Sentry init until Analytics consent (commit 05)

**Files:**
- Create: `src/components/consent/sentryGate.js`
- Create: `src/components/consent/sentryGate.test.js`
- Modify: `src/main.jsx` (import `sentryGate` once for its side effect)

- [ ] **Step 5.1: Write the failing test for `sentryGate`**

Create `src/components/consent/sentryGate.test.js`:

```js
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const initSpy = vi.fn();
const closeSpy = vi.fn();

vi.mock('@sentry/react', () => ({
  init: (...args) => initSpy(...args),
  getClient: () => ({ close: closeSpy }),
  browserTracingIntegration: () => ({ name: 'browserTracing' }),
  replayIntegration: () => ({ name: 'replay' }),
}));

const STORAGE_KEY = 'silktideCookieChoices';

function setConsent(value) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ analytics: value, functional: true, advertising: false, necessary: true }));
  window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
}

describe('sentryGate', () => {
  beforeEach(() => {
    initSpy.mockClear();
    closeSpy.mockClear();
    localStorage.clear();
    vi.resetModules();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not init Sentry when consent is unknown', async () => {
    await import('./sentryGate');
    expect(initSpy).not.toHaveBeenCalled();
  });

  it('inits Sentry exactly once when analytics consent is granted', async () => {
    await import('./sentryGate');
    setConsent(true);
    expect(initSpy).toHaveBeenCalledTimes(1);
    setConsent(true); // already granted, must not re-init
    expect(initSpy).toHaveBeenCalledTimes(1);
  });

  it('shuts Sentry down when consent is revoked after grant', async () => {
    await import('./sentryGate');
    setConsent(true);
    setConsent(false);
    expect(closeSpy).toHaveBeenCalledTimes(1);
  });

  it('does not call close when consent was never granted', async () => {
    await import('./sentryGate');
    setConsent(false);
    expect(closeSpy).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 5.2: Run the test — should FAIL**

```bash
pnpm test src/components/consent/sentryGate.test.js --run
```

Expected: FAIL with "Cannot find module './sentryGate'".

- [ ] **Step 5.3: Implement `sentryGate.js`**

Create `src/components/consent/sentryGate.js`:

```js
import * as Sentry from '@sentry/react';
import { readConsent, subscribe } from './silktideClient';

let started = false;

function initSentry() {
  Sentry.init({
    dsn: 'https://273bce475a7d46cdb126ba29bd99f867@o508489.ingest.sentry.io/4505483920998400',
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracePropagationTargets: [/^https:\/\/backend\.scplist\.kr\/api/],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
  started = true;
}

function shutdownSentry() {
  Sentry.getClient()?.close();
  started = false;
}

function evaluate() {
  const { granted } = readConsent('analytics');
  if (granted && !started) initSentry();
  else if (!granted && started) shutdownSentry();
}

// Evaluate at import time in case consent was already granted on a prior visit.
evaluate();
subscribe(evaluate);
```

- [ ] **Step 5.4: Re-run the test — should PASS**

```bash
pnpm test src/components/consent/sentryGate.test.js --run
```

Expected: 4 tests PASS.

- [ ] **Step 5.5: Wire `sentryGate` into `main.jsx`**

Edit `src/main.jsx` — add the import line near the top (after the React imports, before the CSS imports):

```js
import './components/consent/sentryGate';
```

The import is for its side effect (the gate self-registers).

- [ ] **Step 5.6: Manual verification — Sentry stays off when analytics consent is denied**

Run `pnpm start`. Open `http://localhost:3185/` in a fresh browser profile (no prior consent). DevTools → Network → filter `sentry`. Reject analytics in the Silktide banner. Reload. Expected: no requests to `*.sentry.io`.

Then accept analytics. Trigger an error from the DevTools console:

```js
throw new Error('manual sentryGate test');
```

Expected: a POST appears in the Network tab to a Sentry endpoint.

- [ ] **Step 5.7: Run full test suite**

```bash
pnpm test --run
```

Expected: all tests PASS.

- [ ] **Step 5.8: Commit**

```bash
git add src/components/consent/sentryGate.js src/components/consent/sentryGate.test.js src/main.jsx
git commit -m "feat(observability): defer Sentry init until Analytics consent

main.jsx no longer calls Sentry.init at module load. A small sentryGate
subscribes to consent changes: on grant it calls Sentry.init with the
existing config; on revoke it calls getClient()?.close() and clears the
binding. Errors that occur before consent are not captured — that is the
GDPR-correct behavior and is intentional. Tested with mocked @sentry/react."
```

---

## Task 6: Rebuild application shell with shadcn (commit 06)

**Files:**
- Create: `src/components/shell/Container.jsx`
- Create: `src/components/shell/TopMenu.jsx`
- Create: `src/components/shell/Footer.jsx`
- Create: `src/components/shell/SafeHtml.jsx`
- Create: `src/components/shell/NoticeBanner.jsx`
- Create: `src/components/shell/Container.test.jsx`
- Modify: `src/components/App.jsx` (update Container import; replace Loading)
- Modify: `src/main.jsx` (update NoticeBanner import to shell path)

- [ ] **Step 6.1: Write the failing smoke test for the new shell**

Create `src/components/shell/Container.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Container from './Container';

describe('Container (shell)', () => {
  it('renders TopMenu navigation links and the embedded view', () => {
    render(
      <MemoryRouter>
        <Container view={<div data-testid="page-body">page</div>}/>
      </MemoryRouter>
    );
    expect(screen.getByTestId('page-body')).toBeInTheDocument();
    expect(screen.getAllByRole('link').length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 6.2: Run the test — should FAIL**

```bash
pnpm test src/components/shell/Container.test.jsx --run
```

Expected: FAIL with "Cannot find module './Container'".

- [ ] **Step 6.3: Write `src/components/shell/Container.jsx`**

```jsx
import React from 'react';
import TopMenu from './TopMenu';
import Footer from './Footer';

export default function Container({ view }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <TopMenu />
      <main className="flex-1">{view}</main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 6.4: Write `src/components/shell/TopMenu.jsx`**

```jsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { List, BarChart3, Map as MapIcon, Settings2, Code2, Menu } from 'lucide-react';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '../ui/sheet';
import { Separator } from '../ui/separator';
import LanguageSelect from '../topmenu/LanguageSelect';
import SiSelect from '../topmenu/SiSelect';
import { cn } from '../../lib/cn';

function buildNavItems(t) {
  return [
    { to: '/',       end: true,  icon: List,      label: t('navbar.server-list') },
    { to: '/stats',  end: false, icon: BarChart3, label: t('navbar.all-stats') },
    { to: '/map',    end: false, icon: MapIcon,   label: t('navbar.all-server-map') },
    { to: '/api',    end: false, icon: Settings2, label: 'API' },
    { to: '/credit', end: false, icon: Code2,     label: t('navbar.credit') || 'Credit' },
  ];
}

function NavItem({ to, end, icon: Icon, label, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
          'text-muted-foreground hover:text-foreground hover:bg-muted',
          isActive && 'text-foreground bg-muted'
        )
      }
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </NavLink>
  );
}

export default function TopMenu() {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = buildNavItems(t);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 items-center px-4 gap-3">
        <NavLink to="/" className="flex items-center gap-2 font-semibold text-foreground">
          <img src="/favicon-32x32.png" alt="" width="20" height="20" />
          <span className="hidden sm:inline">{t('navbar.title')}</span>
        </NavLink>

        <nav className="hidden lg:flex items-center gap-1 ml-4">
          {items.map((item) => <NavItem key={item.to} {...item} />)}
        </nav>

        <div className="flex-1" />

        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">{t('navbar.language')}</span>
            <LanguageSelect />
          </div>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">{t('navbar.unit')}</span>
            <div style={{ minWidth: 140 }}><SiSelect /></div>
          </div>
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] flex flex-col">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <nav className="flex flex-col gap-1 mt-6">
              {items.map((item) => (
                <NavItem key={item.to} {...item} onClick={() => setMobileOpen(false)} />
              ))}
            </nav>
            <Separator className="my-4" />
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">{t('navbar.language')}</span>
                <LanguageSelect />
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">{t('navbar.unit')}</span>
                <div style={{ minWidth: 140 }}><SiSelect /></div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
```

This file *temporarily* imports `LanguageSelect` and `SiSelect` from the legacy path (`src/components/topmenu/`). Plan B modernizes them.

- [ ] **Step 6.5: Write `src/components/shell/SafeHtml.jsx` (sanitized HTML renderer)**

The legacy Footer rendered `t('footer.notice')` as raw HTML. Translations are repo-controlled, but funneling them through DOMPurify removes any future XSS risk.

```jsx
import React, { useMemo } from 'react';
import DOMPurify from 'isomorphic-dompurify';

const ALLOWED = {
  ALLOWED_TAGS: ['a', 'b', 'i', 'em', 'strong', 'br', 'span', 'p'],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
};

export default function SafeHtml({ html, className }) {
  const clean = useMemo(() => DOMPurify.sanitize(html ?? '', ALLOWED), [html]);
  return <span className={className} dangerouslySetInnerHTML={{ __html: clean }} />;
}
```

- [ ] **Step 6.6: Write `src/components/shell/Footer.jsx`**

```jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Github } from 'lucide-react';
import { Button } from '../ui/button';
import SafeHtml from './SafeHtml';

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card mt-12">
      <div className="mx-auto px-4 py-10 grid gap-10 md:grid-cols-3 max-w-screen-xl">
        <div>
          <h5 className="text-sm font-semibold text-foreground mb-2">{t('navbar.title')}</h5>
          <p className="text-sm text-muted-foreground">
            SCP: SL server list with filtering options, trends and statistics.
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            Copyright © 2020-{year}. Horyu (류현오) All rights reserved.
          </p>
        </div>
        <div>
          <h5 className="text-sm font-semibold text-foreground mb-2">Links</h5>
          <ul className="space-y-1 text-sm">
            <li><a href="/"        className="text-muted-foreground hover:text-foreground">Home</a></li>
            <li><a href="/stats"   className="text-muted-foreground hover:text-foreground">Statistics</a></li>
            <li><a href="/map"     className="text-muted-foreground hover:text-foreground">Server Map</a></li>
            <li><a href="/api"     className="text-muted-foreground hover:text-foreground">API</a></li>
            <li><a href="/credit"  className="text-muted-foreground hover:text-foreground" target="_blank" rel="noreferrer">Credit / Third Party Licenses</a></li>
          </ul>
        </div>
        <div>
          <h5 className="text-sm font-semibold text-foreground mb-2">Translation</h5>
          <p className="text-sm text-muted-foreground mb-3">I'm looking for applicants for site translation.</p>
          <Button asChild variant="outline" size="sm">
            <a href="https://github.com/horyu1234/sl-servers-frontend" target="_blank" rel="noreferrer" className="gap-2">
              <Github className="h-4 w-4" /> Contribute on GitHub
            </a>
          </Button>
          <div className="mt-4 text-xs text-muted-foreground">
            <SafeHtml html={t('footer.notice')} />
          </div>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 6.7: Write `src/components/shell/NoticeBanner.jsx`**

```jsx
import React, { useContext } from 'react';
import { NoticeContext } from '../notice/NoticeContext';
import { Alert, AlertDescription } from '../ui/alert';
import { cn } from '../../lib/cn';

const VARIANT_BY_LEGACY_CLASS = {
  primary:   'border-primary/40 text-foreground',
  success:   'border-primary/40 text-foreground',
  info:      'border-blue-500/40 text-foreground',
  warning:   'border-warning/40 text-foreground',
  danger:    'border-destructive/40 text-foreground',
  secondary: 'border-border text-foreground',
};

export default function NoticeBanner() {
  const notice = useContext(NoticeContext);
  if (!notice) return null;

  const [legacyClass, ...rest] = notice.split(',');
  const message = rest.join(',');
  const variantClass = VARIANT_BY_LEGACY_CLASS[legacyClass] ?? VARIANT_BY_LEGACY_CLASS.secondary;

  return (
    <Alert className={cn('rounded-none border-x-0 border-t-0', variantClass)}>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
```

- [ ] **Step 6.8: Update `App.jsx` — Container path + Tailwind Loading spinner**

Edit `src/components/App.jsx` — change two things only:

1. The Container import:
   ```jsx
   import Container from "./shell/Container";
   ```
2. Replace the `Loading` component with the Tailwind version:
   ```jsx
   const Loading = () => (
       <div className="flex items-center justify-center" style={{height: '100vh'}}>
           <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
       </div>
   );
   ```

The rest of `App.jsx` is unchanged from Step 4.13.

- [ ] **Step 6.9: Update `main.jsx` — NoticeBanner shell path**

Edit `src/main.jsx`:

```jsx
import NoticeBanner from "./components/shell/NoticeBanner";
```

`NoticeProvider` import path stays (`./components/notice/NoticeContext`).

- [ ] **Step 6.10: Run the smoke test — should PASS**

```bash
pnpm test src/components/shell/Container.test.jsx --run
```

Expected: PASS.

- [ ] **Step 6.11: Run full test suite**

```bash
pnpm test --run
```

Expected: every test PASSES. The existing `App.test.jsx` may need a tiny tweak if it asserted on a Bootstrap class — adjust it to assert on a stable role/text instead.

- [ ] **Step 6.12: Manual visual verification**

Run `pnpm start`. Visit each route — `/`, `/stats`, `/map`, `/api`, `/credit`, `/servers/<any-id>`. Each should render with the new sticky shell at top and the new footer at bottom (page bodies are still legacy until Plans B–E).

Resize the viewport ≤ 1024px wide → desktop nav collapses, Menu (☰) icon appears top-right → opens a right Sheet with the nav links and selectors. Resize back → nav restores.

- [ ] **Step 6.13: Commit**

```bash
git add src/components/shell src/components/App.jsx src/main.jsx
git commit -m "feat(shell): rebuild Container/TopMenu/Footer/NoticeBanner with shadcn

Moves the application shell into src/components/shell/. TopMenu becomes a
sticky header with a desktop nav row + a mobile Sheet drawer triggered by
a Menu icon (lucide-react). Footer is a Tailwind 3-column grid; the
legacy raw inner-HTML for footer.notice is now funneled through SafeHtml
(DOMPurify-backed). NoticeBanner maps the legacy 'class,message' notice
string into shadcn Alert variants. LanguageSelect and SiSelect are reused
from the legacy path unchanged — they get modernized in Plan B.

The Loading fallback in App.jsx is rebuilt with a Tailwind spinner so the
last Bootstrap-spinner reference is gone from the shell. Routes and their
lazy chunks are unchanged."
```

---

## Self-review summary (recorded for the executor)

This plan covers spec sections §3, §4 (modules + state), §5.1 + §5.5 (primitives + consent components), §7 (consent design), §10 commits 01–06, and §11 testing strategy items for commits 04, 05, 06.

It does **not** cover §5.2 (ServerRow), §5.3 (ServerSparkline), §5.4 (Filter components), §6 (data flow), §8 (responsive list rules), or §9 (page-level error handling) — those land in Plan B (List page) and the per-page Plans C–E.

Risks called out in the spec that this plan touches:
- **Silktide JS API undocumented** — addressed by Step 4.0 spike + adapter encapsulation.
- **Bundle size** — measurement deferred to Plan F as planned.

---

## Plan complete — execution handoff

**Two execution options:**

**1. Subagent-Driven (recommended)** — Dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using the executing-plans skill, batch execution with checkpoints.

Choose by replying with **1** or **2**.

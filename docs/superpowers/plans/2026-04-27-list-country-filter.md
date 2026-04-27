# List Country Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a country multi-select filter to the server list page (sidebar + drawer) by reusing the existing `CountryMultiSelect` from the Stats page.

**Architecture:** The data pipeline (URL ↔ schema ↔ Redux ↔ chips ↔ drawer count) already routes `countryFilter`. This plan only fills in the missing UI: a tiny prop addition to `CountryMultiSelect` for narrow containers, a labeled selector block in `FilterControls`, and one new i18n key in 27 locale files.

**Tech Stack:** React, vitest, @testing-library/react, react-i18next, shadcn/ui (Popover + Command), Tailwind.

**Spec:** `docs/superpowers/specs/2026-04-27-list-country-filter-design.md`

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `src/components/stats/CountryMultiSelect.jsx` | Modify | Accept optional `minPopoverWidth` prop (default 320) so the popover can fit narrower triggers like the 240px filter sidebar without changing existing stats-page behavior. |
| `src/components/filters/FilterControls.jsx` | Modify | Insert a labeled `CountryMultiSelect` block between the search input and the first separator. Reads/writes `value.countryFilter` via the existing `set` helper. |
| `src/components/filters/FilterControls.test.jsx` | Create | Verify the country selector renders with the i18n label and that toggling a country fires `onChange` with a `countryFilter` patch. |
| `src/i18n/locale/*.json` (27 files) | Modify | Add `filter-option.country` key with the native translation. Inserted between `server-search` and `hide-empty`. |

Each file changes for one reason; the work decomposes naturally per file.

---

## Task 1: Add `minPopoverWidth` prop to `CountryMultiSelect`

**Files:**
- Modify: `src/components/stats/CountryMultiSelect.jsx`

The current component hardcodes `minWidth: 320` on the `PopoverContent`. We add an optional prop that defaults to `320` (zero behavior change for stats) so the filter sidebar can pass `240` and keep the popover within the sidebar width.

- [ ] **Step 1: Edit `CountryMultiSelect.jsx` signature and PopoverContent style**

Open `src/components/stats/CountryMultiSelect.jsx` and apply two edits.

Edit A — function signature:

```jsx
export function CountryMultiSelect({ value, onChange }) {
```

becomes

```jsx
export function CountryMultiSelect({ value, onChange, minPopoverWidth = 320 }) {
```

Edit B — `PopoverContent` style:

```jsx
        <PopoverContent
          className="p-0"
          align="start"
          sideOffset={4}
          style={{ width: 'var(--radix-popover-trigger-width)', minWidth: 320 }}
        >
```

becomes

```jsx
        <PopoverContent
          className="p-0"
          align="start"
          sideOffset={4}
          style={{ width: 'var(--radix-popover-trigger-width)', minWidth: minPopoverWidth }}
        >
```

- [ ] **Step 2: Run the existing test suite to ensure no regressions**

Run: `pnpm test --run`

Expected: all tests pass (this prop change does not break any existing call site — Stats page passes no `minPopoverWidth`, defaults to 320).

- [ ] **Step 3: Commit**

```bash
git add src/components/stats/CountryMultiSelect.jsx
git commit -m "feat(country-multi-select): add minPopoverWidth prop for narrow containers

Filter sidebar (w-60 = 240px) needs the popover to match the trigger
width instead of forcing 320px. Default stays 320px so the stats page
behavior is unchanged."
```

---

## Task 2: Add `filter-option.country` key to `en-US`

**Files:**
- Modify: `src/i18n/locale/en-US.json`

The English source-of-truth gets the key first. Other locales follow in Task 3 so we can verify the JSON is valid before fanning out.

- [ ] **Step 1: Insert the key into `en-US.json`**

Find the `filter-option` block:

```json
  "filter-option": {
    "server-search": {
      "name": "Server Search",
      "placeholder": "Enter search terms"
    },
    "hide-empty": "Hide empty servers",
```

Insert `"country": "Country",` between the closing brace of `server-search` and the `hide-empty` line:

```json
  "filter-option": {
    "server-search": {
      "name": "Server Search",
      "placeholder": "Enter search terms"
    },
    "country": "Country",
    "hide-empty": "Hide empty servers",
```

- [ ] **Step 2: Verify JSON is still valid**

Run: `python3 -c "import json; json.load(open('src/i18n/locale/en-US.json'))"`

Expected: command exits 0, no traceback.

- [ ] **Step 3: Commit**

```bash
git add src/i18n/locale/en-US.json
git commit -m "i18n(en): add filter-option.country key for the list page country filter"
```

---

## Task 3: Add `filter-option.country` to the remaining 26 locales

**Files (modify each):**
- `src/i18n/locale/bg-BG.json`
- `src/i18n/locale/ca-ES.json`
- `src/i18n/locale/cs-CZ.json`
- `src/i18n/locale/de-DE.json`
- `src/i18n/locale/dk-DK.json`
- `src/i18n/locale/ee-EE.json`
- `src/i18n/locale/eo-EO.json`
- `src/i18n/locale/es-ES.json`
- `src/i18n/locale/fi-FI.json`
- `src/i18n/locale/fr-FR.json`
- `src/i18n/locale/is-IS.json`
- `src/i18n/locale/it-IT.json`
- `src/i18n/locale/ko-KR.json`
- `src/i18n/locale/lij-IT.json`
- `src/i18n/locale/lv-LV.json`
- `src/i18n/locale/nb-NO.json`
- `src/i18n/locale/pl-PL.json`
- `src/i18n/locale/pt-BR.json`
- `src/i18n/locale/ru-RU.json`
- `src/i18n/locale/sv-SV.json`
- `src/i18n/locale/th-TH.json`
- `src/i18n/locale/tr-TR.json`
- `src/i18n/locale/uk-UA.json`
- `src/i18n/locale/zh-CN.json`
- `src/i18n/locale/zh-LZH.json`
- `src/i18n/locale/zh-TW.json`

For each file, the pattern is identical to en-US: insert the `"country": "<native>",` line immediately after the `server-search` block's closing `},` and immediately before the `hide-empty` line. The JSON formatting style in each file already uses 2-space indentation and trailing commas appropriately — copy the existing indentation level of the `hide-empty` line.

- [ ] **Step 1: Insert per-locale translations**

Apply each file with its translation:

| File | Value |
|---|---|
| `bg-BG.json` | `"country": "Държава",` |
| `ca-ES.json` | `"country": "País",` |
| `cs-CZ.json` | `"country": "Země",` |
| `de-DE.json` | `"country": "Land",` |
| `dk-DK.json` | `"country": "Land",` |
| `ee-EE.json` | `"country": "Riik",` |
| `eo-EO.json` | `"country": "Lando",` |
| `es-ES.json` | `"country": "País",` |
| `fi-FI.json` | `"country": "Maa",` |
| `fr-FR.json` | `"country": "Pays",` |
| `is-IS.json` | `"country": "Land",` |
| `it-IT.json` | `"country": "Paese",` |
| `ko-KR.json` | `"country": "국가",` |
| `lij-IT.json` | `"country": "Paeize",` |
| `lv-LV.json` | `"country": "Valsts",` |
| `nb-NO.json` | `"country": "Land",` |
| `pl-PL.json` | `"country": "Kraj",` |
| `pt-BR.json` | `"country": "País",` |
| `ru-RU.json` | `"country": "Страна",` |
| `sv-SV.json` | `"country": "Land",` |
| `th-TH.json` | `"country": "ประเทศ",` |
| `tr-TR.json` | `"country": "Ülke",` |
| `uk-UA.json` | `"country": "Країна",` |
| `zh-CN.json` | `"country": "国家",` |
| `zh-LZH.json` | `"country": "國",` |
| `zh-TW.json` | `"country": "國家",` |

For each: open the file, find the `server-search` block end (`},`) followed by the `hide-empty` line, and insert the new line between them at the same indentation.

Concrete example for `ko-KR.json` — locate:

```json
    "server-search": {
      "name": "서버 검색",
      "placeholder": "검색어 입력"
    },
    "hide-empty": "빈 서버 숨기기",
```

and change to:

```json
    "server-search": {
      "name": "서버 검색",
      "placeholder": "검색어 입력"
    },
    "country": "국가",
    "hide-empty": "빈 서버 숨기기",
```

- [ ] **Step 2: Validate every locale JSON**

Run:

```bash
for f in src/i18n/locale/*.json; do python3 -c "import json,sys; json.load(open('$f'))" || echo "BROKEN: $f"; done
```

Expected: no `BROKEN:` lines printed.

- [ ] **Step 3: Confirm every locale now has the key**

Run:

```bash
for f in src/i18n/locale/*.json; do python3 -c "import json,sys; d=json.load(open('$f')); assert 'country' in d.get('filter-option',{}), '$f'" || echo "MISSING: $f"; done
```

Expected: no `MISSING:` lines printed.

- [ ] **Step 4: Run the test suite**

Run: `pnpm test --run`

Expected: all tests pass (no test depends on a missing key).

- [ ] **Step 5: Commit**

```bash
git add src/i18n/locale/
git commit -m "i18n: add filter-option.country to all non-English locales

Native translation per locale; inserted between server-search and
hide-empty to match key ordering."
```

---

## Task 4: Add country selector to `FilterControls` (TDD)

**Files:**
- Create: `src/components/filters/FilterControls.test.jsx`
- Modify: `src/components/filters/FilterControls.jsx`

Test the integration: when `FilterControls` is rendered with a default-shaped `value`, the country Label is present, and toggling a country in the popover yields an `onChange` call with the patched `countryFilter` array.

We use the same Provider/MemoryRouter/i18n setup as `List.test.jsx`. We mock the country list API so `CountryMultiSelect` populates predictable options.

- [ ] **Step 1: Write the failing test**

Create `src/components/filters/FilterControls.test.jsx` with:

```jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import store from '../../store';
import '../../i18n/i18n';
import { DEFAULT_FILTER } from './filterSchema';

vi.mock('../../lib/api/countries', () => ({
  getCountryListAPI: vi.fn().mockResolvedValue({ data: ['KR', 'US'] }),
}));

import { FilterControls } from './FilterControls';

describe('FilterControls country selector', () => {
  it('renders the country label', () => {
    render(
      <Provider store={store}>
        <FilterControls value={DEFAULT_FILTER} onChange={() => {}} />
      </Provider>
    );
    expect(screen.getByText('Country')).toBeInTheDocument();
  });

  it('emits a countryFilter patch when a country is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Provider store={store}>
        <FilterControls value={DEFAULT_FILTER} onChange={onChange} />
      </Provider>
    );

    // Open the popover via the combobox trigger
    const trigger = screen.getByRole('combobox');
    await user.click(trigger);

    // Wait for the country options to appear
    await waitFor(() => expect(screen.getByText(/South Korea|Korea/)).toBeInTheDocument());

    // Click an option
    await user.click(screen.getByText(/South Korea|Korea/));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ countryFilter: ['KR'] })
    );
  });
});
```

- [ ] **Step 2: Run the test and watch it fail**

Run: `pnpm test --run src/components/filters/FilterControls.test.jsx`

Expected: both tests FAIL — the first because no element with text "Country" exists; the second because `getByRole('combobox')` finds nothing (no popover trigger in `FilterControls` yet).

- [ ] **Step 3: Add the country selector to `FilterControls.jsx`**

Edit `src/components/filters/FilterControls.jsx`. Two edits:

Edit A — add the import alongside the existing imports near the top:

```jsx
import { Separator } from '@/components/ui/separator';
```

becomes (insert one line after it):

```jsx
import { Separator } from '@/components/ui/separator';
import { CountryMultiSelect } from '../stats/CountryMultiSelect';
```

Edit B — insert the country block between the search input wrapper and the first `<Separator />`. Find:

```jsx
      <div className="space-y-1.5">
        <Label htmlFor="filter-search" className="text-xs uppercase tracking-wider text-muted-foreground">
          {t('filter-option.server-search.name')}
        </Label>
        <Input
          id="filter-search"
          value={value.search}
          onChange={(e) => set({ search: e.target.value })}
          placeholder={t('filter-option.server-search.placeholder')}
        />
      </div>

      <Separator />
```

and replace with:

```jsx
      <div className="space-y-1.5">
        <Label htmlFor="filter-search" className="text-xs uppercase tracking-wider text-muted-foreground">
          {t('filter-option.server-search.name')}
        </Label>
        <Input
          id="filter-search"
          value={value.search}
          onChange={(e) => set({ search: e.target.value })}
          placeholder={t('filter-option.server-search.placeholder')}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          {t('filter-option.country')}
        </Label>
        <CountryMultiSelect
          value={value.countryFilter}
          onChange={(next) => set({ countryFilter: next })}
          minPopoverWidth={240}
        />
      </div>

      <Separator />
```

- [ ] **Step 4: Run the test and watch it pass**

Run: `pnpm test --run src/components/filters/FilterControls.test.jsx`

Expected: both tests PASS.

- [ ] **Step 5: Run the full test suite**

Run: `pnpm test --run`

Expected: every test passes.

- [ ] **Step 6: Commit**

```bash
git add src/components/filters/FilterControls.jsx src/components/filters/FilterControls.test.jsx
git commit -m "feat(list): add country filter to FilterControls

Reuses CountryMultiSelect from the stats page (with the new
minPopoverWidth prop set to 240 so the popover fits inside the w-60
sidebar). The schema, URL sync, Redux dispatch, chips, and drawer
active-count already handle countryFilter — this connects the UI."
```

---

## Task 5: Manual smoke verification

**Files:** none

Vitest cannot exercise the full URL ↔ Redux ↔ network round-trip in a real browser, so we verify the wiring end-to-end by hand.

- [ ] **Step 1: Start the dev server**

Run: `pnpm start`

Expected: Vite reports the app is up at `http://localhost:3185/`.

- [ ] **Step 2: Verify the desktop sidebar selector**

Open `http://localhost:3185/list` at a viewport ≥ 1024px wide.

Check:
- Country label appears between Search and the hide-empty/hide-full checkboxes in the left sidebar.
- Clicking the trigger opens a popover with a search input and a scrollable list of countries with flags and names.
- Selecting "South Korea" adds a `?country=KR` parameter to the URL.
- A "South Korea" chip appears in the chip row above the list.
- The server list refetches and shows only KR-flagged servers.
- Removing the chip clears `?country=` from the URL and brings the full list back.

- [ ] **Step 3: Verify the mobile drawer selector**

Resize to ≤ 1023px viewport (or open DevTools mobile emulation).

Check:
- The sidebar disappears; the "Filter Options" button appears in the header strip.
- Clicking it opens the drawer; the country block sits in the same position (right under search).
- Selecting a country bumps the badge count on the drawer trigger by one.
- Closing the drawer keeps the chip visible in the header chip row.

- [ ] **Step 4: Verify another locale renders the key**

Switch language to Korean via the navbar dropdown.

Check:
- The country Label reads "국가".
- No raw `filter-option.country` string is visible anywhere.

- [ ] **Step 5: Stop the dev server**

Press `Ctrl+C` in the terminal running `pnpm start`.

- [ ] **Step 6: No commit needed**

Manual verification produces no code changes.

---

## Self-Review Checklist (run after writing this plan)

- [x] **Spec coverage:** every section of the spec maps to a task — `CountryMultiSelect` prop (Task 1), i18n key in en-US (Task 2) and 26 other locales (Task 3), `FilterControls` integration with TDD (Task 4), manual verification of sidebar + drawer + locale render (Task 5).
- [x] **Placeholder scan:** no TBD/TODO/"add appropriate handling"/"similar to Task N"; every code step shows the exact code.
- [x] **Type consistency:** prop name `minPopoverWidth` is identical across Task 1 (definition), Task 4 Step 3 (call site), and the spec.
- [x] **No dangling references:** `set` (already defined in `FilterControls.jsx`), `value.countryFilter` (already in schema), `CountryMultiSelect` (existing module) — every reference resolves to existing or earlier-defined code.

# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Build/Run Commands
- `pnpm start` - Start development server on port 3185
- `pnpm build` - Build production version
- `pnpm test` - Run all tests
- `pnpm test src/path/to/file.test.ts` - Run a specific test file
- `pnpm typecheck` - Type check the app (`tsconfig.json`), the build config (`tsconfig.node.json`) and the edge function (`tsconfig.functions.json`)

## Code Style Guidelines
- WebStorm default code formatting settings are used
- Code is TypeScript with `strict` on: components use `.tsx`, everything else uses `.ts`
- Do not use `any` or `@ts-ignore`. If a cast or `!` is really needed, say why in a comment
- API response types live in `src/types/api.ts` and mirror the Kotlin classes in `sl-servers-api`; change them together
- Functional components with hooks are preferred over class components
- Redux for state management with async actions using thunks
- Import order: React, third-party libraries, local components, styles
- Use destructuring for props and state variables
- Component file names use PascalCase (e.g., `ServerList.tsx`)
- Utility files use camelCase (e.g., `apiClient.ts`)
- CSS modules with specific files for component styles
- Error handling should use try/catch with appropriate error dispatch
- i18n/localization uses i18next with separate locale files

## Project Structure
- `/src/components/` - Reusable UI components
- `/src/pages/` - Page-level components for routes
- `/src/modules/` - Redux actions, reducers, and selectors. Use `useAppDispatch` and `useAppSelector` from `hooks.ts`
- `/src/lib/` - Code without UI: API clients, formatting, hooks, and the list filter schema in `lib/filters`
- `/src/site/` - Pages as data: addresses, languages, page heads, page models and the written pages. The app and the edge function both import it
- `/src/i18n/` - Internationalization configuration and files
- `/src/types/` - Types shared across the app: API shapes, the license manifest, globals
- `/vite-plugins/` - Vite plugins used by the build
- `/src/edge/` - What the edge function does: reading the API, building pages, writing the HTML and the sitemaps
- `/functions/` - The entry of the Cloudflare Pages Function. Pages treats every file in it as a route, so it holds nothing else

## Pages and the Edge Function
- The site is a single-page app. The edge function (`functions/_middleware.ts`, with its code in `src/edge/`) runs on Cloudflare in front of it and gives each address its own `<head>`, the page's text inside `#root`, a real 404 status and the sitemaps. It replaces the tags between `<!--head:start-->` and `<!--head:end-->` in `index.html` and fills the empty `<div id="root"></div>`, so keep both.
- A page exists in three places that must agree:
  - its address in `ROUTE_PATTERNS` in `src/site/routes.ts`
  - its component in `src/components/pages.tsx`
  - its page model in `src/site/pages/`, which `src/edge/pages.ts` builds from the API
- The text of a page comes from its page model, so the app and the edge function show the same words. Draw a model with `ModelPage`, and add only what needs a browser, such as charts, as its children.
- Times are shown on the reader's clock, never as bare UTC. The data is cut into UTC hours and UTC days:
  - An hour goes through `hourWords` and the start of a day through `dayWords` (`src/site/pageModel.ts`), which also give the zone label, such as `UTC+9`. Do not write "UTC" into a locale string.
  - The app passes the browser's zone to the page models. The edge function passes the zone Cloudflare gives for the request, so both usually write the same words, and crawlers get UTC.
  - A daily number cannot be cut again in the browser, so its date stays the UTC day and the text says when that day starts.
- Code in `src/site/`, `src/edge/` and `functions/` runs without a DOM and is bundled by Cloudflare, not by Vite. Do not import React, browser globals or the `@/` alias there.
- Link to pages of the site with `LocaleLink`, `LocaleNavLink` or `useLocalePath`, and build addresses with `pathOf`. A plain `Link` drops the visitor's language prefix.
- Languages:
  - English is at the root. A language gets its own addresses, such as `/ko/`, once its locale file has every key of `en-US.json` (`PREFIXED_LANGUAGES` in `src/site/locales.ts`).
  - Add every new key to `en-US.json` and `ko-KR.json` together. A missing Korean key takes `/ko/` offline, and `src/site/locales.test.ts` fails.
- The written pages (about, data, ads, privacy, contact, API guide) are in `src/site/docs/`, in English and Korean with the same structure.
  - When the site starts or stops collecting something, loading a third-party service or showing ads, update `src/site/docs/privacy.ts` and the cookie banner texts in `index.html` in the same change.
- The edge function must never be the reason a page fails. It reads the API with a deadline, falls back to a page without numbers, and on any error serves the plain app.

## Ads
- The site shows Google AdSense ads to pay for its servers. `AdSlot` (`src/components/funding/Slot.tsx`) draws one ad with its label and the link to `/about/funding`, the page that says why the site has ads. `src/components/funding/loader.ts` loads the script.
- `/about/funding` (`src/site/docs/funding.ts`) tells visitors how ads are placed. Keep to it, or change the page in the same pull request:
  - A page shows one ad at most.
  - An ad sits between two parts of a page. It never sticks to the window, never covers content and never goes between the rows of the server list.
  - The written pages have no ad.
- AdSense rules that are easy to break:
  - No ad where there is no content: a 404, a loading screen, an error or an empty result.
  - The label says only "Advertisement" (`funding.label`). No text may ask visitors to look at or click on ads.
  - One request for each ad element. A new address gets a new ad; a filter or a tab does not.
  - Auto ads stay off in the AdSense account, because they add ads that cover the page.
- Do not name a file, a folder or an address after ads. The build names scripts after their files and ad blockers refuse such names, which breaks the page for their users.
- Ads are requested only on `scplist.kr`. On localhost and on previews a slot draws a box of the ad's size.
- The "Personalised ads" choice in the cookie banner decides only whether ads are personalised. Ads show either way.
  - Visitors in the EEA, the UK and Switzerland also get Google's own consent message, which is set up in the AdSense account.
- Google moves the frames of an ad between hosts. `frame-src` in `public/_headers` allows them by domain, and `loader.ts` reports a blocked one to Sentry.

## Third-Party Licenses
- `pnpm build` updates the license list on the credit page: `vite-plugins/thirdPartyLicenses.ts` reads the modules in the bundle and emits `third-party-licenses.json`. Do not maintain that list by hand.
- After adding, removing or upgrading a dependency, run `pnpm build` and check the new entries in `build/third-party-licenses.json`.
- Update these by hand, because the build cannot see them:
  - Code copied into the repository: put its license file next to the code and add it to `VENDORED` in `vite-plugins/thirdPartyLicenses.ts`.
  - Tools whose output skips the module graph, such as Tailwind: add them to `COMPILED_IN` in the same file.
  - Data and services used at runtime or through the backend: add them to `RESOURCES` in `src/pages/credit/ExternalResources.tsx`.

## Deployment
- The site deploys itself: Cloudflare Pages builds and publishes every push to `main`. Each PR gets a preview, and the preview talks to the production API.
- The API (`horyu1234/sl-servers-api`, checked out next to this repository) runs on its own server.
  - It is deployed by hand. Merging an API PR doesn't put it in production.
  - The steps are in that repository's `AGENTS.md`.
- The edge function reads the API at `api.scplist.kr` with the header `X-Scplist-Edge-Key`.
  - The key is the secret `EDGE_API_KEY` in the Cloudflare Pages project (Production and Preview) and `SCPLIST_EDGE_KEY` on the API server. They must be the same value.
  - Without the key, pages still work: they go out with their titles but without numbers, and the browser loads the data.
  - `public/_routes.json` lists the static files that skip the function. Add a new top-level static file there.
- Ship an API change before a frontend change that needs it.
  - The API ignores JSON fields and query parameters it doesn't know. A frontend that ships first shows options that do nothing.
  - Before merging the frontend, check that the production API already answers the new input.

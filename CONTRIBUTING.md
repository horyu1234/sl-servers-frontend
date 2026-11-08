# Contributing

Thanks for helping out. Please follow the [Code of Conduct](./CODE_OF_CONDUCT.md).

## Making a change

1. Fork the repository and clone your fork. The [README](./README.md#getting-started) lists the Node.js and pnpm versions you need.

   ```bash
   git clone git@github.com:<your-username>/sl-servers-frontend.git
   cd sl-servers-frontend
   pnpm install
   pnpm start
   ```

2. Create a branch for your change.
3. Make the change, and add tests next to the code you touch.
4. Run the type check, the tests and the build. CI runs the type check and the tests.

   ```bash
   pnpm typecheck
   pnpm test run
   pnpm build
   ```

5. Update the README if your change affects it.
6. Open a pull request against `main` and link any related issue.

## Project layout

| Path                     | Contents                                        |
| ------------------------ | ----------------------------------------------- |
| `src/pages/`             | Route pages                                     |
| `src/components/`        | Components, with shadcn/ui in `ui/`             |
| `src/modules/`           | Redux reducers and thunks                       |
| `src/lib/`               | API clients, formatters, hooks                  |
| `src/types/`             | Shared types, including API responses           |
| `src/i18n/`              | i18next setup and locale files                  |
| `src/data/language.json` | Language list                                   |
| `public/`                | Static files, including `_headers` and Silktide |
| `vite-plugins/`          | The plugin that generates the license list      |

## Translations

Locale files are in `src/i18n/locale/`. `en-US.json` is the source text, and a key missing from a locale falls back to English. Save locale files and `src/data/language.json` as UTF-8 without a BOM.

To fix or finish a translation, edit that language's file. Translators are credited on the credits page, so add your name to the language's `contributors` list in `src/data/language.json`.

To add a language:

1. Copy `en-US.json` to a new file named like the existing ones, such as `pt-BR.json`.
2. Import it in `src/i18n/i18n.ts` and add it to `resource`.
3. Add its `code`, `name` and `contributors` to `src/data/language.json`. The language selector, browser language matching and the credits page all read this list.
4. Add a mapping if the name doesn't work as is: `src/i18n/intlLocale.ts` when `Intl` can't read the file name, and `src/i18n/siteLanguage.ts` when a browser's language code doesn't lead to the file.
5. Run `pnpm test run src/i18n`, then `pnpm start` and pick the language from the language menu.

## Code style

The code uses WebStorm's default formatting and there is no linter, so match the code around your change.

- Write TypeScript with `strict` on: `.tsx` for components and `.ts` for everything else.
- Don't use `any` or `@ts-ignore`. If you need a cast or `!`, say why in a comment.
- Write function components with hooks.
- Name component files in PascalCase (`ServerRow.tsx`) and other files in camelCase (`tileUrl.ts`).
- Keep shared state in Redux under `src/modules/`, with thunks for async actions. Use `useAppSelector` and `useAppDispatch` from `src/modules/hooks.ts`. In thunks, catch failed requests and dispatch a failure action.
- Put API calls in `src/lib/api/` and response types in `src/types/api.ts`. Keep the types in line with what the API returns.
- Style with Tailwind classes. Separate CSS files are only for restyling third-party widgets, as in `map.css`.
- Order imports: React, third-party libraries, local components, styles.
- Destructure props and state.
- Add text that users see to `src/i18n/locale/en-US.json` and read it through i18next.

## Third-party code

`pnpm build` generates the license list on the credits page from the modules in the bundle, so a new package needs no manual entry. A few things need updating by hand, because the build can't see them:

- Code copied into the repository: put its license file next to the code and add it to `VENDORED` in `vite-plugins/thirdPartyLicenses.ts`.
- Tools whose output skips the module graph, such as Tailwind: add them to `COMPILED_IN` in the same file.
- Data and services used at runtime or through the backend: add them to `RESOURCES` in `src/pages/credit/ExternalResources.tsx`.

## Questions

Email support@scplist.kr.

# SCP: Secret Laboratory Server List

Frontend for [scplist.kr](https://scplist.kr), a community-run list of public *SCP: Secret Laboratory* servers.

This repository only holds the website. The API and the data collector are maintained separately.

## Features

- Server list with search, filters and sorting, in the game's own order by default. It has list and card views, both with a seven-day player trend.
- Server pages with player history, a heatmap of busy hours, long-term stats and the server's Pastebin info.
- Statistics across all servers: a player timeline, trends by country and mod loader share.
- Map of server locations.
- API docs, translator credits and third-party licenses.
- 27 languages.

## Getting started

You need:

- [Node.js](https://nodejs.org/) 24 (24.15 or later). CI runs on Node 24, and 22.22.2 or later also meets the package requirements.
- [pnpm](https://pnpm.io/) 10. `package.json` pins the exact version, so `corepack enable` is enough if you use Corepack.

```bash
git clone https://github.com/horyu1234/sl-servers-frontend.git
cd sl-servers-frontend
pnpm install
pnpm start
```

The dev server runs at http://localhost:3185 and uses the production API, so there is no backend to set up.

### Scripts

| Command         | What it does                    |
| --------------- | ------------------------------- |
| `pnpm start`    | Runs the Vite dev server        |
| `pnpm build`    | Builds the site into `build/`   |
| `pnpm preview`  | Serves `build/` on port 4173    |
| `pnpm test`     | Runs Vitest in watch mode       |
| `pnpm test run` | Runs all tests once, as CI does |

Add a path to run part of the suite:

```bash
pnpm test run src/i18n
```

### Environment variables

| Variable             | Used for        | Set in                                                      |
| -------------------- | --------------- | ----------------------------------------------------------- |
| `VITE_API_URL`       | API base URL    | `.env.development`, `.env.production`                       |
| `VITE_CARTO_API_KEY` | CARTO map tiles | `.env.local` in development, Cloudflare Pages in production |

Without a CARTO key, map tiles show an "API KEY REQUIRED" image. Everything else works.

The `/api` page does not embed Swagger on localhost, because the OpenAPI host blocks local origins.

## Deployment

scplist.kr is built and hosted on Cloudflare Pages. `public/_headers` is copied into the build and sets the site-wide Content Security Policy, so any new iframe source has to be added to `frame-src` there.

## Tech stack

- React 19, Vite 8, React Router 7
- Redux Toolkit with thunks
- Tailwind CSS 4, shadcn/ui (Radix), lucide-react
- recharts for charts, Leaflet for the map, @tanstack/react-virtual for the server list
- i18next for translations
- swagger-ui-react for the API page
- DOMPurify for HTML that comes from the API
- Silktide Consent Manager: Sentry, Google Tag Manager, Microsoft Clarity and the MineTalk chat load only after consent
- Vitest and Testing Library

## Dependencies

To limit supply chain risk, every direct dependency in [`package.json`](./package.json) is pinned to an exact version. `pnpm-lock.yaml` records a SHA-512 hash for every package, so a tampered tarball fails the install.

To update a dependency:

1. Read its release notes.
2. Run `pnpm add -E <pkg>@<version>`. `pnpm update <pkg>` does nothing on an exact pin.
3. Run `pnpm build` and check the new entries in `build/third-party-licenses.json`.
4. Commit `package.json` and `pnpm-lock.yaml`.

## Contributing

See the [contributing guide](./CONTRIBUTING.md) and the [Code of Conduct](./CODE_OF_CONDUCT.md). New languages and translation fixes are welcome too: the steps are under [Translations](./CONTRIBUTING.md#translations), and questions can go to support@scplist.kr. To report a security problem, see [SECURITY.md](./SECURITY.md).

## License

[AGPL-3.0](./LICENSE). Third-party licenses are listed on the [credits page](https://scplist.kr/credit).

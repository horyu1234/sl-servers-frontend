# SCP: Secret Laboratory Server List

Frontend for [scplist.kr](https://scplist.kr) — a community-run directory of public *SCP: Secret Laboratory* servers with live stats, location map, and historical trends.

> **Note:** This project was recently transitioned from closed source to open source. We welcome your contributions to help improve and expand the project!

## Features

- Live server listing with player counts, region, version, and modded/vanilla flags
- Interactive map view of server locations powered by Leaflet
- Player-count and uptime trends with recharts
- Full internationalization via i18next, with community-maintained locales
- Responsive layout tuned for both desktop and mobile

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) **20 LTS** or newer (Vite 8 / Vitest 4 require Node 20+)
- [pnpm](https://pnpm.io/) **10** (the repo pins `packageManager` to `pnpm@10.x`; Corepack will pick this up automatically)

### Installation

```bash
# Clone the repository
git clone https://github.com/horyu1234/sl-servers-frontend.git
cd sl-servers-frontend

# Install dependencies
pnpm install

# Start the dev server (http://localhost:3185)
pnpm start
```

### Common Scripts

| Command         | What it does                                            |
| --------------- | ------------------------------------------------------- |
| `pnpm start`    | Run the Vite dev server on port 3185                    |
| `pnpm build`    | Build the production bundle into `build/`               |
| `pnpm preview`  | Serve the production build locally for smoke-testing    |
| `pnpm test`     | Run the Vitest + Testing Library suite                  |

To run a single test file:

```bash
pnpm test src/path/to/file.test.jsx
```

## Contributing

Contributions are welcome! Start with the [Contributing Guide](./CONTRIBUTING.md), and please review the [Code of Conduct](./CODE_OF_CONDUCT.md) before opening your first PR.

### Translations

This project supports multiple languages and welcomes new locales as well as corrections to existing ones. Translation workflow, locale conventions, and file-encoding rules live in the [Contributing Guide](./CONTRIBUTING.md#translation-contributions).

For questions about translations, contact **support@scplist.kr**.

## Tech Stack

- React 19 + Vite
- Tailwind v4 + shadcn/ui (Radix primitives) + lucide-react
- Redux Toolkit
- React Router 7
- recharts (charts)
- @tanstack/react-virtual (virtualized list)
- Leaflet for the server-location map
- Silktide CMP + DOMPurify (consent-gated Sentry)
- i18next for internationalization
- Vitest + Testing Library

## Supply Chain Security

To reduce the risk of supply chain attacks, every direct dependency in
[`package.json`](./package.json) is **pinned to an exact version**
(no `^`, `~`, or other range prefixes). This guarantees that
`pnpm install` produces the same dependency graph everywhere and
prevents an upstream maintainer (or a compromised account) from
silently shipping a malicious version into a fresh install.

This is reinforced by `pnpm-lock.yaml`, which also stores SHA-512
integrity hashes for every transitive package — any tampered tarball
fails install.

When updating dependencies:

1. Update versions deliberately (e.g. `pnpm update <pkg>` for a chosen
   target, never an unconstrained `pnpm update`).
2. Verify the new release notes / changelog before bumping.
3. Commit both `package.json` and the updated `pnpm-lock.yaml`.
4. Keep direct dependencies pinned (no `^`/`~`); transitive lockfile
   entries are managed by pnpm.

## License

This project is licensed under the AGPL License - see the [LICENSE](./LICENSE) file for details.
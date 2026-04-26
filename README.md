# SCP: SL Server List

Frontend application for displaying and managing SCP: Secret Laboratory servers information.

> **Note:** This project was recently transitioned from closed source to open source. We welcome your contributions to help improve and expand the project!

[한국어 문서](./README.ko.md)

## Features

- Server listing with detailed stats and information
- Interactive map view of server locations
- Statistical analysis and graphs
- Multi-language support with extensive internationalization
- Responsive design for desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/scp-sl-server-list.git
cd scp-sl-server-list

# Install dependencies
pnpm install

# Start development server
pnpm start
```

The application will start on port 3185 by default.

### Building for Production

```bash
pnpm build
```

## Contributing

Contributions are welcome! Please check out our [Contributing Guide](./CONTRIBUTING.md) for details.

### Translations

This project supports multiple languages. Previously, translations were managed in a separate repository.

- Translation files are located in `src/i18n/locale/*.json`
- The name of each language file follows IETF Language Tag. For a list of codes, please check [this link](http://www.lingoes.net/en/translator/langcode.htm).
- `src/data/language.json` file must be encoded in UTF-8 (Without BOM).
- `src/i18n/locale/*.json` files must be encoded in UTF-8 (With BOM).

To contribute translations:
1. Fork this repository
2. Create a new branch for your translation work
3. Update or add translation files in `src/i18n/locale/`
4. Remember to also update `src/data/language.json` when contributing to translations
5. Submit a pull request

If you have any questions about translations, please contact: Discord Username: horyu

## Future Plans

- UI/UX improvements
- Performance optimizations
- Adding more data visualization options

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
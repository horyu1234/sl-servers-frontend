# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Build/Run Commands
- `pnpm start` - Start development server on port 3185
- `pnpm build` - Build production version
- `pnpm test` - Run all tests
- `pnpm test src/path/to/test.js` - Run a specific test file

## Code Style Guidelines
- WebStorm default code formatting settings are used
- React components use JSX syntax with `.jsx` file extension
- Functional components with hooks are preferred over class components
- Redux for state management with async actions using thunks
- Import order: React, third-party libraries, local components, styles
- Use destructuring for props and state variables
- Component file names use PascalCase (e.g., `ServerList.jsx`)
- Utility files use camelCase (e.g., `apiClient.js`)
- CSS modules with specific files for component styles
- Error handling should use try/catch with appropriate error dispatch
- i18n/localization uses i18next with separate locale files

## Project Structure
- `/src/components/` - Reusable UI components
- `/src/pages/` - Page-level components for routes
- `/src/modules/` - Redux actions, reducers, and selectors
- `/src/i18n/` - Internationalization configuration and files
- `/vite-plugins/` - Vite plugins used by the build

## Third-Party Licenses
- `pnpm build` updates the license list on the credit page: `vite-plugins/thirdPartyLicenses.js` reads the modules in the bundle and emits `third-party-licenses.json`. Do not maintain that list by hand.
- After adding, removing or upgrading a dependency, run `pnpm build` and check the new entries in `build/third-party-licenses.json`.
- Update these by hand, because the build cannot see them:
  - Code copied into the repository: put its license file next to the code and add it to `VENDORED` in `vite-plugins/thirdPartyLicenses.js`.
  - Tools whose output skips the module graph, such as Tailwind: add them to `COMPILED_IN` in the same file.
  - Data and services used at runtime or through the backend: add them to `RESOURCES` in `src/pages/credit/ExternalResources.jsx`.

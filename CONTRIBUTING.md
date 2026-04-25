# Contributing to SCP: SL Server List

Thank you for considering contributing to this project! Here are some guidelines to help you get started.

[한국어 문서](./CONTRIBUTING.ko.md)

## Code of Conduct

Please be respectful to all contributors and users. We aim to foster an inclusive and welcoming community.

## How to Contribute

1. Fork the repository
2. Create a new branch for your feature or bugfix
3. Make your changes
4. Test your changes thoroughly
5. Submit a pull request

## Development Environment

```bash
# Clone your fork
git clone git@github.com:horyu1234/sl-servers-frontend.git
cd sl-servers-frontend

# Install dependencies
pnpm install

# Start development server
pnpm start
```

## Pull Request Process

1. Update the README.md if needed with details of changes
2. Reference any relevant issues in your PR description
3. Make sure your code follows the existing style and conventions
4. Ensure all tests pass before submitting

## Translation Contributions

We welcome translation contributions! 

- Translation files are located in `src/i18n/locale/*.json`
- The name of each language file follows IETF Language Tag format
- `src/data/language.json` file must be encoded in UTF-8 (Without BOM)
- `src/i18n/locale/*.json` files must be encoded in UTF-8 (With BOM)

When contributing translations:
1. Update or add translation files in `src/i18n/locale/`
2. Remember to also update `src/data/language.json` to include your language
3. Test your translations by running the app with your language selected

## Coding Conventions

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

## Questions?

If you have any questions, please feel free to reach out:
- Discord: horyu
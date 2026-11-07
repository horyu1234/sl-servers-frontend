import fs from 'node:fs';
import path from 'node:path';

export const LICENSES_FILE = 'third-party-licenses.json';

const NOTICE_FILE = /^(licen[cs]e|copying|notice|copyright|unlicense)/i;
const PACKAGE_DIR = /^(.*node_modules\/(?:@[^/]+\/)?[^/]+)/;

// Output of these reaches the build without passing through the module graph:
// @tailwindcss/vite compiles Tailwind's preflight and the animate plugin into
// the CSS, and Vite injects its preload helper into the entry chunk. Vite's
// license file goes on to list its own bundled tooling, none of which ships.
const COMPILED_IN = [
  { name: 'tailwindcss' },
  { name: 'tailwindcss-animate' },
  { name: 'vite', licenseEnd: '# Licenses of bundled dependencies' },
];

// Copied into this repository, so there is no package to read. Each license
// file sits next to the code it covers.
const VENDORED = [
  {
    name: 'shadcn/ui',
    license: 'MIT',
    repository: 'https://github.com/shadcn-ui/ui',
    licenseFile: 'src/components/ui/LICENSE',
  },
  {
    name: 'Silktide Consent Manager',
    license: 'MIT',
    repository: 'https://github.com/silktide/consent-manager',
    licenseFile: 'public/silktide/LICENSE',
  },
];

export function packageDirOf(moduleId, root) {
  if (moduleId.startsWith('\0')) return null;
  const match = moduleId.split('?')[0].match(PACKAGE_DIR);
  return match ? path.resolve(root, match[1]) : null;
}

export function licenseOf(pkg) {
  const field = pkg.license ?? pkg.licenses;
  if (typeof field === 'string') return field;
  const names = [field].flat().map((entry) => entry?.type).filter(Boolean);
  return names.join(' OR ') || 'UNKNOWN';
}

export function repositoryUrlOf(pkg) {
  const raw = typeof pkg.repository === 'string' ? pkg.repository : pkg.repository?.url;
  if (!raw) return pkg.homepage ?? null;
  const url = raw
    .replace(/^git\+/, '')
    .replace(/^(git|ssh|http):\/\/(git@)?/, 'https://')
    .replace(/^git@github\.com:/, 'https://github.com/')
    .replace(/^github:/, 'https://github.com/')
    .replace(/\.git$/, '');
  return url.startsWith('http') ? url : `https://github.com/${url}`;
}

function authorOf(pkg) {
  const author = typeof pkg.author === 'string' ? pkg.author : pkg.author?.name;
  return author?.replace(/\s*[<(].*$/, '') || null;
}

function noticeFileNames(dir) {
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((entry) => NOTICE_FILE.test(entry.name))
    .flatMap((entry) => (entry.isDirectory()
      ? fs.readdirSync(path.join(dir, entry.name)).map((file) => `${entry.name}/${file}`)
      : [entry.name]))
    .sort();
}

function readNotice(file, text, licenseEnd) {
  const end = licenseEnd ? text.indexOf(licenseEnd) : -1;
  return { file, text: (end === -1 ? text : text.slice(0, end)).replace(/\r\n/g, '\n').trim() };
}

export function describePackage(dir, { licenseEnd } = {}) {
  const realDir = fs.realpathSync(dir);
  const pkg = JSON.parse(fs.readFileSync(path.join(realDir, 'package.json'), 'utf8'));
  return {
    name: pkg.name,
    version: pkg.version,
    license: licenseOf(pkg),
    repository: repositoryUrlOf(pkg),
    author: authorOf(pkg),
    notices: noticeFileNames(realDir).map((file) => (
      readNotice(file, fs.readFileSync(path.join(realDir, file), 'utf8'), licenseEnd)
    )),
  };
}

function describeVendored(root, { licenseFile, ...entry }) {
  const text = fs.readFileSync(path.join(root, licenseFile), 'utf8');
  return {
    ...entry,
    version: null,
    author: null,
    notices: [readNotice(path.basename(licenseFile), text)],
  };
}

// License texts repeat heavily across packages, so they are stored once and
// referenced by index. A package installed under several peer sets shows up as
// several directories but one name@version.
export function toManifest(entries) {
  const unique = new Map(entries.map((entry) => [`${entry.name}@${entry.version}`, entry]));
  const texts = [];
  const textIndex = new Map();
  const internText = (text) => {
    if (!textIndex.has(text)) {
      textIndex.set(text, texts.length);
      texts.push(text);
    }
    return textIndex.get(text);
  };
  const packages = [...unique.values()]
    .sort((a, b) => a.name.localeCompare(b.name) || String(a.version).localeCompare(String(b.version)))
    .map((entry) => ({
      ...entry,
      notices: entry.notices.map(({ file, text }) => ({ file, text: internText(text) })),
    }));
  return { packages, texts };
}

function buildManifest(root, packageDirs) {
  const nodeModules = path.join(root, 'node_modules');
  return JSON.stringify(toManifest([
    ...packageDirs.map((dir) => describePackage(dir)),
    ...COMPILED_IN.map(({ name, ...options }) => describePackage(path.join(nodeModules, name), options)),
    ...VENDORED.map((entry) => describeVendored(root, entry)),
  ]));
}

// Writes the list from the modules that actually went into the build, so it
// cannot drift from what ships. The dev server has no bundle to look at and
// serves the direct dependencies instead, which is enough to work on the page.
export function thirdPartyLicenses() {
  let root;

  return {
    name: 'third-party-licenses',

    configResolved(config) {
      root = config.root;
    },

    configureServer(server) {
      server.middlewares.use(`/${LICENSES_FILE}`, (_req, res) => {
        const { dependencies } = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
        const dirs = Object.keys(dependencies).map((name) => path.join(root, 'node_modules', name));
        res.setHeader('Content-Type', 'application/json');
        res.end(buildManifest(root, dirs));
      });
    },

    generateBundle() {
      const dirs = new Set(
        [...this.getModuleIds()].map((id) => packageDirOf(id, root)).filter(Boolean),
      );
      this.emitFile({ type: 'asset', fileName: LICENSES_FILE, source: buildManifest(root, [...dirs]) });
    },
  };
}

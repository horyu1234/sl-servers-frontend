import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  LICENSES_FILE,
  describePackage,
  licenseOf,
  packageDirOf,
  repositoryUrlOf,
  thirdPartyLicenses,
  toManifest,
} from './thirdPartyLicenses';
import type { ResolvedConfig } from 'vite';
import type { LicenseManifest, PackageEntry } from '../src/types/licenses';

const projectRoot = path.resolve(import.meta.dirname, '..');

describe('packageDirOf', () => {
  const root = '/project';

  it('finds the package in a pnpm virtual store path', () => {
    expect(packageDirOf('/project/node_modules/.pnpm/axios@1.0.0/node_modules/axios/lib/index.js', root))
      .toBe('/project/node_modules/.pnpm/axios@1.0.0/node_modules/axios');
  });

  it('keeps the scope of a scoped package', () => {
    expect(packageDirOf('/project/node_modules/.pnpm/x/node_modules/@radix-ui/react-slot/dist/index.mjs', root))
      .toBe('/project/node_modules/.pnpm/x/node_modules/@radix-ui/react-slot');
  });

  it('resolves ids relative to the project root', () => {
    expect(packageDirOf('../node_modules/leaflet/dist/leaflet.css', root)).toBe('/node_modules/leaflet');
  });

  it('ignores the query string', () => {
    expect(packageDirOf('/project/node_modules/a/index.js?url=/node_modules/b/index.js', root))
      .toBe('/project/node_modules/a');
  });

  it('skips project files and virtual modules', () => {
    expect(packageDirOf('/project/src/main.tsx', root)).toBeNull();
    expect(packageDirOf('\0vite/preload-helper.js', root)).toBeNull();
  });
});

describe('licenseOf', () => {
  it('reads an SPDX expression', () => {
    expect(licenseOf({ license: '(MPL-2.0 OR Apache-2.0)' })).toBe('(MPL-2.0 OR Apache-2.0)');
  });

  it('reads the legacy object and array forms', () => {
    expect(licenseOf({ license: { type: 'MIT', url: 'https://example.com' } })).toBe('MIT');
    expect(licenseOf({ licenses: [{ type: 'MIT' }, { type: 'Apache-2.0' }] })).toBe('MIT OR Apache-2.0');
  });

  it('reports a package that declares nothing', () => {
    expect(licenseOf({})).toBe('UNKNOWN');
  });
});

describe('repositoryUrlOf', () => {
  it.each([
    ['https://github.com/a/b', 'https://github.com/a/b'],
    ['http://github.com/a/b', 'https://github.com/a/b'],
    ['git+https://github.com/a/b.git', 'https://github.com/a/b'],
    ['git://github.com/a/b.git', 'https://github.com/a/b'],
    ['ssh://git@github.com/a/b.git', 'https://github.com/a/b'],
    ['git@github.com:a/b.git', 'https://github.com/a/b'],
    ['github:a/b', 'https://github.com/a/b'],
    ['a/b', 'https://github.com/a/b'],
  ])('turns %s into a web URL', (raw, expected) => {
    expect(repositoryUrlOf({ repository: raw })).toBe(expected);
    expect(repositoryUrlOf({ repository: { url: raw } })).toBe(expected);
  });

  it('falls back to the homepage', () => {
    expect(repositoryUrlOf({ homepage: 'https://example.com' })).toBe('https://example.com');
    expect(repositoryUrlOf({})).toBeNull();
  });
});

describe('describePackage', () => {
  let dir: string;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'licenses-'));
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({
      name: 'sample',
      version: '1.2.3',
      license: 'Apache-2.0',
      author: 'Jane Doe <jane@example.com> (https://example.com)',
    }));
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('collects license and notice files, including a LICENSES directory', () => {
    fs.writeFileSync(path.join(dir, 'NOTICE'), 'Copyright Sample\r\n');
    fs.mkdirSync(path.join(dir, 'LICENSES'));
    fs.writeFileSync(path.join(dir, 'LICENSES', 'Apache-2.0.txt'), 'Apache text\n');
    fs.writeFileSync(path.join(dir, 'README.md'), 'not a notice');

    expect(describePackage(dir).notices).toEqual([
      { file: 'LICENSES/Apache-2.0.txt', text: 'Apache text' },
      { file: 'NOTICE', text: 'Copyright Sample' },
    ]);
  });

  it('keeps the author name without contact details', () => {
    expect(describePackage(dir).author).toBe('Jane Doe');
  });

  it('cuts a license file at the given heading', () => {
    fs.writeFileSync(path.join(dir, 'LICENSE.md'), 'MIT\n\n# Bundled\nothers');

    expect(describePackage(dir, { licenseEnd: '# Bundled' }).notices[0].text).toBe('MIT');
  });
});

describe('toManifest', () => {
  const entry = (name: string, version: string, text: string) => (
    { name, version, notices: [{ file: 'LICENSE', text }] } as PackageEntry
  );

  it('stores each license text once', () => {
    const { packages, texts } = toManifest([entry('a', '1.0.0', 'MIT'), entry('b', '1.0.0', 'MIT')]);

    expect(texts).toEqual(['MIT']);
    expect(packages.map(({ notices }) => notices[0].text)).toEqual([0, 0]);
  });

  it('keeps versions apart but merges repeats of the same version', () => {
    const { packages } = toManifest([
      entry('a', '2.0.0', 'MIT'),
      entry('a', '1.0.0', 'MIT'),
      entry('a', '1.0.0', 'MIT'),
    ]);

    expect(packages.map(({ version }) => version)).toEqual(['1.0.0', '2.0.0']);
  });
});

describe('thirdPartyLicenses', () => {
  function emitManifest(moduleIds: string[]) {
    const plugin = thirdPartyLicenses();
    const emitted: { fileName: string; source: string }[] = [];
    plugin.configResolved({ root: projectRoot } as ResolvedConfig);
    plugin.generateBundle.call({
      getModuleIds: () => moduleIds.values(),
      emitFile: (file: { fileName: string; source: string }) => emitted.push(file),
    } as never);
    return { file: emitted[0], manifest: JSON.parse(emitted[0].source) as LicenseManifest };
  }

  it('lists bundled packages plus what never enters the module graph', () => {
    const { file, manifest } = emitManifest([
      path.join(projectRoot, 'src/main.tsx'),
      path.join(projectRoot, 'node_modules/leaflet/dist/leaflet.js'),
    ]);

    expect(file.fileName).toBe(LICENSES_FILE);
    expect(manifest.packages.map(({ name }) => name)).toEqual(expect.arrayContaining([
      'leaflet',
      'tailwindcss',
      'tailwindcss-animate',
      'vite',
      'shadcn/ui',
      'Silktide Consent Manager',
    ]));
    expect(manifest.packages.map(({ name }) => name)).not.toContain('react');
  });

  it('gives every generated entry a license text', () => {
    const { manifest } = emitManifest([]);

    for (const { notices } of manifest.packages) {
      expect(manifest.texts[notices[0].text]).toMatch(/copyright/i);
    }
  });

  it('serves the direct dependencies from the dev server', () => {
    const plugin = thirdPartyLicenses();
    const routes: Record<string, (req: unknown, res: unknown) => void> = {};
    plugin.configResolved({ root: projectRoot } as ResolvedConfig);
    plugin.configureServer({
      middlewares: {
        use: (route: string, handler: (req: unknown, res: unknown) => void) => { routes[route] = handler; },
      },
    } as never);
    const response = { setHeader: vi.fn(), end: vi.fn() };

    routes[`/${LICENSES_FILE}`]({}, response);

    const { packages } = JSON.parse(response.end.mock.calls[0][0]) as LicenseManifest;
    expect(packages.map(({ name }) => name)).toEqual(expect.arrayContaining(['react', 'shadcn/ui']));
    expect(response.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
  });

  it('leaves the bundled dependency list out of the Vite license', () => {
    const { manifest } = emitManifest([]);
    const vite = manifest.packages.find(({ name }) => name === 'vite');

    expect(manifest.texts[vite!.notices[0].text]).not.toContain('Bundled dependencies');
  });
});

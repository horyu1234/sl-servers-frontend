// third-party-licenses.json, written by vite-plugins/thirdPartyLicenses.ts and
// read by the credit page. This file imports nothing so both sides can use it.

export interface PackageNotice<Text = string> {
  file: string;
  text: Text;
}

export interface PackageEntry<Text = string> {
  name: string;
  version: string | null;
  license: string;
  repository: string | null;
  author: string | null;
  notices: PackageNotice<Text>[];
}

/** In the manifest a notice's text is an index into `texts`. */
export type ManifestPackage = PackageEntry<number>;

export interface LicenseManifest {
  packages: ManifestPackage[];
  texts: string[];
}

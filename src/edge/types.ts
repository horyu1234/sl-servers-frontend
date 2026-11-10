// The parts of the Cloudflare Pages Functions runtime this function uses, typed by hand so the
// project needs no Workers type package.

export interface Env {
  /** The static files of the build. */
  ASSETS: { fetch(input: Request | URL | string): Promise<Response> };
  /** Lets this function read the site's endpoints on api.scplist.kr without rate limits. */
  EDGE_API_KEY?: string;
  /** The API to read from. Leave unset in production. */
  API_ORIGIN?: string;
}

export interface EdgeContext {
  request: Request;
  env: Env;
  /** Hands the request on to the static files. */
  next(): Promise<Response>;
  /** Keeps the function alive until the promise settles, after the response has gone out. */
  waitUntil(promise: Promise<unknown>): void;
}

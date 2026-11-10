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

/** A request as Cloudflare hands it over. `cf` is missing outside Cloudflare, as in the tests. */
export type EdgeRequest = Request & {
  cf?: {
    /** The time zone the request came from, such as Asia/Seoul. */
    timezone?: string;
  };
};

export interface EdgeContext {
  request: EdgeRequest;
  env: Env;
  /** Hands the request on to the static files. */
  next(): Promise<Response>;
  /** Keeps the function alive until the promise settles, after the response has gone out. */
  waitUntil(promise: Promise<unknown>): void;
}

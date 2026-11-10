// Reads the API for the edge function and keeps the answers in the data center's cache.
//
// A page must never wait long for data. An answer in the cache is used even when it is old,
// and refreshed after the response has gone out. With nothing in the cache the page waits for
// the API only until its deadline, and the fetch finishes in the background for the next visitor.

const CACHE_NAME = 'scplist-edge';
// Cache keys must be URLs. Nothing is ever requested from this host.
const CACHE_KEY_ORIGIN = 'https://edge-cache.scplist.kr';
const FETCHED_AT = 'x-fetched-at';
const DEFAULT_API_ORIGIN = 'https://api.scplist.kr';
export const EDGE_KEY_HEADER = 'X-Scplist-Edge-Key';

/** How long an answer is used as it is, and how much longer it may be used while a new one loads. */
export interface CachePolicy {
  freshSeconds: number;
  staleSeconds: number;
}

/** An answer of the API. `data` may itself be null: the API answers null for an unknown server. */
export type Loaded<T> = { data: T } | null;

export interface EdgeCache {
  match(key: string): Promise<Response | undefined>;
  put(key: string, response: Response): Promise<void>;
}

interface ApiOptions {
  apiOrigin?: string;
  edgeKey?: string;
  cache: EdgeCache;
  fetch: typeof fetch;
  waitUntil: (promise: Promise<unknown>) => void;
  /** Milliseconds a page may wait for answers that are not cached. */
  budgetMs: number;
  now?: () => number;
}

export interface Api {
  get<T>(path: string, policy: CachePolicy): Promise<Loaded<T>>;
}

export function createApi({ apiOrigin, edgeKey, cache, fetch: request, waitUntil, budgetMs, now = Date.now }: ApiOptions): Api {
  const origin = (apiOrigin || DEFAULT_API_ORIGIN).replace(/\/$/, '');
  const deadline = now() + budgetMs;

  async function refresh<T>(path: string, policy: CachePolicy): Promise<Loaded<T>> {
    try {
      const headers: Record<string, string> = { Accept: 'application/json', 'User-Agent': 'scplist-edge' };
      if (edgeKey) headers[EDGE_KEY_HEADER] = edgeKey;
      const response = await request(`${origin}${path}`, { headers });
      if (!response.ok) return null;

      const text = await response.text();
      // An empty body is how the API says "no such server".
      const data: T = JSON.parse(text === '' ? 'null' : text);
      await cache.put(`${CACHE_KEY_ORIGIN}${path}`, new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': `max-age=${policy.freshSeconds + policy.staleSeconds}`,
          [FETCHED_AT]: String(now()),
        },
      }));
      return { data };
    } catch {
      // A page without its data is still a page. The browser asks the API again by itself.
      return null;
    }
  }

  return {
    async get<T>(path: string, policy: CachePolicy): Promise<Loaded<T>> {
      const cached = await cache.match(`${CACHE_KEY_ORIGIN}${path}`).catch(() => undefined);
      if (cached) {
        const ageSeconds = (now() - Number(cached.headers.get(FETCHED_AT))) / 1000;
        if (!(ageSeconds <= policy.freshSeconds)) waitUntil(refresh<T>(path, policy));
        const data: T = await cached.json();
        return { data };
      }

      const pending = refresh<T>(path, policy);
      waitUntil(pending);
      const remaining = deadline - now();
      if (remaining <= 0) return null;
      return Promise.race([
        pending,
        new Promise<null>((resolve) => { setTimeout(() => resolve(null), remaining); }),
      ]);
    },
  };
}

/** The cache of the data center the function runs in. */
export async function openEdgeCache(): Promise<EdgeCache> {
  const cache = await caches.open(CACHE_NAME);
  return {
    match: (key) => cache.match(key),
    put: (key, response) => cache.put(key, response),
  };
}

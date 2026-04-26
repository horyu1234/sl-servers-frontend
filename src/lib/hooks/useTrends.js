import { useEffect, useReducer } from 'react';
import { getServersTrendsAPI } from '../api/trends';

const TTL_MS = 5 * 60 * 1000;

// One module-level cache shared by every mounted useTrends. The endpoint
// returns trends for every server in a single response, so there is no
// per-id or per-viewport bookkeeping — fetch once, cache the full map,
// refetch only after TTL expires.
//   { fetchedAt, trends, error } | null
let cache = null;
let inflight = null;
const subscribers = new Set();

function notify() {
  for (const cb of subscribers) cb();
}

export function _resetCacheForTests() {
  cache = null;
  inflight = null;
}

function isFresh() {
  return cache && Date.now() - cache.fetchedAt < TTL_MS;
}

function fetchTrends() {
  if (inflight) return inflight;
  if (isFresh()) return Promise.resolve();
  inflight = getServersTrendsAPI()
    .then((response) => {
      cache = { fetchedAt: Date.now(), trends: response.data?.trends ?? {}, error: null };
      inflight = null;
      notify();
    })
    .catch((error) => {
      cache = { fetchedAt: Date.now(), trends: {}, error };
      inflight = null;
      notify();
    });
  return inflight;
}

/**
 * Returns `{ trends, loading, error }` where `trends` is
 * `{ [serverId: string]: number[] | null }` covering every server. The
 * first call on a fresh page fires GET /v2/servers/trends; subsequent
 * calls return the cached map until TTL expires.
 */
export function useTrends() {
  const [, bump] = useReducer((c) => c + 1, 0);

  useEffect(() => {
    subscribers.add(bump);
    fetchTrends();
    return () => { subscribers.delete(bump); };
  }, []);

  return {
    trends: cache?.trends ?? null,
    loading: inflight != null,
    error: cache?.error ?? null,
  };
}

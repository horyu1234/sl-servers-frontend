import { useEffect, useReducer, useMemo } from 'react';
import { getServersTrendsBatchAPI } from '../api/trends';

const TTL_MS = 5 * 60 * 1000;
const DEBOUNCE_MS = 200;

// Per-server-id cache. Each entry is the result of one batch response
// projected onto that single id, so scrolling a row out of view doesn't
// drop its trend, and scrolling back doesn't refetch.
//   Map<serverId(number), { fetchedAt, trend, error }>
const cache = new Map();
// Set of ids currently being fetched, so a second visibility change
// during an inflight request doesn't queue a duplicate.
const inflight = new Set();
// Subscribers (force-re-render callbacks) of every mounted useTrends.
const subscribers = new Set();

function notify() {
  for (const cb of subscribers) cb();
}

export function _resetCacheForTests() {
  cache.clear();
  inflight.clear();
}

function missingFor(ids) {
  const now = Date.now();
  return ids.filter((id) => {
    if (inflight.has(id)) return false;
    const entry = cache.get(id);
    return !entry || now - entry.fetchedAt >= TTL_MS;
  });
}

function fetchMissing(ids) {
  const missing = missingFor(ids);
  if (missing.length === 0) return Promise.resolve();
  for (const id of missing) inflight.add(id);
  return getServersTrendsBatchAPI({ serverIds: missing })
    .then((response) => {
      const now = Date.now();
      const map = response.data?.trends ?? {};
      for (const id of missing) {
        cache.set(id, { fetchedAt: now, trend: map[String(id)] ?? null, error: null });
        inflight.delete(id);
      }
      notify();
    })
    .catch((error) => {
      const now = Date.now();
      for (const id of missing) {
        cache.set(id, { fetchedAt: now, trend: null, error });
        inflight.delete(id);
      }
      notify();
    });
}

/**
 * Returns a `{ trends, loading, error }` shape where `trends` is
 * `{ [serverId: string]: number[] | null }` covering the requested
 * visibleIds (plus any others already cached from previous viewports).
 *
 * Visible-ids changes are debounced by 200ms — rapid scrolling doesn't
 * fire many requests. Per-id caching means scrolling back to an
 * already-seen row is free.
 */
export function useTrends(visibleIds = []) {
  // Force re-render when the global cache changes.
  const [, bump] = useReducer((c) => c + 1, 0);
  useEffect(() => {
    subscribers.add(bump);
    return () => { subscribers.delete(bump); };
  }, []);

  // Stable key derived from the (sorted) visible id list so the fetch
  // effect only runs when the set actually changes content, not on every
  // render that re-creates the array reference.
  const key = useMemo(
    () => [...visibleIds].sort((a, b) => a - b).join(','),
    [visibleIds]
  );

  useEffect(() => {
    if (visibleIds.length === 0) return;
    const handle = setTimeout(() => {
      fetchMissing(visibleIds);
    }, DEBOUNCE_MS);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Project the cache into the {serverId -> trend} shape consumers expect.
  // We include any id present in the cache (not just visibleIds) — rows
  // that scroll back into view get their cached trend immediately.
  const trends = useMemo(() => {
    if (cache.size === 0) return null;
    const out = {};
    for (const [id, entry] of cache) {
      out[String(id)] = entry.trend;
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]); // bump-driven re-render gives us a new render cycle anyway

  // loading: at least one inflight request for an id we currently want.
  const loading = visibleIds.some((id) => inflight.has(id));
  // error: any cached entry has an error (best-effort surface).
  const error = (() => {
    for (const id of visibleIds) {
      const entry = cache.get(id);
      if (entry?.error) return entry.error;
    }
    return null;
  })();

  return { trends, loading, error };
}

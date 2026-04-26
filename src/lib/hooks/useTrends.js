import { useEffect, useMemo, useState } from 'react';
import { getServersTrendsBatchAPI } from '../api/trends';

const TTL_MS = 5 * 60 * 1000;

// Map<key, { fetchedAt, trends, error }>
const cache = new Map();
// Map<key, Promise<entry>>
const inflight = new Map();

function keyFor(serverIds) {
  return [...serverIds].sort((a, b) => a - b).join(',');
}

export function _resetCacheForTests() {
  cache.clear();
  inflight.clear();
}

function fetchTrends(serverIds, key) {
  const existing = cache.get(key);
  if (existing && Date.now() - existing.fetchedAt < TTL_MS) {
    return Promise.resolve(existing);
  }
  if (inflight.has(key)) return inflight.get(key);
  const promise = getServersTrendsBatchAPI({ serverIds })
    .then((response) => {
      const entry = { fetchedAt: Date.now(), trends: response.data.trends, error: null };
      cache.set(key, entry);
      inflight.delete(key);
      return entry;
    })
    .catch((error) => {
      const entry = { fetchedAt: Date.now(), trends: null, error };
      cache.set(key, entry);
      inflight.delete(key);
      return entry;
    });
  inflight.set(key, promise);
  return promise;
}

/**
 * Fetches the recent player-count history for the given serverIds via
 * POST /v2/servers/trends/batch. Cache is keyed by the sorted serverIds,
 * so the same set of IDs hits the cache; a different filter that changes
 * the visible servers triggers a fresh fetch.
 *
 * Pass an empty array (or omit) before the server list has loaded — no
 * request is fired and the hook returns { trends: null, loading: false }.
 */
export function useTrends(serverIds = []) {
  const key = useMemo(() => keyFor(serverIds), [serverIds]);
  const empty = serverIds.length === 0;

  const initial = useMemo(() => {
    if (empty) return { trends: null, error: null, loading: false };
    const existing = cache.get(key);
    const fresh = existing && Date.now() - existing.fetchedAt < TTL_MS;
    return fresh
      ? { trends: existing.trends, error: existing.error, loading: false }
      : { trends: null, error: null, loading: true };
  }, [key, empty]);

  const [state, setState] = useState(initial);

  // Fetch when key changes (new set of serverIds) and we don't have a
  // fresh cache hit. A change in `key` resets state to "loading" first
  // so consumers can show a spinner if they want.
  useEffect(() => {
    if (empty) {
      setState({ trends: null, error: null, loading: false });
      return;
    }
    const existing = cache.get(key);
    const fresh = existing && Date.now() - existing.fetchedAt < TTL_MS;
    if (fresh) {
      setState({ trends: existing.trends, error: existing.error, loading: false });
      return;
    }
    setState((prev) => (prev.loading ? prev : { ...prev, loading: true }));
    let cancelled = false;
    fetchTrends(serverIds, key).then((next) => {
      if (cancelled) return;
      setState({ trends: next.trends, error: next.error, loading: false });
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, empty]);

  // Background revalidation every TTL_MS for the current key while mounted.
  useEffect(() => {
    if (empty) return;
    const id = setInterval(() => {
      // Force-refresh the entry by clearing it from the cache before fetch.
      cache.delete(key);
      fetchTrends(serverIds, key).then((next) => {
        setState({ trends: next.trends, error: next.error, loading: false });
      });
    }, TTL_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, empty]);

  return state;
}

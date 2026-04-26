import { useEffect, useState } from 'react';
import { getServersTrendsAPI } from '../api/trends';

const TTL_MS = 5 * 60 * 1000;

let cache = { fetchedAt: 0, trends: null, error: null };
let inflight = null;

export function _resetCacheForTests() {
  cache = { fetchedAt: 0, trends: null, error: null };
  inflight = null;
}

function fetchTrends() {
  if (inflight) return inflight;
  inflight = getServersTrendsAPI()
    .then((response) => {
      cache = { fetchedAt: Date.now(), trends: response.data.trends, error: null };
      inflight = null;
      return cache;
    })
    .catch((error) => {
      cache = { fetchedAt: Date.now(), trends: null, error };
      inflight = null;
      return cache;
    });
  return inflight;
}

export function useTrends() {
  const fresh = Date.now() - cache.fetchedAt < TTL_MS;
  const [state, setState] = useState(() =>
    fresh
      ? { trends: cache.trends, error: cache.error, loading: false }
      : { trends: null, error: null, loading: true }
  );

  useEffect(() => {
    if (fresh) return;
    let cancelled = false;
    fetchTrends().then((next) => {
      if (cancelled) return;
      setState({ trends: next.trends, error: next.error, loading: false });
    });
    return () => { cancelled = true; };
  }, [fresh]);

  // Background revalidation every TTL_MS while mounted.
  useEffect(() => {
    const id = setInterval(() => {
      fetchTrends().then((next) => {
        setState({ trends: next.trends, error: next.error, loading: false });
      });
    }, TTL_MS);
    return () => clearInterval(id);
  }, []);

  return state;
}

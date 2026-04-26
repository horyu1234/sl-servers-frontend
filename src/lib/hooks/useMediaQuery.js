import { useEffect, useState } from 'react';

// Reactive boolean for `window.matchMedia(query)`. The initial value is read
// synchronously so the first paint matches the final layout (no flicker).
// Vite SPA only — no SSR safety beyond a defensive `window` guard.
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (event) => setMatches(event.matches);
    setMatches(mql.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

export default useMediaQuery;

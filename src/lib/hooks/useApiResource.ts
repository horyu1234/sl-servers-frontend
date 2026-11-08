import { useEffect, useState } from 'react';

type ApiResource<T> =
  | { status: 'loading'; data: null }
  | { status: 'ready'; data: T }
  | { status: 'unavailable'; data: null };

/**
 * Loads one API resource and reloads when `key` changes. A failed load reports
 * 'unavailable' so a section can step aside, which also covers an API that has
 * not been deployed yet. Responses for a previous key are dropped.
 */
export function useApiResource<T>(load: () => Promise<{ data: T }>, key: string): ApiResource<T> {
  const [state, setState] = useState<ApiResource<T>>({ status: 'loading', data: null });

  useEffect(() => {
    let isCurrent = true;
    setState({ status: 'loading', data: null });
    load()
      .then((response) => {
        if (isCurrent) setState({ status: 'ready', data: response.data });
      })
      .catch(() => {
        if (isCurrent) setState({ status: 'unavailable', data: null });
      });
    return () => { isCurrent = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state;
}

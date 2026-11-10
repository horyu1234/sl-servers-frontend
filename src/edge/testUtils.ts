// Stand-ins for the edge runtime in tests.
import type { Api, EdgeCache, Loaded } from './api';

/** A cache that lives in memory, like the one a data center keeps. */
export function memoryCache(): EdgeCache & { entries: Map<string, Response> } {
  const entries = new Map<string, Response>();
  return {
    entries,
    async match(key) {
      return entries.get(key)?.clone();
    },
    async put(key, response) {
      entries.set(key, response);
    },
  };
}

/**
 * An API with fixed answers. A path that is not listed does not answer, which is what the
 * function sees when the API is down or does not have the endpoint yet.
 */
export function fakeApi(answers: Record<string, unknown>): Api & { requested: string[] } {
  const requested: string[] = [];
  return {
    requested,
    async get<T>(path: string): Promise<Loaded<T>> {
      requested.push(path);
      // The test that lists an answer knows its shape.
      return path in answers ? { data: answers[path] as T } : null;
    },
  };
}

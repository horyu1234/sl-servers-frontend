import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EDGE_KEY_HEADER, createApi } from './api';
import { memoryCache } from './testUtils';

const POLICY = { freshSeconds: 60, staleSeconds: 600 };
const PATH = '/api/v2/rankings';

function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), init);
}

function setup(respond: (url: string, init?: RequestInit) => Promise<Response>, options: { edgeKey?: string; budgetMs?: number } = {}) {
  const cache = memoryCache();
  const background: Promise<unknown>[] = [];
  const request = vi.fn((input: RequestInfo | URL, init?: RequestInit) => respond(String(input), init));
  const api = () => createApi({
    cache,
    fetch: request,
    waitUntil: (promise) => { background.push(promise); },
    budgetMs: options.budgetMs ?? 1000,
    edgeKey: options.edgeKey,
  });
  return { api, cache, request, settle: () => Promise.all(background) };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-11-10T00:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('createApi', () => {
  it('asks the public API host and keeps the answer', async () => {
    const { api, request, cache, settle } = setup(async () => json({ total: 3 }));

    expect(await api().get(PATH, POLICY)).toEqual({ data: { total: 3 } });
    await settle();

    expect(request).toHaveBeenCalledTimes(1);
    expect(request.mock.calls[0][0]).toBe('https://api.scplist.kr/api/v2/rankings');
    expect(cache.entries.size).toBe(1);
  });

  it('sends the edge key only when one is set', async () => {
    const withKey = setup(async () => json({}), { edgeKey: 'secret' });
    await withKey.api().get(PATH, POLICY);
    const withoutKey = setup(async () => json({}));
    await withoutKey.api().get(PATH, POLICY);

    expect(new Headers(withKey.request.mock.calls[0][1]?.headers).get(EDGE_KEY_HEADER)).toBe('secret');
    expect(new Headers(withoutKey.request.mock.calls[0][1]?.headers).has(EDGE_KEY_HEADER)).toBe(false);
  });

  it('answers from the cache without asking again while the answer is fresh', async () => {
    const { api, request, settle } = setup(async () => json({ total: 3 }));
    await api().get(PATH, POLICY);
    await settle();

    vi.advanceTimersByTime(59_000);

    expect(await api().get(PATH, POLICY)).toEqual({ data: { total: 3 } });
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('answers with the old data at once and refreshes it afterwards', async () => {
    let total = 3;
    const { api, request, settle } = setup(async () => json({ total }));
    await api().get(PATH, POLICY);
    await settle();

    total = 4;
    vi.advanceTimersByTime(61_000);

    expect(await api().get(PATH, POLICY)).toEqual({ data: { total: 3 } });
    await settle();
    expect(request).toHaveBeenCalledTimes(2);
    expect(await api().get(PATH, POLICY)).toEqual({ data: { total: 4 } });
  });

  it('stops waiting at the deadline, and the answer is there for the next visitor', async () => {
    const { api, settle } = setup(
      () => new Promise((resolve) => { setTimeout(() => resolve(json({ total: 3 })), 5000); }),
      { budgetMs: 1000 },
    );

    const first = api().get(PATH, POLICY);
    await vi.advanceTimersByTimeAsync(1000);
    expect(await first).toBeNull();

    await vi.advanceTimersByTimeAsync(4000);
    await settle();
    expect(await api().get(PATH, POLICY)).toEqual({ data: { total: 3 } });
  });

  it('shares one deadline between all answers of a page', async () => {
    const { api } = setup(() => new Promise(() => {}), { budgetMs: 1000 });
    const page = api();

    const first = page.get(PATH, POLICY);
    await vi.advanceTimersByTimeAsync(1000);
    expect(await first).toBeNull();
    // The budget is spent, so the second answer is not waited for at all.
    expect(await page.get('/api/v2/countries', POLICY)).toBeNull();
  });

  it.each([404, 429, 500])('has no answer and caches nothing when the API says %i', async (status) => {
    const { api, cache, settle } = setup(async () => json({ error: true }, { status }));

    expect(await api().get(PATH, POLICY)).toBeNull();
    await settle();
    expect(cache.entries.size).toBe(0);
  });

  it('has no answer when the API cannot be reached or sends something that is not JSON', async () => {
    const unreachable = setup(async () => { throw new Error('network'); });
    const broken = setup(async () => new Response('<html>'));

    expect(await unreachable.api().get(PATH, POLICY)).toBeNull();
    expect(await broken.api().get(PATH, POLICY)).toBeNull();
  });

  it('reads an empty body as null, which is how the API says there is no such server', async () => {
    const { api } = setup(async () => new Response(''));

    expect(await api().get('/api/servers/1', POLICY)).toEqual({ data: null });
  });
});

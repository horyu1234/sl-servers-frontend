import type { AxiosResponse } from 'axios';

/** What a mocked API call resolves to. The code under test only reads `data`. */
export function apiResponse<T>(data: unknown) {
  return { data } as AxiosResponse<T>;
}

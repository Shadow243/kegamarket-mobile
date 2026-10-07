import { API_URL } from '@/lib/config';

import { ApiError, type ValidationErrors } from './errors';

type QueryValue = string | number | boolean | null | undefined;

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  query?: Record<string, QueryValue>;
  body?: unknown;
  signal?: AbortSignal;
}

interface ClientContext {
  getToken: () => string | null;
  getLocale: () => string;
  onUnauthorized: () => void;
}

// Wired once at boot (see src/lib/bootstrap.ts) so this module stays free of store/i18n imports.
const context: ClientContext = {
  getToken: () => null,
  getLocale: () => 'fr',
  onUnauthorized: () => {},
};

export function configureApiClient(next: Partial<ClientContext>) {
  Object.assign(context, next);
}

export function buildUrl(path: string, query: Record<string, QueryValue> = {}): string {
  const params = Object.entries(query)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
  return `${API_URL}${path}${params ? `?${params}` : ''}`;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', query, body, signal } = options;
  const headers: Record<string, string> = { Accept: 'application/json' };

  const token = context.getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  if (body !== undefined && !isFormData) headers['Content-Type'] = 'application/json';

  let response: Response;
  try {
    response = await fetch(buildUrl(path, { ...query, lang: context.getLocale() }), {
      method,
      headers,
      signal,
      body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
    });
  } catch (error) {
    if ((error as Error)?.name === 'AbortError') throw error;
    throw new ApiError('Network request failed', 0);
  }

  if (response.status === 204) return undefined as T;

  const payload = (await response.json().catch(() => null)) as
    (T & { message?: string; errors?: ValidationErrors }) | null;

  if (!response.ok) {
    if (response.status === 401 && token) context.onUnauthorized();
    throw new ApiError(
      payload?.message ?? `HTTP ${response.status}`,
      response.status,
      payload?.errors,
    );
  }

  return payload as T;
}

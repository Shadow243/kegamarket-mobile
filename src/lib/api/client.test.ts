import { buildUrl, configureApiClient, request } from './client';
import { ApiError } from './errors';

function rejectionOf(promise: Promise<unknown>): Promise<ApiError> {
  return promise.then(
    () => {
      throw new Error('Expected the request to fail');
    },
    (error: ApiError) => error,
  );
}

function mockFetchOnce(status: number, body: unknown) {
  (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
}

describe('buildUrl', () => {
  it('drops empty values and encodes the rest', () => {
    expect(buildUrl('/listings', { search: 'frigo lg', page: 2, city: undefined, sort: '' })).toBe(
      'https://api.kegamarket.com/api/v1/listings?search=frigo%20lg&page=2',
    );
  });
});

describe('request', () => {
  const onUnauthorized = jest.fn();

  beforeEach(() => {
    globalThis.fetch = jest.fn();
    onUnauthorized.mockReset();
    configureApiClient({ getToken: () => 'secret', getLocale: () => 'en', onUnauthorized });
  });

  it('sends the bearer token and the current locale', async () => {
    mockFetchOnce(200, { data: [] });

    await request('/listings', { query: { page: 1 } });

    const [url, init] = (globalThis.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe('https://api.kegamarket.com/api/v1/listings?page=1&lang=en');
    expect(init.headers.Authorization).toBe('Bearer secret');
  });

  it('serializes a JSON body', async () => {
    mockFetchOnce(200, { ok: true });

    await request('/auth/login', { method: 'POST', body: { login: 'a@b.c' } });

    const [, init] = (globalThis.fetch as jest.Mock).mock.calls[0];
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(init.body).toBe('{"login":"a@b.c"}');
  });

  it('turns a Laravel validation response into an ApiError with field errors', async () => {
    mockFetchOnce(422, { message: 'Invalid data', errors: { login: ['Required'] } });

    const error = await rejectionOf(request('/auth/login', { method: 'POST', body: {} }));

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(422);
    expect(error.firstFieldError('login')).toBe('Required');
  });

  it('reports a network failure as status 0', async () => {
    (globalThis.fetch as jest.Mock).mockRejectedValueOnce(new TypeError('Network request failed'));

    const error = await rejectionOf(request('/listings'));

    expect(error.isNetworkError).toBe(true);
  });

  it('signals an expired session on 401 when a token was sent', async () => {
    mockFetchOnce(401, { message: 'Unauthenticated.' });

    await request('/auth/me').catch(() => {});

    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });
});

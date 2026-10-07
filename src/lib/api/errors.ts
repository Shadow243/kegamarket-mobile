export type ValidationErrors = Record<string, string[]>;

/**
 * `status === 0` means the request never reached the server (offline, DNS, timeout), which the UI
 * must word differently from a rejection: "check your connection", not "wrong password".
 */
export class ApiError extends Error {
  readonly status: number;
  readonly errors: ValidationErrors;

  constructor(message: string, status: number, errors: ValidationErrors = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }

  get isNetworkError() {
    return this.status === 0;
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  firstFieldError(field: string): string | undefined {
    return this.errors[field]?.[0];
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/** Message for a form's banner; null when the error is already shown next to its fields. */
export function formLevelError(
  error: unknown,
  fallback: string,
  networkFallback: string,
): string | null {
  if (!error) return null;
  if (isApiError(error) && Object.keys(error.errors).length > 0) return null;
  return errorMessage(error, fallback, networkFallback);
}

/** Message to show for any thrown value, choosing the network wording when nothing reached the server. */
export function errorMessage(error: unknown, fallback: string, networkFallback: string): string {
  if (!isApiError(error)) return fallback;
  if (error.isNetworkError) return networkFallback;
  return error.message || fallback;
}

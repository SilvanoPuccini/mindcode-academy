/**
 * Centralized API client for the MindCode Academy backend.
 *
 * Two entry points, matched to the Server/Client Component boundary:
 *
 * - `publicFetch`: for public endpoints (`GET /courses`, `GET /courses/{slug}`,
 *   `GET /classes/{id}`). No session credentials. Safe to call from Server
 *   Components (build-time/request-time fetches) and from Client Components
 *   alike, since it never touches `localStorage` or `window`.
 *
 * - `apiFetch`: for authenticated endpoints (`/favorites/*`, `/progress/*`,
 *   `/auth/me`). Client-only: sends `credentials: "include"` so the
 *   httpOnly `mindcode_token` cookie set by the backend rides along.
 *   On a 401 it clears the cached profile and redirects to `/login`,
 *   unless called with `{ skipAuthRedirect: true }` (see below). This only
 *   makes sense in the browser, so calling it from a Server Component
 *   throws instead of silently doing nothing.
 */

import { clearSession } from '@/services/authApi';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number,
    /** Parsed JSON body of the error response, when available.
     *  Lets callers read rich payloads (e.g. the class-gate 401 body
     *  that carries course/title context for the lock screen). */
    public payload?: unknown
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

/**
 * Extracts a human-readable message from a FastAPI error payload.
 * `detail` may be a string (HTTP errors), a validation array (422s),
 * or an object carrying its own `msg` (e.g. the class-gate 401 body).
 */
function extractErrorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== 'object') return fallback;
  const detail = (data as Record<string, unknown>).detail;

  if (typeof detail === 'string') return detail;

  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0] as Record<string, unknown>;
    if (typeof first.msg === 'string') return first.msg;
  }

  if (
    detail &&
    typeof detail === 'object' &&
    !Array.isArray(detail) &&
    typeof (detail as Record<string, unknown>).msg === 'string'
  ) {
    return (detail as { msg: string }).msg;
  }

  return fallback;
}

async function throwForResponse(
  response: Response,
  fallbackMessage?: string
): Promise<never> {
  let message = fallbackMessage ?? `HTTP ${response.status}`;
  let payload: unknown = undefined;
  try {
    payload = await response.json();
    message = extractErrorMessage(payload, message);
  } catch {
    // Non-JSON body: keep the HTTP status message.
  }
  throw new ApiClientError(message, response.status, payload);
}

/**
 * Public, unauthenticated fetch against the API. Use from Server Components
 * (`GET /courses`, `GET /courses/{slug}`, `GET /classes/{id}`) or any place
 * that doesn't need the current user's session.
 */
export async function publicFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, options);

  if (!response.ok) {
    await throwForResponse(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

/**
 * Authenticated fetch for Client Components. Sends `credentials: "include"`
 * so the httpOnly session cookie (delivered by POST /auth/login|register)
 * is attached automatically by the browser - no token is ever read from
 * localStorage. On a 401 it clears the cached profile and, by default,
 * redirects to `/login`. Pass `{ skipAuthRedirect: true }` to keep the 401
 * in-page (the error still carries the parsed body via `ApiClientError.payload`)
 * — used by the class playback gate so it can render its own lock screen
 * instead of bouncing to `/login`.
 */
export type ApiFetchOptions = RequestInit & { skipAuthRedirect?: boolean };

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  if (typeof window === 'undefined') {
    throw new Error('apiFetch() is client-only; use publicFetch() in Server Components.');
  }

  const { skipAuthRedirect = false, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers);

  if (fetchOptions.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Forced (not defaulted) so no caller can accidentally drop the cookie
  // transport by spreading their own options without credentials.
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers,
    credentials: 'include',
  });

  if (response.status === 401) {
    // An invalid/expired session clears the cached profile either way;
    // only the redirect is optional so gated endpoints can surface their
    // own 401 UI.
    clearSession();
    if (!skipAuthRedirect) {
      window.location.href = '/login';
    }
    await throwForResponse(response, 'Sesión expirada. Iniciá sesión nuevamente.');
  }

  if (!response.ok) {
    await throwForResponse(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

/**
 * Centralized API client for the MindCode Academy backend.
 *
 * Two entry points, matched to the Server/Client Component boundary:
 *
 * - `publicFetch`: for public endpoints (`GET /courses`, `GET /courses/{slug}`,
 *   `GET /classes/{id}`). No auth header. Safe to call from Server Components
 *   (build-time/request-time fetches) and from Client Components alike, since
 *   it never touches `localStorage` or `window`.
 *
 * - `apiFetch`: for authenticated endpoints (`/favorites/*`, `/progress/*`).
 *   Client-only: reads the JWT saved by `authApi.saveSession` and injects it
 *   as `Authorization: Bearer <token>`. On a 401 it clears the session and
 *   redirects to `/login` — this only makes sense in the browser, so calling
 *   it from a Server Component throws instead of silently doing nothing.
 */

import { getToken, clearSession } from '@/services/authApi';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

/**
 * Extracts a human-readable message from a FastAPI error payload.
 * `detail` may be a string (HTTP errors) or a validation array (422s).
 */
function extractErrorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== 'object') return fallback;
  const detail = (data as Record<string, unknown>).detail;

  if (typeof detail === 'string') return detail;

  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0] as Record<string, unknown>;
    if (typeof first.msg === 'string') return first.msg;
  }

  return fallback;
}

async function throwForResponse(response: Response): Promise<never> {
  let message = `HTTP ${response.status}`;
  try {
    const data = await response.json();
    message = extractErrorMessage(data, message);
  } catch {
    // Non-JSON body: keep the HTTP status message.
  }
  throw new ApiClientError(message, response.status);
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
 * Authenticated fetch for Client Components. Injects the Bearer token from
 * `authApi` (localStorage) when present, and on a 401 clears the session and
 * redirects to `/login`. Never logs or exposes the token.
 */
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (typeof window === 'undefined') {
    throw new Error('apiFetch() is client-only; use publicFetch() in Server Components.');
  }

  const token = getToken();
  const headers = new Headers(options.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (response.status === 401) {
    clearSession();
    window.location.href = '/login';
    throw new ApiClientError('Sesión expirada. Iniciá sesión nuevamente.', 401);
  }

  if (!response.ok) {
    await throwForResponse(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

/**
 * Auth API Service
 * Handles registration and login against the
 * MindCode Academy backend auth endpoints.
 *
 * Session transport: the backend delivers the JWT as an httpOnly cookie
 * ("mindcode_token", set by POST /auth/login | /auth/register and cleared
 * by POST /auth/logout). The browser sends it automatically on every
 * request that uses `credentials: "include"` (see src/lib/api.ts), so no
 * token is ever stored in or read from localStorage here.
 *
 * Only the non-sensitive user profile is persisted locally, purely as an
 * instant-paint cache until `fetchCurrentUser()` validates the session
 * against the API at boot.
 *
 * Backend contract (Backend/app/routers/auth.py):
 * - POST /auth/register { email, password, name } -> 201 TokenResponse (+ Set-Cookie)
 * - POST /auth/login    { email, password }       -> 200 TokenResponse (+ Set-Cookie)
 * - POST /auth/logout                              -> 200 (clears the cookie)
 * - GET  /auth/me                                  -> UserResponse (401 when anonymous)
 */

import { apiFetch } from '@/lib/api';

// Base URL del backend API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Storage key for the non-sensitive profile cache, following the existing
// app convention ('mindcode_favorites', 'theme').
export const AUTH_USER_KEY = 'mindcode_user';

// Legacy keys from the pre-rebrand "MIND IA" naming, plus the old token
// entry from the previous localStorage-based session. Kept only so existing
// users are transparently migrated/cleaned up instead of breaking.
const LEGACY_AUTH_TOKEN_KEY = 'mindIA_token';
const LEGACY_AUTH_USER_KEY = 'mindIA_user';
const LEGACY_LOCAL_TOKEN_KEY = 'mindcode_token';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string | null;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Extracts a human-readable message from a FastAPI
 * error payload. `detail` may be a string (HTTP errors)
 * or an array of validation objects (422 responses).
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

async function parseErrorResponse(response: Response): Promise<never> {
  let message = `HTTP ${response.status}`;
  try {
    const data = await response.json();
    message = extractErrorMessage(data, message);
  } catch {
    // Non-JSON body: keep the HTTP status message.
  }
  throw new Error(message);
}

async function requestSession(
  endpoint: '/auth/login' | '/auth/register',
  body: LoginRequest | RegisterRequest
): Promise<TokenResponse> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    await parseErrorResponse(response);
  }

  return (await response.json()) as TokenResponse;
}

// Same-tab components (e.g. the Navbar) can't rely on the browser's
// 'storage' event to react to a login/logout - that event only fires
// in *other* tabs/windows. Dispatch this custom event alongside every
// session change so any mounted listener (see useAuth()) can update
// immediately, without a full page reload.
export const AUTH_CHANGE_EVENT = 'mindcode-auth-change';

function notifyAuthChange(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

/**
 * Persists only the non-sensitive user profile for instant paint.
 * The JWT itself lives exclusively in the httpOnly cookie delivered by
 * the backend, never in localStorage.
 */
function persistUser(user: AuthUser): void {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

async function login(credentials: LoginRequest): Promise<TokenResponse> {
  // The response also carries the httpOnly session cookie via Set-Cookie.
  const tokenResponse = await requestSession('/auth/login', credentials);
  persistUser(tokenResponse.user);
  notifyAuthChange();
  return tokenResponse;
}

async function register(payload: RegisterRequest): Promise<TokenResponse> {
  const tokenResponse = await requestSession('/auth/register', payload);
  persistUser(tokenResponse.user);
  notifyAuthChange();
  return tokenResponse;
}

/**
 * Validates the httpOnly-cookie session against the API.
 * Returns the fresh profile on success; throws ApiClientError on 401
 * (`skipAuthRedirect` keeps the caller in control of expired sessions).
 * Used at boot by useAuth() to hydrate/validate the cached profile.
 */
async function fetchCurrentUser(): Promise<AuthUser> {
  return apiFetch<AuthUser>('/auth/me', { skipAuthRedirect: true });
}

/**
 * Logs out: best-effort POST /auth/logout so the browser drops the
 * httpOnly cookie (network errors ignored - e.g. offline logouts should
 * still clear the local UI state), then clears the persisted profile.
 */
async function logout(): Promise<void> {
  try {
    await apiFetch('/auth/logout', { method: 'POST', skipAuthRedirect: true });
  } catch {
    // Cookie already gone, backend unreachable, etc.: nothing to do.
  }
  clearSession();
}

/**
 * One-time cleanup of legacy localStorage entries: the pre-rebrand "MIND IA"
 * keys and, importantly, the old plaintext JWT under 'mindcode_token' - it
 * must not linger now that tokens live in an httpOnly cookie.
 */
function cleanupLegacySessionKeys(): void {
  localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
  localStorage.removeItem(LEGACY_LOCAL_TOKEN_KEY);

  if (localStorage.getItem(AUTH_USER_KEY) === null) {
    const legacyUser = localStorage.getItem(LEGACY_AUTH_USER_KEY);
    if (legacyUser !== null) {
      localStorage.setItem(AUTH_USER_KEY, legacyUser);
      localStorage.removeItem(LEGACY_AUTH_USER_KEY);
    }
  }
}

/**
 * Returns the user profile cached by login()/register(), or null when
 * there is no cached value or it is malformed. This is NOT proof of a
 * valid session - validate with fetchCurrentUser().
 */
function getUser(): AuthUser | null {
  cleanupLegacySessionKeys();
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function clearSession(): void {
  cleanupLegacySessionKeys();
  localStorage.removeItem(AUTH_USER_KEY);
  notifyAuthChange();
}

export { clearSession, fetchCurrentUser, getUser, login, logout, register };

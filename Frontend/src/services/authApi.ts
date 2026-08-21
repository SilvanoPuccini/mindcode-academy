/**
 * Auth API Service
 * Handles registration and login against the
 * MindCode Academy backend auth endpoints.
 *
 * Backend contract (Backend/app/routers/auth.py):
 * - POST /auth/register { email, password, name } -> 201 TokenResponse
 * - POST /auth/login    { email, password }       -> 200 TokenResponse
 * - TokenResponse: { access_token, token_type, user }
 * - Errors: FastAPI { detail } (string or validation array)
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Storage keys follow the existing app convention
// ('mindcode_favorites', 'theme') using plain localStorage.
export const AUTH_TOKEN_KEY = 'mindcode_token';
export const AUTH_USER_KEY = 'mindcode_user';

// Legacy keys from the pre-rebrand "MIND IA" naming. Kept only so
// getToken()/getUser() can migrate an already-active session once,
// without logging the user out because of the rename.
const LEGACY_AUTH_TOKEN_KEY = 'mindIA_token';
const LEGACY_AUTH_USER_KEY = 'mindIA_user';

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

async function requestToken(
  endpoint: '/auth/login' | '/auth/register',
  body: LoginRequest | RegisterRequest
): Promise<TokenResponse> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    await parseErrorResponse(response);
  }

  return (await response.json()) as TokenResponse;
}

export async function login(credentials: LoginRequest): Promise<TokenResponse> {
  return requestToken('/auth/login', credentials);
}

export async function register(payload: RegisterRequest): Promise<TokenResponse> {
  return requestToken('/auth/register', payload);
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
 * Persists the session the same way other app data
 * is stored today: plain localStorage entries.
 */
export function saveSession(tokenResponse: TokenResponse): void {
  localStorage.setItem(AUTH_TOKEN_KEY, tokenResponse.access_token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(tokenResponse.user));
  notifyAuthChange();
}

/**
 * One-time, non-destructive migration from the pre-rebrand
 * "MIND IA" localStorage keys to the current "MindCode Academy"
 * ones. Runs lazily from getToken() so an already-logged-in user
 * doesn't get signed out just because of the naming change.
 */
function migrateLegacySessionKeys(): void {
  if (localStorage.getItem(AUTH_TOKEN_KEY) === null) {
    const legacyToken = localStorage.getItem(LEGACY_AUTH_TOKEN_KEY);
    if (legacyToken !== null) {
      localStorage.setItem(AUTH_TOKEN_KEY, legacyToken);
      localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
    }
  }

  if (localStorage.getItem(AUTH_USER_KEY) === null) {
    const legacyUser = localStorage.getItem(LEGACY_AUTH_USER_KEY);
    if (legacyUser !== null) {
      localStorage.setItem(AUTH_USER_KEY, legacyUser);
      localStorage.removeItem(LEGACY_AUTH_USER_KEY);
    }
  }
}

export function getToken(): string | null {
  migrateLegacySessionKeys();
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Returns the logged-in user persisted by saveSession(), or null when
 * there is no active session or the stored value is malformed.
 */
export function getUser(): AuthUser | null {
  migrateLegacySessionKeys();
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  notifyAuthChange();
}

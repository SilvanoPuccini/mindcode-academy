"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AUTH_CHANGE_EVENT,
  AuthUser,
  clearSession,
  fetchCurrentUser,
  getUser,
  login as loginService,
  logout as logoutService,
  LoginRequest,
  register as registerService,
  RegisterRequest,
  TokenResponse,
} from '@/services/authApi';
import { ApiClientError } from '@/lib/api';

export interface UseAuthResult {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** True while the boot-time session validation is in flight. */
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<TokenResponse>;
  register: (payload: RegisterRequest) => Promise<TokenResponse>;
  logout: () => Promise<void>;
}

/**
 * Reactive auth state for the cookie-based session.
 *
 * The JWT lives in an httpOnly cookie (never readable from JS), so the
 * client keeps a non-sensitive profile cache in localStorage purely for
 * instant first paint. On mount this hook validates that cache against
 * the API (`fetchCurrentUser()`):
 * - 200 -> hydrate with the fresh profile.
 * - 401 -> expired/invalid session: drop the cache, user is anonymous.
 * - other errors (offline, API down) -> keep the cached profile so a
 *   temporary network failure doesn't log the user out of the UI.
 *
 * Cross-tab/same-tab sync:
 * - `mindcode-auth-change` (dispatched by login()/logout()/clearSession())
 *   covers changes made in this same tab.
 * - the native `storage` event covers changes made in other tabs.
 */
export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === 'undefined') return null;
    return getUser();
  });
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    // Boot hydration: validate the cached profile against /auth/me.
    fetchCurrentUser()
      .then((freshUser) => {
        if (mountedRef.current) setUser(freshUser);
      })
      .catch((error) => {
        if (!mountedRef.current) return;
        if (error instanceof ApiClientError && error.status === 401) {
          clearSession();
          setUser(null);
        }
        // Other errors keep the optimistic cached user.
      })
      .finally(() => {
        if (mountedRef.current) setLoading(false);
      });

    const sync = () => setUser(getUser());
    window.addEventListener(AUTH_CHANGE_EVENT, sync);
    window.addEventListener('storage', sync);

    return () => {
      mountedRef.current = false;
      window.removeEventListener(AUTH_CHANGE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const login = useCallback(
    async (credentials: LoginRequest): Promise<TokenResponse> => {
      // login() persists the profile and dispatches AUTH_CHANGE_EVENT.
      const tokenResponse = await loginService(credentials);
      setUser(tokenResponse.user);
      return tokenResponse;
    },
    []
  );

  const register = useCallback(
    async (payload: RegisterRequest): Promise<TokenResponse> => {
      const tokenResponse = await registerService(payload);
      setUser(tokenResponse.user);
      return tokenResponse;
    },
    []
  );

  const logout = useCallback(async (): Promise<void> => {
    // Best-effort server logout (drops the httpOnly cookie), then clears
    // the local cache and notifies listeners via clearSession().
    await logoutService();
    setUser(null);
  }, []);

  return { user, isAuthenticated: user !== null, loading, login, register, logout };
}

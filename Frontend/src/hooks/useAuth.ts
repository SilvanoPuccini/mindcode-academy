"use client";

import { useCallback, useEffect, useState } from 'react';
import {
  AUTH_CHANGE_EVENT,
  AuthUser,
  clearSession,
  getToken,
  getUser,
} from '@/services/authApi';

export interface UseAuthResult {
  user: AuthUser | null;
  isAuthenticated: boolean;
  logout: () => void;
}

function readAuthState(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  if (!getToken()) return null;
  return getUser();
}

/**
 * Reactive read of the current auth session, kept in sync without a
 * full page reload:
 * - `mindcode-auth-change` (dispatched by saveSession()/clearSession())
 *   covers logins/logouts that happen in this same tab.
 * - the native `storage` event covers changes made in other tabs.
 */
export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<AuthUser | null>(() => readAuthState());

  useEffect(() => {
    const sync = () => setUser(readAuthState());

    sync();
    window.addEventListener(AUTH_CHANGE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  return { user, isAuthenticated: user !== null, logout };
}

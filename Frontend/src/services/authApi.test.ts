import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  AUTH_CHANGE_EVENT,
  AUTH_USER_KEY,
  clearSession,
  fetchCurrentUser,
  getUser,
  login,
  logout,
  register,
  AuthUser,
  TokenResponse,
} from "./authApi";

const user: AuthUser = {
  id: 7,
  email: "user@test.com",
  name: "Test User",
  is_active: true,
  is_verified: false,
  created_at: null,
};

const tokenResponse: TokenResponse = {
  access_token: "jwt-abc",
  token_type: "bearer",
  user,
};

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  };
}

beforeEach(() => {
  localStorage.clear();
});

describe("login", () => {
  it("sends credentials so the Set-Cookie lands, caches only the profile and notifies listeners", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(tokenResponse));
    global.fetch = fetchMock as unknown as typeof fetch;
    const onChange = vi.fn();
    window.addEventListener(AUTH_CHANGE_EVENT, onChange);

    const result = await login({ email: "user@test.com", password: "secret1A!" });

    // Cookie transport: credentials included, no Authorization header.
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("/auth/login");
    expect(init?.credentials).toBe("include");
    expect(new Headers(init?.headers).get("Authorization")).toBeNull();

    // Only the non-sensitive profile is persisted - never the JWT.
    expect(result).toEqual(tokenResponse);
    expect(JSON.parse(localStorage.getItem(AUTH_USER_KEY)!)).toEqual(user);
    expect(localStorage.getItem("mindcode_token")).toBeNull();

    // Same-tab subscribers (Navbar/useAuth) react without a reload.
    expect(onChange).toHaveBeenCalledTimes(1);
    window.removeEventListener(AUTH_CHANGE_EVENT, onChange);
  });

  it("surfaces the backend detail message and stores nothing on failure", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(
        jsonResponse({ detail: "Incorrect email or password" }, 401)
      ) as unknown as typeof fetch;

    await expect(login({ email: "user@test.com", password: "wrong1A!" })).rejects.toThrow(
      "Incorrect email or password"
    );
    expect(localStorage.getItem(AUTH_USER_KEY)).toBeNull();
  });
});

describe("register", () => {
  it("caches the new profile and notifies listeners", async () => {
    const onChange = vi.fn();
    window.addEventListener(AUTH_CHANGE_EVENT, onChange);
    global.fetch = vi
      .fn()
      .mockResolvedValue(jsonResponse(tokenResponse, 201)) as unknown as typeof fetch;

    await register({ name: "Test User", email: "user@test.com", password: "secret1A!" });

    expect(JSON.parse(localStorage.getItem(AUTH_USER_KEY)!)).toEqual(user);
    expect(onChange).toHaveBeenCalled();
    window.removeEventListener(AUTH_CHANGE_EVENT, onChange);
  });
});

describe("fetchCurrentUser", () => {
  it("validates the cookie session against /auth/me and returns the fresh profile", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(user));
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await fetchCurrentUser();

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("/auth/me");
    expect(init?.credentials).toBe("include");
    expect(result).toEqual(user);
  });

  it("throws on 401 so callers can drop a stale cached profile", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(jsonResponse({ detail: "Not authenticated" }, 401)) as unknown as typeof fetch;

    await expect(fetchCurrentUser()).rejects.toMatchObject({ status: 401 });
  });
});

describe("logout", () => {
  it("calls POST /auth/logout and clears the local cache", async () => {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ message: "Sesión cerrada" }));
    global.fetch = fetchMock as unknown as typeof fetch;
    const onChange = vi.fn();
    window.addEventListener(AUTH_CHANGE_EVENT, onChange);

    await logout();

    const [, init] = fetchMock.mock.calls[0];
    expect(init?.method).toBe("POST");
    expect(localStorage.getItem(AUTH_USER_KEY)).toBeNull();
    expect(onChange).toHaveBeenCalled();
    window.removeEventListener(AUTH_CHANGE_EVENT, onChange);
  });

  it("clears the local state even when the API call fails", async () => {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    global.fetch = vi.fn().mockRejectedValue(new Error("network down")) as unknown as typeof fetch;

    await expect(logout()).resolves.toBeUndefined();
    expect(localStorage.getItem(AUTH_USER_KEY)).toBeNull();
  });
});

describe("getUser / clearSession", () => {
  it("returns null for a missing or malformed cache", () => {
    expect(getUser()).toBeNull();

    localStorage.setItem(AUTH_USER_KEY, "{not-json");
    expect(getUser()).toBeNull();
  });

  it("migrates the legacy mindIA_user key once", () => {
    localStorage.setItem("mindIA_user", JSON.stringify(user));

    expect(getUser()).toEqual(user);
    expect(localStorage.getItem(AUTH_USER_KEY)).not.toBeNull();
    expect(localStorage.getItem("mindIA_user")).toBeNull();
  });

  it("clearSession drops the cache and scrubs legacy plaintext tokens", () => {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    localStorage.setItem("mindcode_token", "old-localstorage-jwt");
    localStorage.setItem("mindIA_token", "older-jwt");

    clearSession();

    expect(localStorage.getItem(AUTH_USER_KEY)).toBeNull();
    expect(localStorage.getItem("mindcode_token")).toBeNull();
    expect(localStorage.getItem("mindIA_token")).toBeNull();
  });
});

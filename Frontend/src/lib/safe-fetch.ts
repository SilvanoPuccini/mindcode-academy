/**
 * fetch wrapper that never hangs: aborts after timeoutMs.
 * Used by build-time prerendered routes (sitemap, home) where a sleeping
 * backend (Render free tier cold start) must not break deployment builds.
 */
export const BUILD_FETCH_TIMEOUT_MS = 10_000;

export async function fetchWithTimeout(
  input: string,
  init: RequestInit = {},
  timeoutMs: number = BUILD_FETCH_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

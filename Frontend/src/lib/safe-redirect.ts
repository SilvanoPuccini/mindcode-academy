// Shared by the login and register pages to resolve the ?next= query
// param after a successful auth redirect.

// Only same-origin absolute paths ("/foo") are accepted. Backslashes are
// normalized first because browsers treat "\\" as "/" inside URLs, so
// "/\evil.com" would otherwise resolve as a protocol-relative external URL.
export function getSafeRedirectPath(search: string): string {
  const next = new URLSearchParams(search).get('next');
  if (!next) return '/';

  const candidate = next.replace(/\\/g, '/');
  if (!candidate.startsWith('/') || candidate.startsWith('//')) {
    return '/';
  }
  return candidate;
}

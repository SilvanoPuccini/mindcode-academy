/**
 * Shared constants/helpers so the Navbar search
 * button (Navbar.tsx) and the home page (app/page.tsx)
 * can agree on how to reach and focus the catalog's
 * <SearchBar /> input without importing each other.
 */

// Must match the id on the <input> in SearchBar.tsx
export const SEARCH_INPUT_ID = 'site-search-input';

// Must match the id on the search section wrapper in
// SearchBar.tsx - used as the URL hash when navigating
// from a page that doesn't render the search bar.
export const SEARCH_HASH = '#buscador';

/**
 * Scrolls the home search input into view and focuses
 * it. No-ops on the server or if the input isn't mounted
 * (e.g. navigation hasn't landed on the home page yet).
 * Respects prefers-reduced-motion, same pattern used by
 * SearchBar.tsx and Categories.tsx for their own
 * scrollIntoView calls.
 */
export function focusSearchInput(): void {
  if (typeof window === 'undefined') return;
  const input = document.getElementById(SEARCH_INPUT_ID) as HTMLInputElement | null;
  if (!input) return;

  const prefersSmooth = window.matchMedia(
    '(prefers-reduced-motion: no-preference)'
  ).matches;
  input.scrollIntoView({
    behavior: prefersSmooth ? 'smooth' : 'auto',
    block: 'center',
  });
  input.focus();
}

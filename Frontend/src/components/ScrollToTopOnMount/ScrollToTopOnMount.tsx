"use client";

import { useEffect } from 'react';

// Resets the window scroll position to the top
// whenever it mounts. Fixes deep-linked course
// and class pages landing mid-scroll due to
// browser scroll restoration. Renders nothing.
export function ScrollToTopOnMount() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  return null;
}

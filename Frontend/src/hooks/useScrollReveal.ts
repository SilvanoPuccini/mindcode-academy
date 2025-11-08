import { useEffect, useRef, useState } from 'react';

interface UseScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

interface UseScrollRevealReturn {
  ref: React.RefObject<HTMLElement>;
  isVisible: boolean;
}

/**
 * Custom hook that uses Intersection Observer to detect when an element enters viewport
 *
 * @param options - Configuration options for the Intersection Observer
 * @param options.threshold - Percentage of element visibility required to trigger (0-1)
 * @param options.rootMargin - Margin around the root element (e.g., "0px 0px -100px 0px")
 * @param options.triggerOnce - If true, element stays visible after first appearance
 * @returns Object with ref to attach to element and isVisible boolean state
 *
 * @example
 * ```tsx
 * const { ref, isVisible } = useScrollReveal({ threshold: 0.2 });
 *
 * <div ref={ref} className={isVisible ? 'visible' : ''}>
 *   Content to reveal
 * </div>
 * ```
 */
export function useScrollReveal(
  options: UseScrollRevealOptions = {}
): UseScrollRevealReturn {
  const {
    threshold = 0.1,
    rootMargin = "0px",
    triggerOnce = true
  } = options;

  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check if browser supports Intersection Observer
    if (!('IntersectionObserver' in window)) {
      // Fallback: Make element visible immediately if API not supported
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);

            // If triggerOnce is true, stop observing after first intersection
            if (triggerOnce && element) {
              observer.unobserve(element);
            }
          } else if (!triggerOnce) {
            // Only update visibility if not triggerOnce mode
            setIsVisible(false);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    // Cleanup function
    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
}

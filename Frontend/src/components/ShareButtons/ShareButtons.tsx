"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Share2, X, Link2 } from 'lucide-react';
import styles from './ShareButtons.module.scss';
import { useRipple } from '@/hooks/useRipple';
import { useToast } from '@/contexts/ToastContext';

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
}

// Matches the SCSS `@media (max-width: 768px)` breakpoint where the
// dropdown becomes a full-width bottom sheet (always on-screen by
// construction) - the desktop-only positioning below doesn't apply there.
const MOBILE_BREAKPOINT_PX = 768;
const VIEWPORT_MARGIN_PX = 16;

export function ShareButtons({ url, title, description = '' }: ShareButtonsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<CSSProperties>({});
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const rippleProps = useRipple();
  const { showToast } = useToast();

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  // The dropdown used to be `position: absolute` inside the (relatively
  // positioned) trigger container. Two problems with that:
  // 1. It defaulted to right-aligned (`right: 0`), so when the trigger
  //    sits near the left edge of the page (as it does in the course
  //    hero) the panel's min-width pushed its left edge past the
  //    viewport's left edge, clipping it.
  // 2. Being nested inside the hero section (its own stacking context,
  //    same z-index as the main content section that follows it), the
  //    dropdown's high z-index only won *inside* that ancestor - the
  //    main content section still painted over the bottom of the panel.
  // Rendering it through a portal into document.body sidesteps both:
  // position is computed in fixed viewport coordinates (no stacking
  // context to escape) and clamped to stay fully on-screen.
  useLayoutEffect(() => {
    if (!isOpen) return undefined;
    if (typeof window === 'undefined') return undefined;

    const reposition = () => {
      const trigger = triggerRef.current;
      const dropdown = dropdownRef.current;
      if (!trigger || !dropdown) return;
      if (window.innerWidth <= MOBILE_BREAKPOINT_PX) {
        setDropdownStyle({});
        return;
      }

      const triggerRect = trigger.getBoundingClientRect();
      const dropdownWidth = dropdown.offsetWidth;
      const dropdownHeight = dropdown.offsetHeight;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Default: right edge aligned with the trigger's right edge,
      // just below it - same visual position as the old CSS default.
      const defaultLeft = triggerRect.right - dropdownWidth;
      const minLeft = VIEWPORT_MARGIN_PX;
      const maxLeft = viewportWidth - VIEWPORT_MARGIN_PX - dropdownWidth;
      const left = Math.min(Math.max(defaultLeft, minLeft), Math.max(maxLeft, minLeft));

      // Prefer opening below the trigger; flip above it if there isn't
      // enough room at the bottom of the viewport.
      const gap = 8;
      const fitsBelow = triggerRect.bottom + gap + dropdownHeight <= viewportHeight - VIEWPORT_MARGIN_PX;
      const top = fitsBelow
        ? triggerRect.bottom + gap
        : Math.max(VIEWPORT_MARGIN_PX, triggerRect.top - gap - dropdownHeight);

      setDropdownStyle({ position: 'fixed', top, left, right: 'auto' });
    };

    reposition();
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    return () => {
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
    };
  }, [isOpen]);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      showToast('Link copiado al portapapeles', 'success');
      setIsOpen(false);
    } catch (err) {
      showToast('Error al copiar el link', 'error');
    }
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
  };

  // Mobile browsers expose the native Web Share API:
  // prefer the OS share sheet there instead of our own
  // dropdown. Desktop browsers typically don't implement
  // navigator.share, so they keep the existing dropdown.
  const handleShareClick = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text: description, url });
      } catch (err) {
        // The user closing the native share sheet rejects
        // with AbortError - that's not a failure, so no toast.
        if (err instanceof Error && err.name === 'AbortError') return;
        showToast('Error al compartir', 'error');
      }
      return;
    }
    setIsOpen((open) => !open);
  };

  const dropdownPanel = (
    <>
      <div className={styles.overlay} onClick={() => setIsOpen(false)} />
      <div className={styles.dropdown} ref={dropdownRef} style={dropdownStyle}>
        <div className={styles.dropdownHeader}>
          <h3>Compartir curso</h3>
          <button className={styles.closeBtn} onClick={() => setIsOpen(false)} aria-label="Cerrar">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className={styles.shareOptions}>
          <button
            className={`${styles.socialBtn} ${styles.twitter} ripple-container`}
            onClick={() => handleShare('twitter')}
            {...rippleProps}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
            Twitter
          </button>

          <button
            className={`${styles.socialBtn} ${styles.facebook} ripple-container`}
            onClick={() => handleShare('facebook')}
            {...rippleProps}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </button>

          <button
            className={`${styles.socialBtn} ${styles.linkedin} ripple-container`}
            onClick={() => handleShare('linkedin')}
            {...rippleProps}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            LinkedIn
          </button>

          <button
            className={`${styles.socialBtn} ${styles.whatsapp} ripple-container`}
            onClick={() => handleShare('whatsapp')}
            {...rippleProps}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </button>

          <button
            className={`${styles.socialBtn} ${styles.copy} ripple-container`}
            onClick={handleCopyLink}
            {...rippleProps}
          >
            <Link2 size={24} aria-hidden="true" />
            Copiar link
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className={styles.shareContainer}>
      <button
        ref={triggerRef}
        className={`${styles.shareBtn} ripple-container`}
        onClick={handleShareClick}
        aria-label="Compartir"
        {...rippleProps}
      >
        <Share2 size={20} aria-hidden="true" />
        Compartir
      </button>

      {isOpen && mounted && createPortal(dropdownPanel, document.body)}
    </div>
  );
}

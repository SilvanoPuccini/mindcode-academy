import { useId } from "react";
import Link from "next/link";
import styles from "./Logo.module.scss";

interface LogoProps {
  /** Icon tile size in px. */
  size?: number;
  /** Show the "MindCode / ACADEMY" text lockup next to the icon. */
  withWordmark?: boolean;
  className?: string;
  onClick?: () => void;
}

/**
 * MindCode Academy brand mark: gradient tile with code brackets wrapping a
 * glued "MC" ligature. Shared by the Navbar, Footer and standalone auth pages
 * (login/register/forgot-password), which don't mount
 * the full Navbar but still need a clickable way back home.
 */
export function Logo({
  size = 36,
  withWordmark = false,
  className,
  onClick,
}: LogoProps) {
  // Unique-per-instance gradient id so several logos can coexist
  // on one page without their <defs> colliding (SVG ids are global).
  const gradientId = `mc-logo-gradient-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <Link
      href="/"
      aria-label={withWordmark ? undefined : "MindCode Academy"}
      className={className ? `${styles.logo} ${className}` : styles.logo}
      onClick={onClick}
    >
      <svg
        className={styles.icon}
        width={size}
        height={size}
        viewBox="0 0 64 64"
        role="img"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#EA580C" />
            <stop offset="1" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
        {/* Transparent background: pure [MC] mark in brand gradient */}
        <g
          stroke={`url(#${gradientId})`}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          {/* Left square bracket */}
          <path d="M17 15 H9 V49 H17" />
          {/* Glued MC ligature */}
          <path d="M22 43 L22 23 L26.5 32.5 L31 23 L31 43" />
          <path d="M42.8 27.3 A7 7 0 1 0 42.8 38.7" />
          {/* Right square bracket */}
          <path d="M47 15 H55 V49 H47" />
        </g>
      </svg>

      {withWordmark && (
        <span className={styles.wordmark}>
          <span className={styles.wordmarkTitle}>
            <span className={styles.titlePrimary}>Mind</span>
            <span className={styles.titleAccent}>Code</span>
          </span>
          <span className={styles.wordmarkSubtitle}>Academy</span>
        </span>
      )}
    </Link>
  );
}

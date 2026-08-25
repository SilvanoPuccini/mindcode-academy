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
            <stop offset="0" stopColor="#F97316" />
            <stop offset="1" stopColor="#DC2626" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="14" fill={`url(#${gradientId})`} />
        <g
          stroke="#FFFFFF"
          strokeWidth="3.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          {/* Left angle bracket */}
          <path d="M13 22 L5 32 L13 41" />
          {/* Glued MC ligature */}
          <path d="M17.5 41 L17.5 25 L22.5 33 L27.5 25 L27.5 41" />
          <path d="M43.5 28.2 A7.5 7.5 0 1 0 43.5 37.8" />
          {/* Right angle bracket */}
          <path d="M51 22 L59 32 L51 41" />
        </g>
      </svg>

      {withWordmark && (
        <span className={styles.wordmark}>
          <span className={styles.wordmarkTitle}>MindCode</span>
          <span className={styles.wordmarkSubtitle}>Academy</span>
        </span>
      )}
    </Link>
  );
}

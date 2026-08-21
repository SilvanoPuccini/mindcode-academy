import Link from "next/link";
import styles from "./Logo.module.scss";

interface LogoProps {
  className?: string;
  onClick?: () => void;
}

/**
 * MindCode Academy wordmark, linking back to the home page.
 * Shared by the Navbar and the standalone auth pages
 * (login/register/forgot-password), which don't mount
 * the full Navbar but still need a clickable way back.
 */
export function Logo({ className, onClick }: LogoProps) {
  return (
    <Link
      href="/"
      className={className ? `${styles.logo} ${className}` : styles.logo}
      onClick={onClick}
    >
      <span className={styles.logoMind}>Mind</span>
      <span className={styles.logoIA}>Code</span>
    </Link>
  );
}

"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Navbar.module.scss';
import { useCourses } from '@/contexts/CourseContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRipple } from '@/hooks/useRipple';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { favorites } = useCourses();
  const { theme, toggleTheme } = useTheme();
  const rippleProps = useRipple();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoMind}>MIND</span>
          <span className={styles.logoIA}>IA</span>
        </Link>

        {/* Hamburger Button - Mobile Only */}
        <button
          className={`${styles.hamburger} ${mobileMenuOpen ? styles.open : ''} ripple-container`}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          {...rippleProps}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Menu - Desktop */}
        <div className={styles.menu}>
          <Link href="/#cursos" className={styles.menuItem}>Cursos</Link>
          <Link href="/favorites" className={styles.menuItem}>
            Favoritos
            {favorites.length > 0 && (
              <span className={styles.badge}>{favorites.length}</span>
            )}
          </Link>
          <Link href="#profesores" className={styles.menuItem}>Profesores</Link>
          <Link href="#categorias" className={styles.menuItem}>Categorías</Link>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          {/* Theme Toggle */}
          <button
            className={`${styles.btnTheme} ripple-container`}
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
            {...rippleProps}
          >
            {theme === 'light' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            )}
          </button>
          <button className={`${styles.btnSearch} ripple-container`} {...rippleProps}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
          </button>
          <button className={`${styles.btnSecondary} ripple-container`} {...rippleProps}>
            Iniciar Sesión
          </button>
          <button className={`${styles.btnPrimary} ripple-container`} {...rippleProps}>
            Registrarse
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`${styles.mobileMenuOverlay} ${mobileMenuOpen ? styles.open : ''}`} onClick={toggleMobileMenu} />

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.open : ''}`}>
        <div className={styles.mobileMenuHeader}>
          <Link href="/" className={styles.logo} onClick={toggleMobileMenu}>
            <span className={styles.logoMind}>MIND</span>
            <span className={styles.logoIA}>IA</span>
          </Link>
          <button className={styles.closeBtn} onClick={toggleMobileMenu} aria-label="Cerrar menú">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <nav className={styles.mobileNav}>
          <Link href="/#cursos" className={styles.mobileMenuItem} onClick={toggleMobileMenu}>
            Cursos
          </Link>
          <Link href="/favorites" className={styles.mobileMenuItem} onClick={toggleMobileMenu}>
            Favoritos
            {favorites.length > 0 && (
              <span className={styles.badge}>{favorites.length}</span>
            )}
          </Link>
          <Link href="#profesores" className={styles.mobileMenuItem} onClick={toggleMobileMenu}>
            Profesores
          </Link>
          <Link href="#categorias" className={styles.mobileMenuItem} onClick={toggleMobileMenu}>
            Categorías
          </Link>
        </nav>

        <div className={styles.mobileActions}>
          <button
            className={`${styles.btnTheme} ripple-container`}
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
            {...rippleProps}
          >
            {theme === 'light' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            )}
            <span className={styles.themeLabel}>
              {theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
            </span>
          </button>

          <button className={`${styles.btnSecondary} ripple-container`} {...rippleProps}>
            Iniciar Sesión
          </button>
          <button className={`${styles.btnPrimary} ripple-container`} {...rippleProps}>
            Registrarse
          </button>
        </div>
      </div>
    </nav>
  );
}

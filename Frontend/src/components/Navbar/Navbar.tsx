"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Moon, Sun, Search as SearchIcon } from 'lucide-react';
import styles from './Navbar.module.scss';
import { useCourses } from '@/contexts/CourseContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRipple } from '@/hooks/useRipple';
import { useAuth } from '@/hooks/useAuth';
import { focusSearchInput, SEARCH_HASH } from '@/hooks/useSearchFocus';
import { Logo } from '@/components/Logo/Logo';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { favorites } = useCourses();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const rippleProps = useRipple();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    // Fire-and-forget: navigation shouldn't wait for the cookie cleanup.
    void logout();
    setMobileMenuOpen(false);
    router.push('/');
  };

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

  // On the home page the SearchBar is already mounted,
  // so just scroll to it and focus it. On any other
  // page (course detail, class, favorites...) navigate
  // home with the #buscador hash first; the home page's
  // own effect (app/page.tsx) picks up the hash on
  // mount and focuses the input once it's rendered.
  const handleSearchClick = () => {
    if (pathname === '/') {
      focusSearchInput();
    } else {
      router.push(`/${SEARCH_HASH}`);
    }
  };

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`} aria-label="Navegación principal">
      <div className={styles.container}>
        {/* Logo */}
        <Logo withWordmark />

        {/* Hamburger Button - Mobile Only */}
        <button
          className={`${styles.hamburger} ${mobileMenuOpen ? styles.open : ''} ripple-container`}
          onClick={toggleMobileMenu}
          aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={mobileMenuOpen}
          {...rippleProps}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Menu - Desktop */}
        <div className={styles.menu}>
          <Link href="/#catalogo" className={styles.menuItem}>Cursos</Link>
          {isAuthenticated && (
            <Link href="/aula" className={styles.menuItem}>Mi Aula</Link>
          )}
          <Link href="/favorites" className={styles.menuItem}>
            Favoritos
            {favorites.length > 0 && (
              <span className={styles.badge}>{favorites.length}</span>
            )}
          </Link>
          <Link href="/ayuda" className={styles.menuItem}>Ayuda</Link>
          <Link href="/comunidad" className={styles.menuItem}>Comunidad</Link>
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
              <Moon size={20} aria-hidden="true" />
            ) : (
              <Sun size={20} aria-hidden="true" />
            )}
          </button>
          <button
            className={`${styles.btnSearch} ripple-container`}
            onClick={handleSearchClick}
            aria-label="Buscar cursos"
            {...rippleProps}
          >
            <SearchIcon size={20} aria-hidden="true" />
          </button>
          {isAuthenticated && user ? (
            <div className={styles.userMenu}>
              <span className={styles.userAvatar} aria-hidden="true">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <span className={styles.userName}>{user.name}</span>
              <button
                type="button"
                className={`${styles.btnLogout} ripple-container`}
                onClick={handleLogout}
                {...rippleProps}
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className={`${styles.btnLogin} ripple-container`} {...rippleProps}>
                Iniciar Sesión
              </Link>
              <Link href="/register" className={`${styles.btnRegister} ripple-container`} {...rippleProps}>
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`${styles.mobileMenuOverlay} ${mobileMenuOpen ? styles.open : ''}`} onClick={toggleMobileMenu} />

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.open : ''}`}>
        <div className={styles.mobileMenuHeader}>
          <Logo withWordmark onClick={toggleMobileMenu} />
          {/* No separate close button: the animated hamburger in the
              navbar already toggles to an X state and closes the menu. */}
        </div>

        <nav className={styles.mobileNav}>
          <Link href="/#catalogo" className={styles.mobileMenuItem} onClick={toggleMobileMenu}>
            Cursos
          </Link>
          {isAuthenticated && (
            <Link href="/aula" className={styles.mobileMenuItem} onClick={toggleMobileMenu}>
              Mi Aula
            </Link>
          )}
          <Link href="/favorites" className={styles.mobileMenuItem} onClick={toggleMobileMenu}>
            Favoritos
            {favorites.length > 0 && (
              <span className={styles.badge}>{favorites.length}</span>
            )}
          </Link>
          <Link href="/ayuda" className={styles.mobileMenuItem} onClick={toggleMobileMenu}>
            Ayuda
          </Link>
          <Link href="/comunidad" className={styles.mobileMenuItem} onClick={toggleMobileMenu}>
            Comunidad
          </Link>
        </nav>

        <div className={styles.mobileActions}>
          <button
            className={`${styles.btnSearch} ripple-container`}
            onClick={() => {
              toggleMobileMenu();
              handleSearchClick();
            }}
            aria-label="Buscar cursos"
            {...rippleProps}
          >
            <SearchIcon size={20} aria-hidden="true" />
            <span className={styles.themeLabel}>Buscar</span>
          </button>

          <button
            className={`${styles.btnTheme} ripple-container`}
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
            {...rippleProps}
          >
            {theme === 'light' ? (
              <Moon size={20} aria-hidden="true" />
            ) : (
              <Sun size={20} aria-hidden="true" />
            )}
            <span className={styles.themeLabel}>
              {theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
            </span>
          </button>

          {isAuthenticated && user ? (
            <div className={styles.mobileUserMenu}>
              <span className={styles.userAvatar} aria-hidden="true">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <span className={styles.userName}>{user.name}</span>
              <button
                type="button"
                className={`${styles.btnLogout} ripple-container`}
                onClick={handleLogout}
                {...rippleProps}
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className={`${styles.btnLogin} ripple-container`} onClick={toggleMobileMenu} {...rippleProps}>
                Iniciar Sesión
              </Link>
              <Link href="/register" className={`${styles.btnRegister} ripple-container`} onClick={toggleMobileMenu} {...rippleProps}>
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

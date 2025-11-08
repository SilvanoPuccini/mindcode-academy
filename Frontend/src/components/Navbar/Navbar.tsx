"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Navbar.module.scss';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoMind}>MIND</span>
          <span className={styles.logoIA}>IA</span>
        </Link>

        {/* Menu */}
        <div className={styles.menu}>
          <Link href="#cursos" className={styles.menuItem}>Cursos</Link>
          <Link href="#profesores" className={styles.menuItem}>Profesores</Link>
          <Link href="#categorias" className={styles.menuItem}>Categorías</Link>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button className={styles.btnSearch}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
          </button>
          <button className={styles.btnSecondary}>Iniciar Sesión</button>
          <button className={styles.btnPrimary}>Registrarse</button>
        </div>
      </div>
    </nav>
  );
}

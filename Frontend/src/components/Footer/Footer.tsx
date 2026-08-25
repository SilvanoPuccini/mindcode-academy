"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/contexts/ToastContext';
import { Logo } from '@/components/Logo/Logo';
import styles from './Footer.module.scss';

// Real, editorial-worthy slice of the course-taxonomy.ts categories
// (see lib/course-taxonomy.ts): each link deep-links home with that
// category pre-selected via ?categoria=<key>, consumed by app/page.tsx.
const COURSE_CATEGORY_LINKS = [
  { key: 'react', label: 'React' },
  { key: 'ia-ml', label: 'IA & Machine Learning' },
  { key: 'devops-cloud', label: 'DevOps & Cloud' },
  { key: 'ux-ui', label: 'Diseño UX/UI' },
  { key: 'mobile', label: 'Desarrollo Móvil' },
];

const SUPPORT_LINKS = [
  { href: '/ayuda', label: 'Centro de Ayuda' },
  { href: '/faq', label: 'FAQs' },
  { href: '/contacto', label: 'Contacto' },
  { href: '/terminos', label: 'Términos de Servicio' },
  { href: '/privacidad', label: 'Política de Privacidad' },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Footer() {
  const { showToast } = useToast();
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleNewsletterSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!EMAIL_PATTERN.test(newsletterEmail)) {
      showToast('Ingresá un email válido', 'error');
      return;
    }

    // TODO: conectar a un endpoint de newsletter cuando exista
    showToast('¡Listo! Te suscribiste al newsletter.', 'success');
    setNewsletterEmail('');
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Column 1: About */}
          <div className={styles.column}>
            <div className={styles.lockup}>
              <Logo withWordmark />
            </div>
            <p className={styles.description}>
              Aprende con inteligencia artificial. La mejor plataforma de cursos online para impulsar tu carrera.
            </p>
            {/* No hay cuentas de redes sociales activas todavía:
                los íconos quedan visibles pero no navegables. */}
            <div className={styles.social}>
              <span
                className={styles.socialLink}
                aria-label="Twitter (próximamente)"
                title="Próximamente"
                aria-disabled="true"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                </svg>
              </span>
              <span
                className={styles.socialLink}
                aria-label="GitHub (próximamente)"
                title="Próximamente"
                aria-disabled="true"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </span>
              <span
                className={styles.socialLink}
                aria-label="LinkedIn (próximamente)"
                title="Próximamente"
                aria-disabled="true"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </span>
            </div>
          </div>

          {/* Column 2: Cursos */}
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Cursos</h3>
            <ul className={styles.links}>
              {COURSE_CATEGORY_LINKS.map((category) => (
                <li key={category.key}>
                  <Link href={`/?categoria=${category.key}`}>{category.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Soporte */}
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Soporte</h3>
            <ul className={styles.links}>
              {SUPPORT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Newsletter</h3>
            <p className={styles.newsletterText}>
              Suscríbete para recibir las últimas actualizaciones y ofertas exclusivas.
            </p>
            <form className={styles.newsletterForm} onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                placeholder="Tu email"
                className={styles.newsletterInput}
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                aria-label="Email para el newsletter"
              />
              <button type="submit" className={styles.newsletterBtn}>
                Suscribirse
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © 2026 <span className={styles.brandGradient}>MindCode Academy</span>. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

import { ReactNode } from 'react';
import { Navbar } from '@/components/Navbar/Navbar';
import { Footer } from '@/components/Footer/Footer';
import { ScrollProgress } from '@/components/ScrollProgress/ScrollProgress';
import styles from './ContentPage.module.scss';

interface ContentPageProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  children: ReactNode;
}

// Shared shell for static/informational pages (Ayuda, FAQ, Contacto,
// Términos, Privacidad): Navbar on top, a centered card with the page
// content, Footer at the bottom - same layout language as the rest
// of the site (see favorites/page.tsx for the header pattern this
// mirrors).
export function ContentPage({ eyebrow, title, subtitle, children }: ContentPageProps) {
  return (
    <>
      <ScrollProgress />
      <Navbar />

      <div className={styles.page}>
        <div className={styles.container}>
          <header className={styles.header}>
            {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
            <h1 className={styles.title}>{title}</h1>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </header>

          <div className={styles.card}>{children}</div>
        </div>
      </div>

      <Footer />
    </>
  );
}

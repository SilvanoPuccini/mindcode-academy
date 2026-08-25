import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowDown, Heart } from 'lucide-react';
import styles from './Hero.module.scss';

interface HeroProps {
  /**
   * Primary action slot rendered directly under the copy.
   * The home page mounts the SearchBar here so search is
   * THE hero action (Udemy/Coursera-style content-first hero).
   */
  children?: ReactNode;
}

// Landing hero with a strict hierarchy: eyebrow chip -> headline ->
// subheadline -> primary slot (SearchBar) -> secondary links.
// The only decoration is a CSS-only gradient blob; no image assets.
export function Hero({ children }: HeroProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.content}>
          <p className={styles.eyebrow}>Plataforma de aprendizaje para desarrolladores</p>

          <h1 className={styles.title}>
            Aprendé. Programá. <span className={styles.highlight}>Construí.</span>
          </h1>

          <p className={styles.subtitle}>
            Cursos prácticos de programación para pasar de la idea al código,
            a tu ritmo y con proyectos reales.
          </p>

          {children}

          <div className={styles.secondaryLinks}>
            <Link href="/#catalogo" className={styles.ghostLink}>
              Explorar cursos
              <ArrowDown size={16} aria-hidden="true" />
            </Link>
            <Link href="/favorites" className={styles.textLink}>
              <Heart size={16} aria-hidden="true" />
              Ver favoritos
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative brand blob, same visual language as the body canvas */}
      <div className={styles.blob} aria-hidden="true" />
    </section>
  );
}

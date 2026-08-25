import Link from 'next/link';
import { Compass, Home } from 'lucide-react';
import styles from './not-found.module.scss';

// Theme-aware 404: a centered card over the global
// body canvas (unlike error.tsx, which is an
// intentional dark takeover). Big gradient "404",
// voseo copy and two clear escape routes.
export default function NotFound() {
  return (
    <main className={styles.notFound}>
      <div className={styles.card}>
        <span className={styles.eyebrow}>Error 404</span>

        <p className={styles.code} aria-hidden="true">
          404
        </p>

        <h1 className={styles.title}>Esta página se perdió en el código</h1>

        <p className={styles.message}>
          Quizá el enlace está roto o la página cambió de ruta.
          Probá volver al inicio o explorar el catálogo para encontrar
          lo que buscabas.
        </p>

        <div className={styles.actions}>
          <Link href="/" className={styles.primaryBtn}>
            <Home size={18} aria-hidden="true" />
            Volver al inicio
          </Link>
          <Link href="/#catalogo" className={styles.ghostBtn}>
            <Compass size={18} aria-hidden="true" />
            Explorar cursos
          </Link>
        </div>
      </div>
    </main>
  );
}

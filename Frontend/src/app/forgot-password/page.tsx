"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/Logo/Logo';
import styles from './page.module.scss';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    // TODO: conectar a POST /auth/forgot-password cuando exista el endpoint
    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <main className={styles.authPage}>
      <div className={styles.card}>
        <div className={styles.logoWrap}>
          <Logo />
        </div>

        <header className={styles.header}>
          <h1 className={styles.title}>Recuperar Contraseña</h1>
          <p className={styles.subtitle}>
            Ingresa tu email y te enviaremos instrucciones para restablecer tu
            contraseña.
          </p>
        </header>

        {submitted ? (
          <p className={styles.confirmation} role="status">
            Si el correo existe, te enviamos las instrucciones.
          </p>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.field}>
              <label htmlFor="forgot-email" className={styles.label}>
                Email
              </label>
              <input
                id="forgot-email"
                type="email"
                autoComplete="email"
                required
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
              />
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={submitting}
              aria-busy={submitting}
            >
              {submitting && (
                <Loader2 size={18} className={styles.spinner} aria-hidden="true" />
              )}
              {submitting ? 'Enviando...' : 'Enviar instrucciones'}
            </button>
          </form>
        )}

        <p className={styles.switchPrompt}>
          <Link href="/login" className={styles.switchLink}>
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </main>
  );
}

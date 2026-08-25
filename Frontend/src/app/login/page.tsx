"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { login } from '@/services/authApi';
import { getSafeRedirectPath } from '@/lib/safe-redirect';
import { Logo } from '@/components/Logo/Logo';
import styles from './page.module.scss';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // login() delivers the httpOnly session cookie, caches the profile
      // and notifies listeners (Navbar updates without a reload).
      await login({ email, password });
      // Honor ?next= when present (validated against open redirects).
      router.push(getSafeRedirectPath(window.location.search));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo iniciar sesión'
      );
      setSubmitting(false);
    }
  };

  return (
    <main className={styles.authPage}>
      <div className={styles.card}>
        <div className={styles.logoWrap}>
          <Logo />
        </div>

        <header className={styles.header}>
          <h1 className={styles.title}>Iniciar Sesión</h1>
          <p className={styles.subtitle}>
            Bienvenido de vuelta. Continúa aprendiendo donde lo dejaste.
          </p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <div className={styles.field}>
            <label htmlFor="login-email" className={styles.label}>
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="login-password" className={styles.label}>
              Contraseña
            </label>
            <div className={styles.passwordWrap}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contraseña"
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword((value) => !value)}
                aria-label={
                  showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                }
              >
                {showPassword ? (
                  <EyeOff size={18} aria-hidden="true" />
                ) : (
                  <Eye size={18} aria-hidden="true" />
                )}
              </button>
            </div>
            <Link href="/forgot-password" className={styles.forgotLink}>
              ¿Olvidaste tu contraseña?
            </Link>
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
            {submitting ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p className={styles.switchPrompt}>
          ¿No tienes cuenta?{' '}
          <Link href="/register" className={styles.switchLink}>
            Regístrate
          </Link>
        </p>
      </div>
    </main>
  );
}

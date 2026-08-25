"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Check, X } from 'lucide-react';
import { register } from '@/services/authApi';
import { getSafeRedirectPath } from '@/lib/safe-redirect';
import { Logo } from '@/components/Logo/Logo';
import styles from './page.module.scss';

interface PasswordRule {
  id: string;
  label: string;
  test: (value: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
  {
    id: 'length',
    label: 'Mínimo 8 caracteres',
    test: (value) => value.length >= 8,
  },
  {
    id: 'uppercase',
    label: 'Al menos una mayúscula',
    test: (value) => /[A-Z]/.test(value),
  },
  {
    id: 'number',
    label: 'Al menos un número',
    test: (value) => /[0-9]/.test(value),
  },
  {
    id: 'symbol',
    label: 'Al menos un símbolo especial',
    test: (value) => /[^A-Za-z0-9]/.test(value),
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const passwordChecks = PASSWORD_RULES.map((rule) => ({
    ...rule,
    valid: rule.test(password),
  }));
  const isPasswordStrong = passwordChecks.every((check) => check.valid);
  const passwordsMatch = confirmPassword.length === 0 || confirmPassword === password;
  const showPasswordMismatch = confirmPassword.length > 0 && confirmPassword !== password;
  const canSubmit = isPasswordStrong && confirmPassword.length > 0 && passwordsMatch;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!canSubmit) return;

    setSubmitting(true);

    try {
      // register() delivers the httpOnly session cookie, caches the
      // profile and notifies listeners (Navbar updates without a reload).
      await register({ name, email, password });
      // Honor ?next= when present (validated against open redirects).
      router.push(getSafeRedirectPath(window.location.search));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo crear la cuenta'
      );
      setSubmitting(false);
    }
  };

  return (
    <main className={styles.authPage}>
      <div className={styles.card}>
        <div className={styles.logoWrap}>
          <Logo withWordmark />
        </div>

        <header className={styles.header}>
          <h1 className={styles.title}>Creá tu cuenta</h1>
          <p className={styles.subtitle}>
            Sumate y empezá a aprender con inteligencia artificial.
          </p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <div className={styles.field}>
            <label htmlFor="register-name" className={styles.label}>
              Nombre
            </label>
            <input
              id="register-name"
              type="text"
              autoComplete="name"
              required
              minLength={2}
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="register-email" className={styles.label}>
              Email
            </label>
            <input
              id="register-email"
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
            <label htmlFor="register-password" className={styles.label}>
              Contraseña
            </label>
            <div className={styles.passwordWrap}>
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                minLength={8}
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                aria-describedby="password-hint"
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
            <p id="password-hint" className={styles.hint}>
              Mínimo 8 caracteres, con mayúscula, número y un símbolo especial.
            </p>

            <ul className={styles.passwordChecklist} aria-label="Reglas de contraseña segura">
              {passwordChecks.map((check) => (
                <li
                  key={check.id}
                  className={`${styles.passwordRule} ${check.valid ? styles.passwordRuleValid : ''}`}
                >
                  {check.valid ? (
                    <Check size={14} aria-hidden="true" />
                  ) : (
                    <X size={14} aria-hidden="true" />
                  )}
                  {check.label}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.field}>
            <label htmlFor="register-confirm-password" className={styles.label}>
              Repetir contraseña
            </label>
            <div className={styles.passwordWrap}>
              <input
                id="register-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                className={styles.input}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu contraseña"
                aria-invalid={showPasswordMismatch}
                aria-describedby={
                  showPasswordMismatch ? 'confirm-password-error' : undefined
                }
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowConfirmPassword((value) => !value)}
                aria-label={
                  showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                }
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} aria-hidden="true" />
                ) : (
                  <Eye size={18} aria-hidden="true" />
                )}
              </button>
            </div>
            {showPasswordMismatch && (
              <p id="confirm-password-error" className={styles.fieldError} role="alert">
                Las contraseñas no coinciden
              </p>
            )}
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={submitting || !canSubmit}
            aria-busy={submitting}
          >
            {submitting && (
              <Loader2 size={18} className={styles.spinner} aria-hidden="true" />
            )}
            {submitting ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className={styles.switchPrompt}>
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" className={styles.switchLink}>
            Iniciá sesión
          </Link>
        </p>
      </div>
    </main>
  );
}

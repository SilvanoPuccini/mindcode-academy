"use client";

import { useState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import styles from './page.module.scss';

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    // TODO: conectar a un endpoint de contacto cuando exista
    setSubmitted(true);
    setSubmitting(false);
    setName('');
    setEmail('');
    setMessage('');
  };

  if (submitted) {
    return (
      <div className={styles.confirmation} role="status">
        <CheckCircle2 size={40} aria-hidden="true" />
        <h2>¡Mensaje enviado!</h2>
        <p>
          Gracias por escribirnos. Nuestro equipo va a revisar tu mensaje y te
          va a responder a la brevedad.
        </p>
        <button
          type="button"
          className={styles.secondaryBtn}
          onClick={() => setSubmitted(false)}
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <label htmlFor="contact-name" className={styles.label}>
          Nombre
        </label>
        <input
          id="contact-name"
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
        <label htmlFor="contact-email" className={styles.label}>
          Email
        </label>
        <input
          id="contact-email"
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
        <label htmlFor="contact-message" className={styles.label}>
          Mensaje
        </label>
        <textarea
          id="contact-message"
          required
          minLength={10}
          rows={6}
          className={styles.textarea}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Contanos en qué podemos ayudarte"
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
        {submitting ? 'Enviando...' : 'Enviar mensaje'}
      </button>
    </form>
  );
}

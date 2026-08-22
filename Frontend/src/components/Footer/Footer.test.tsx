import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Footer } from './Footer';

const showToast = vi.fn();

vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({ showToast }),
}));

describe('Footer', () => {
  it('links each course category to the home page with the real taxonomy key', () => {
    render(<Footer />);

    expect(screen.getByRole('link', { name: 'React' })).toHaveAttribute(
      'href',
      '/?categoria=react'
    );
    expect(
      screen.getByRole('link', { name: 'IA & Machine Learning' })
    ).toHaveAttribute('href', '/?categoria=ia-ml');
    expect(
      screen.getByRole('link', { name: 'Diseño UX/UI' })
    ).toHaveAttribute('href', '/?categoria=ux-ui');
    expect(
      screen.getByRole('link', { name: 'Desarrollo Móvil' })
    ).toHaveAttribute('href', '/?categoria=mobile');
    expect(
      screen.getByRole('link', { name: 'DevOps & Cloud' })
    ).toHaveAttribute('href', '/?categoria=devops-cloud');
  });

  it('links the Soporte column to the new real pages', () => {
    render(<Footer />);

    expect(screen.getByRole('link', { name: 'Centro de Ayuda' })).toHaveAttribute(
      'href',
      '/ayuda'
    );
    expect(screen.getByRole('link', { name: 'FAQs' })).toHaveAttribute(
      'href',
      '/faq'
    );
    expect(screen.getByRole('link', { name: 'Contacto' })).toHaveAttribute(
      'href',
      '/contacto'
    );
    expect(
      screen.getByRole('link', { name: 'Términos de Servicio' })
    ).toHaveAttribute('href', '/terminos');
    expect(
      screen.getByRole('link', { name: 'Política de Privacidad' })
    ).toHaveAttribute('href', '/privacidad');
  });

  it('renders social icons as non-interactive placeholders (no href, no accounts yet)', () => {
    render(<Footer />);

    expect(
      screen.queryByRole('link', { name: /twitter/i })
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText(/twitter/i)).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it('rejects an invalid newsletter email without subscribing', () => {
    render(<Footer />);

    const input = screen.getByLabelText('Email para el newsletter');
    fireEvent.change(input, { target: { value: 'not-an-email' } });
    fireEvent.submit(input.closest('form')!);

    expect(showToast).toHaveBeenCalledWith('Ingresá un email válido', 'error');
  });

  it('subscribes with a valid email and clears the input', () => {
    render(<Footer />);

    const input = screen.getByLabelText(
      'Email para el newsletter'
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'student@example.com' } });
    fireEvent.submit(input.closest('form')!);

    expect(showToast).toHaveBeenCalledWith(
      '¡Listo! Te suscribiste al newsletter.',
      'success'
    );
    expect(input.value).toBe('');
  });
});

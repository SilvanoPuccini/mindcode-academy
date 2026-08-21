import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ForgotPasswordPage from './page';

describe('ForgotPasswordPage', () => {
  it('renders an email form and a link back to login', () => {
    render(<ForgotPasswordPage />);

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar instrucciones/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /volver a iniciar sesión/i })).toHaveAttribute(
      'href',
      '/login'
    );
  });

  it('shows a confirmation message after submitting, without calling any endpoint', () => {
    const fetchSpy = vi.fn();
    global.fetch = fetchSpy as unknown as typeof fetch;

    render(<ForgotPasswordPage />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /enviar instrucciones/i }));

    expect(
      screen.getByText('Si el correo existe, te enviamos las instrucciones.')
    ).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

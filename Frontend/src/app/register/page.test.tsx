import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RegisterPage from './page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('RegisterPage', () => {
  it('renders the shared Logo linking back to home', () => {
    render(<RegisterPage />);
    const logoLink = screen.getByRole('link', { name: /mind\s*code/i });
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('keeps the submit button disabled until the password is strong and confirmed', () => {
    render(<RegisterPage />);
    const submitBtn = screen.getByRole('button', { name: /registrarse/i });
    expect(submitBtn).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'Abcdefg1!' },
    });
    // Strong password but no confirmation yet.
    expect(submitBtn).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Repetir contraseña'), {
      target: { value: 'Abcdefg1!' },
    });
    expect(submitBtn).toBeEnabled();
  });

  it('shows an inline error when the passwords do not match', () => {
    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'Abcdefg1!' },
    });
    fireEvent.change(screen.getByLabelText('Repetir contraseña'), {
      target: { value: 'Abcdefg1?' },
    });

    expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /registrarse/i })).toBeDisabled();
  });

  it('updates the password rules checklist live as the user types', () => {
    render(<RegisterPage />);
    const passwordInput = screen.getByLabelText('Contraseña');

    const lengthRule = screen.getByText('Mínimo 8 caracteres');
    const uppercaseRule = screen.getByText('Al menos una mayúscula');
    const numberRule = screen.getByText('Al menos un número');
    const symbolRule = screen.getByText('Al menos un símbolo especial');

    // Nothing satisfied yet.
    [lengthRule, uppercaseRule, numberRule, symbolRule].forEach((rule) => {
      expect(rule.closest('li')?.className).not.toMatch(/passwordRuleValid/);
    });

    fireEvent.change(passwordInput, { target: { value: 'Abcdefg1!' } });

    [lengthRule, uppercaseRule, numberRule, symbolRule].forEach((rule) => {
      expect(rule.closest('li')?.className).toMatch(/passwordRuleValid/);
    });
  });
});

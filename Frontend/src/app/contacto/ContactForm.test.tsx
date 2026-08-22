import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ContactForm } from './ContactForm';

describe('ContactForm', () => {
  it('shows an inline confirmation after submitting the form and clears the fields', () => {
    render(<ContactForm />);

    fireEvent.change(screen.getByLabelText('Nombre'), {
      target: { value: 'Ada Lovelace' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'ada@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Mensaje'), {
      target: { value: 'Tengo una pregunta sobre un curso.' },
    });

    fireEvent.click(screen.getByRole('button', { name: /enviar mensaje/i }));

    expect(screen.getByText('¡Mensaje enviado!')).toBeInTheDocument();
    expect(screen.queryByLabelText('Nombre')).not.toBeInTheDocument();
  });

  it('lets the user send another message, resetting the form', () => {
    render(<ContactForm />);

    fireEvent.change(screen.getByLabelText('Nombre'), {
      target: { value: 'Ada Lovelace' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'ada@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Mensaje'), {
      target: { value: 'Tengo una pregunta sobre un curso.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /enviar mensaje/i }));

    fireEvent.click(screen.getByRole('button', { name: /enviar otro mensaje/i }));

    const nameInput = screen.getByLabelText('Nombre') as HTMLInputElement;
    expect(nameInput.value).toBe('');
  });
});

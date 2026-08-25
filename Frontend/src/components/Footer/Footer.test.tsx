import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Footer } from './Footer';
import type { Course } from '@/types';

vi.mock('@/contexts/CourseContext', () => ({
  useCourses: vi.fn(),
}));

const toastMocks = vi.hoisted(() => ({
  showToast: vi.fn(),
}));

vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({ showToast: toastMocks.showToast }),
}));

import { useCourses } from '@/contexts/CourseContext';
const mockedUseCourses = vi.mocked(useCourses);

// Minimal catalog fixture; only name/description matter
// because category inference runs over that text.
const course = (name: string, description: string): Course => ({
  id: Math.floor(Math.random() * 10000),
  name,
  description,
  thumbnail: 'https://example.com/thumb.jpg',
  slug: name.toLowerCase().replace(/\s+/g, '-'),
});

describe('Footer', () => {
  it('falls back to the evergreen categories when the catalog is empty', () => {
    mockedUseCourses.mockReturnValue({ allCourses: [] } as never);

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

  it('derives the top 5 real categories from the loaded catalog', () => {
    // 3 React courses, 2 Python, 1 Git: the column should rank by count.
    const allCourses = [
      course('React desde cero', 'Curso de React y Next.js para frontend'),
      course('React avanzado', 'Patrones profesionales de React en producción'),
      course('React Native móvil', 'Apps móviles con React'),
      course('Python básico', 'Aprendé Python desde cero'),
      course('Django con Python', 'Backend web con Python y Django'),
      course('Git y GitHub', 'Control de versiones con Git'),
    ];
    mockedUseCourses.mockReturnValue({ allCourses } as never);

    render(<Footer />);

    const expected = [
      '/?categoria=react',
      '/?categoria=python',
      '/?categoria=git',
    ];
    const links = screen.getAllByRole('link', {
      name: /React|Python|Git & GitHub/,
    });

    expect(links).toHaveLength(expected.length);
    expected.forEach((href) => {
      expect(links.find((link) => link.getAttribute('href') === href)).toBeDefined();
    });
  });

  it('links the Recursos and Legal columns to the real pages', () => {
    mockedUseCourses.mockReturnValue({ allCourses: [] } as never);

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
    mockedUseCourses.mockReturnValue({ allCourses: [] } as never);

    render(<Footer />);

    expect(
      screen.queryByRole('link', { name: /twitter/i })
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText(/twitter/i)).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it('shows the copyright year and the made-with microcopy in the bottom bar', () => {
    mockedUseCourses.mockReturnValue({ allCourses: [] } as never);

    render(<Footer />);

    expect(
      screen.getByText(new RegExp(`© ${new Date().getFullYear()}`))
    ).toBeInTheDocument();
    expect(screen.getByText(/Hecho con ☕/)).toBeInTheDocument();
  });
});

describe('Footer newsletter (demo wiring)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseCourses.mockReturnValue({ allCourses: [] } as never);
  });

  it('fires the success toast for a valid email and clears the input', () => {
    render(<Footer />);

    const input = screen.getByLabelText('Email');
    fireEvent.change(input, { target: { value: 'ana@example.com' } });
    fireEvent.submit(input.closest('form') as HTMLFormElement);

    expect(toastMocks.showToast).toHaveBeenCalledWith(
      '¡Listo! Te avisamos cuando haya novedades.',
      'success'
    );
    expect(input).toHaveValue('');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('rejects an invalid email with an inline error and no toast', () => {
    render(<Footer />);

    const input = screen.getByLabelText('Email');
    fireEvent.change(input, { target: { value: 'no-es-un-email' } });
    fireEvent.submit(input.closest('form') as HTMLFormElement);

    expect(toastMocks.showToast).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Ingresá un email válido.');
    // Error is wired to the input via aria-describedby.
    expect(input).toHaveAttribute('aria-describedby', 'newsletter-error');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('clears the error once the user edits the input again', () => {
    render(<Footer />);

    const input = screen.getByLabelText('Email');
    fireEvent.change(input, { target: { value: 'nope' } });
    fireEvent.submit(input.closest('form') as HTMLFormElement);
    expect(screen.getByRole('alert')).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'a' } });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

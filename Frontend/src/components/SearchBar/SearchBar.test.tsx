import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SearchBar } from './SearchBar';
import { Course } from '@/types';

vi.mock('@/contexts/CourseContext', () => ({
  useCourses: vi.fn(),
}));

const routerPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: routerPush }),
}));

import { useCourses } from '@/contexts/CourseContext';
const mockedUseCourses = vi.mocked(useCourses);

const course = (overrides: Partial<Course> & { id: number; name: string; slug: string }): Course => ({
  description: `Descripción del curso ${overrides.name}`,
  thumbnail: 'https://example.com/thumb.jpg',
  ...overrides,
});

const allCourses: Course[] = [
  course({ id: 1, name: 'React desde cero', slug: 'react-desde-cero', average_rating: 4.7, total_ratings: 12 }),
  course({ id: 2, name: 'React avanzado', slug: 'react-avanzado', classes: [{ id: 9, name: 'c', description: '', slug: 'c', duration: 90 }] }),
  course({ id: 3, name: 'Python básico', slug: 'python-basico' }),
];

const setSearchQuery = vi.fn();

function typeQuery(value: string) {
  const input = screen.getByRole('combobox', { name: 'Buscar cursos' });
  fireEvent.change(input, { target: { value } });
}

// Advance past the 200ms suggestion debounce inside act() so state
// updates flush.
function flushSuggestions() {
  act(() => {
    vi.advanceTimersByTime(200);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  mockedUseCourses.mockReturnValue({ allCourses, setSearchQuery } as never);
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe('SearchBar quick-match dropdown', () => {
  it('shows matched courses after the debounce when the query is long enough', () => {
    render(<SearchBar />);
    typeQuery('react');
    flushSuggestions();

    const listbox = screen.getByRole('listbox', { name: 'Sugerencias de cursos' });
    expect(listbox).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /React desde cero/ })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /React avanzado/ })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /Python básico/ })).not.toBeInTheDocument();
  });

  it('caps suggestions at five rows', () => {
    const many = Array.from({ length: 8 }, (_, i) =>
      course({ id: i + 10, name: `React curso ${i + 1}`, slug: `react-${i + 1}` })
    );
    mockedUseCourses.mockReturnValue({ allCourses: many, setSearchQuery } as never);

    render(<SearchBar />);
    typeQuery('react');
    flushSuggestions();

    expect(screen.getAllByRole('option')).toHaveLength(5);
  });

  it('stays hidden while the query is shorter than 2 characters', () => {
    render(<SearchBar />);
    typeQuery('r');
    flushSuggestions();

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('shows an empty-results row for queries without matches', () => {
    render(<SearchBar />);
    typeQuery('zzzz');
    flushSuggestions();

    expect(screen.getByText('Sin resultados para «zzzz»')).toBeInTheDocument();
  });

  it('navigates to the highlighted course with ArrowDown + Enter', () => {
    render(<SearchBar />);
    typeQuery('react');
    flushSuggestions();

    const input = screen.getByRole('combobox', { name: 'Buscar cursos' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    const firstOption = screen.getAllByRole('option')[0];
    expect(firstOption).toHaveAttribute('aria-selected', 'true');
    expect(input).toHaveAttribute('aria-activedescendant', firstOption.id);

    fireEvent.keyDown(input, { key: 'Enter' });

    expect(routerPush).toHaveBeenCalledWith('/course/react-desde-cero');
    // Navegación no debe enviar la búsqueda al catálogo.
    expect(setSearchQuery).not.toHaveBeenCalledWith('react');
  });

  it('cycles the highlight backwards with ArrowUp wrapping to the last row', () => {
    render(<SearchBar />);
    typeQuery('react');
    flushSuggestions();

    const input = screen.getByRole('combobox', { name: 'Buscar cursos' });
    fireEvent.keyDown(input, { key: 'ArrowUp' });

    const options = screen.getAllByRole('option');
    expect(options[options.length - 1]).toHaveAttribute('aria-selected', 'true');
  });

  it('Escape closes the dropdown and keeps/refocuses the input', () => {
    render(<SearchBar />);
    typeQuery('react');
    flushSuggestions();
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    const input = screen.getByRole('combobox', { name: 'Buscar cursos' });
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('clicking a suggestion navigates to that course', () => {
    render(<SearchBar />);
    typeQuery('react');
    flushSuggestions();

    fireEvent.click(screen.getByRole('option', { name: /React avanzado/ }));

    expect(routerPush).toHaveBeenCalledWith('/course/react-avanzado');
  });

  it('keeps the original submit behavior: applies the query and closes the dropdown', () => {
    render(<SearchBar />);
    typeQuery('react');
    flushSuggestions();

    fireEvent.submit(screen.getByRole('search'));

    expect(setSearchQuery).toHaveBeenCalledWith('react');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('announces expanded state through aria-expanded on the combobox', () => {
    render(<SearchBar />);
    const input = screen.getByRole('combobox', { name: 'Buscar cursos' });
    expect(input).toHaveAttribute('aria-expanded', 'false');

    typeQuery('react');
    flushSuggestions();

    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(input).toHaveAttribute('aria-controls', 'searchbar-suggestions');
  });
});

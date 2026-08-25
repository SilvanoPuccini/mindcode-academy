import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ActiveFilters } from './ActiveFilters';
import { Filters as FiltersState } from '@/contexts/CourseContext';

vi.mock('@/contexts/CourseContext', () => ({
  useCourses: vi.fn(),
}));

import { useCourses } from '@/contexts/CourseContext';

// CourseContext exports the interface `Filters`; at runtime only the
// hook exists, so cast the mock's return through `never` like the
// other suites do. This local type keeps fixtures honest.
const mockedUseCourses = vi.mocked(useCourses);

const baseFilters: FiltersState = { category: 1, durations: [], minRating: 0 };

function setupContext(overrides: {
  searchQuery?: string;
  filters?: Partial<FiltersState>;
}) {
  const setSearchQuery = vi.fn();
  const setFilters = vi.fn();
  mockedUseCourses.mockReturnValue({
    searchQuery: overrides.searchQuery ?? '',
    setSearchQuery,
    filters: { ...baseFilters, ...overrides.filters },
    setFilters,
  } as never);
  return { setSearchQuery, setFilters };
}

beforeEach(() => {
  mockedUseCourses.mockReset();
});

describe('ActiveFilters', () => {
  it('renders nothing when no filter or search is active', () => {
    setupContext({});

    const { container } = render(<ActiveFilters />);

    expect(container).toBeEmptyDOMElement();
  });

  it('shows a chip for the active search query', () => {
    setupContext({ searchQuery: '  react  ' });

    render(<ActiveFilters />);

    expect(screen.getByText('Búsqueda: react')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Quitar búsqueda react' })
    ).toBeInTheDocument();
  });

  it('shows one chip per selected duration bucket and one for minRating', () => {
    setupContext({
      filters: { category: 3, durations: ['2-5 horas', '5-10 horas'], minRating: 4.5 },
    });

    render(<ActiveFilters />);

    expect(screen.getByText('2-5 horas')).toBeInTheDocument();
    expect(screen.getByText('5-10 horas')).toBeInTheDocument();
    expect(screen.getByText('★ ≥ 4.5')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Quitar rating mínimo' })).toBeInTheDocument();
  });

  it('removes a duration bucket by merging onto the current filters', () => {
    const { setFilters } = setupContext({
      filters: { durations: ['2-5 horas', '> 10 horas'] },
    });

    render(<ActiveFilters />);
    fireEvent.click(screen.getByRole('button', { name: 'Quitar duración 2-5 horas' }));

    expect(setFilters).toHaveBeenCalledWith({
      category: 1,
      durations: ['> 10 horas'],
      minRating: 0,
    });
  });

  it('removing the rating chip resets only minRating', () => {
    const { setFilters } = setupContext({
      filters: { category: 4, durations: [], minRating: 3 },
    });

    render(<ActiveFilters />);
    fireEvent.click(screen.getByRole('button', { name: 'Quitar rating mínimo' }));

    expect(setFilters).toHaveBeenCalledWith({ category: 4, durations: [], minRating: 0 });
  });

  it('removing the search chip clears the query in context', () => {
    const { setSearchQuery } = setupContext({ searchQuery: 'kotlin' });

    render(<ActiveFilters />);
    fireEvent.click(screen.getByRole('button', { name: 'Quitar búsqueda kotlin' }));

    expect(setSearchQuery).toHaveBeenCalledWith('');
  });

  it('"Limpiar todo" resets both the query and every filter facet', () => {
    const { setSearchQuery, setFilters } = setupContext({
      searchQuery: 'react',
      filters: { category: 2, durations: ['2-5 horas'], minRating: 4 },
    });

    render(<ActiveFilters />);
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar todo' }));

    expect(setSearchQuery).toHaveBeenCalledWith('');
    expect(setFilters).toHaveBeenCalledWith({ category: 1, durations: [], minRating: 0 });
  });
});

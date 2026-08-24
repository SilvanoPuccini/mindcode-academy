import { describe, it, expect } from 'vitest';
import {
  normalizeText,
  tokenizeQuery,
  matchesQuery,
  courseDurationMinutes,
  matchesDurationBucket,
  matchesDurationFilters,
} from './course-search';

describe('normalizeText', () => {
  it('lowercases the input', () => {
    expect(normalizeText('JavaScript')).toBe('javascript');
  });

  it('strips diacritics', () => {
    expect(normalizeText('Programación')).toBe('programacion');
    expect(normalizeText('Inteligencia Artificial Móvil')).toBe(
      'inteligencia artificial movil'
    );
  });
});

describe('tokenizeQuery', () => {
  it('splits on whitespace and drops empty tokens', () => {
    expect(tokenizeQuery('  react   hooks ')).toEqual(['react', 'hooks']);
  });

  it('normalizes each token', () => {
    expect(tokenizeQuery('Machine Learning')).toEqual(['machine', 'learning']);
    expect(tokenizeQuery('PROGRAMACIÓN')).toEqual(['programacion']);
  });

  it('returns an empty array for whitespace-only queries', () => {
    expect(tokenizeQuery('   ')).toEqual([]);
  });
});

describe('matchesQuery', () => {
  const course = {
    name: 'Curso de Javascript Moderno',
    description: 'Aprende programación web desde cero',
  };

  it('matches ignoring accents in the query', () => {
    // Query without accent still hits accented description text.
    expect(matchesQuery(course, 'programacion')).toBe(true);
  });

  it('matches ignoring case differences', () => {
    expect(matchesQuery(course, 'JAVASCRIPT')).toBe(true);
  });

  it('matches when the query has accents but the course does not', () => {
    expect(matchesQuery(course, 'código')).toBe(false);
    expect(matchesQuery({ ...course, name: 'Codigo limpio' }, 'código')).toBe(true);
  });

  it('requires ALL tokens to appear (AND semantics)', () => {
    expect(matchesQuery(course, 'javascript programacion')).toBe(true);
    expect(matchesQuery(course, 'javascript python')).toBe(false);
  });

  it('matches tokens spread across name and description', () => {
    // One token in the name, the other in the description.
    expect(matchesQuery(course, 'javascript cero')).toBe(true);
  });

  it('looks into extraText as an additional haystack', () => {
    // "front" only appears via the inferred category label.
    expect(matchesQuery(course, 'react', ['React'])).toBe(true);
    expect(matchesQuery(course, 'react')).toBe(false);
  });

  it('returns true for empty or whitespace-only queries', () => {
    expect(matchesQuery(course, '')).toBe(true);
    expect(matchesQuery(course, '   ')).toBe(true);
  });
});

describe('courseDurationMinutes', () => {
  it('sums class durations (already in minutes)', () => {
    expect(
      courseDurationMinutes({
        classes: [{ duration: 90 }, { duration: 45 }, { duration: 30 }],
      })
    ).toBe(165);
  });

  it('treats missing durations as zero', () => {
    expect(
      courseDurationMinutes({ classes: [{}, { duration: undefined }, { duration: 20 }] })
    ).toBe(20);
  });

  it('returns zero when classes are absent', () => {
    expect(courseDurationMinutes({})).toBe(0);
    expect(courseDurationMinutes({ classes: [] })).toBe(0);
  });
});

describe('matchesDurationBucket', () => {
  it('buckets below 120 minutes into "< 2 horas"', () => {
    expect(matchesDurationBucket(0, '< 2 horas')).toBe(true);
    expect(matchesDurationBucket(119, '< 2 horas')).toBe(true);
    expect(matchesDurationBucket(120, '< 2 horas')).toBe(false);
  });

  it('buckets [120, 300] into "2-5 horas" with inclusive bounds', () => {
    expect(matchesDurationBucket(120, '2-5 horas')).toBe(true);
    expect(matchesDurationBucket(300, '2-5 horas')).toBe(true);
    expect(matchesDurationBucket(301, '2-5 horas')).toBe(false);
  });

  it('buckets (300, 600] into "5-10 horas" with inclusive upper bound', () => {
    expect(matchesDurationBucket(300, '5-10 horas')).toBe(false);
    expect(matchesDurationBucket(600, '5-10 horas')).toBe(true);
    expect(matchesDurationBucket(601, '5-10 horas')).toBe(false);
  });

  it('buckets above 600 minutes into "> 10 horas"', () => {
    expect(matchesDurationBucket(601, '> 10 horas')).toBe(true);
    expect(matchesDurationBucket(600, '> 10 horas')).toBe(false);
  });

  it('rejects unknown bucket labels', () => {
    expect(matchesDurationBucket(180, 'nivel avanzado')).toBe(false);
  });
});

describe('matchesDurationFilters', () => {
  it('returns true when no buckets are selected', () => {
    expect(matchesDurationFilters(1000, [])).toBe(true);
  });

  it('ORs the selected buckets together', () => {
    expect(matchesDurationFilters(500, ['< 2 horas', '5-10 horas'])).toBe(true);
    expect(matchesDurationFilters(200, ['< 2 horas', '5-10 horas'])).toBe(false);
  });
});

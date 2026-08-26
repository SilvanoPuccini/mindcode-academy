// Pure text-matching and duration-bucketing helpers shared by the
// catalog search (CourseContext) and the Filters sidebar. Keeping them
// here makes the filtering rules unit-testable without React.

// Single source of truth for accent-insensitive comparison: lowercase +
// strip diacritics so "Programación" and "programacion" compare equal.
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// Split a raw query into normalized, non-empty tokens.
export function tokenizeQuery(query: string): string[] {
  return normalizeText(query)
    .split(/\s+/)
    .filter(Boolean);
}

// AND semantics: EVERY token must appear (accent-insensitive substring)
// somewhere across name + description + any extra text (e.g. the course's
// inferred category label). An empty or whitespace-only query matches all.
export function matchesQuery(
  course: { name: string; description: string },
  query: string,
  extraText?: string[]
): boolean {
  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) return true;

  const haystacks = [course.name, course.description, ...(extraText ?? [])].map(normalizeText);
  return tokens.every((token) => haystacks.some((haystack) => haystack.includes(token)));
}

// Canonical duration buckets shown in the Filters sidebar. The labels are
// also the values persisted in CourseContext.filters.durations.
export const DURATION_FILTER_OPTIONS = ['< 2 horas', '2-5 horas', '5-10 horas', '> 10 horas'];

// Total course length in minutes. Prefers the pre-aggregated
// total_duration_minutes (present on GET /courses, computed server-side —
// no per-course detail fetch needed) and falls back to summing classes[]
// duration for callers that only have the hydrated detail shape.
export function courseDurationMinutes(course: {
  total_duration_minutes?: number;
  classes?: { duration?: number }[];
}): number {
  if (typeof course.total_duration_minutes === 'number') {
    return course.total_duration_minutes;
  }
  return (course.classes ?? []).reduce((total, cls) => total + (cls.duration ?? 0), 0);
}

// Bucket boundaries in minutes: <120 | 120-300 | 300-600 | >600.
// Upper bounds are inclusive so a 300-minute course counts as "2-5 horas".
export function matchesDurationBucket(totalMinutes: number, label: string): boolean {
  switch (label) {
    case '< 2 horas':
      return totalMinutes < 120;
    case '2-5 horas':
      return totalMinutes >= 120 && totalMinutes <= 300;
    case '5-10 horas':
      return totalMinutes > 300 && totalMinutes <= 600;
    case '> 10 horas':
      return totalMinutes > 600;
    default:
      return false;
  }
}

// Selected duration buckets are OR-ed among themselves; an empty selection
// means "no duration constraint".
export function matchesDurationFilters(totalMinutes: number, selectedLabels: string[]): boolean {
  if (selectedLabels.length === 0) return true;
  return selectedLabels.some((label) => matchesDurationBucket(totalMinutes, label));
}

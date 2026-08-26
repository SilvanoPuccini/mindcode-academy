// Progress mapping helpers for the course temario (Phase 4).
//
// The backend endpoint GET /progress/course/{course_id} does NOT expose
// per-lesson completion flags: it returns a COUNT of completed lessons
// (see Backend/app/schemas/progress.py -> ProgressResponse.completed_lessons).
// The UI contract agreed for Phase 4 maps that count onto the course's
// classes taken IN ORDER OF POSITION: the first N classes are considered
// complete. Keeping the mapping here makes it unit-testable without React.

import { Class } from '@/types';

/** Shape returned by GET /progress/course/{course_id} (cookie auth). */
export interface CourseProgressResponse {
  id: number;
  user_id: number;
  course_id: number;
  completed_lessons: number;
  total_lessons: number;
  progress_percentage: number;
  is_completed: boolean;
}

/**
 * Classes sorted for display and navigation: explicit `position` wins,
 * array order breaks ties (stable sort) and covers payloads without
 * positions.
 */
export function sortClassesByPosition(classes: Class[]): Class[] {
  return classes
    .map((cls, index) => ({ cls, index, position: cls.position ?? index }))
    .sort((a, b) => a.position - b.position)
    .map(({ cls }) => cls);
}

// Classes ordered for progress purposes: explicit `position` wins,
// array order breaks ties (and covers payloads without positions).
function orderedClasses(classes: Class[]): { id: number; index: number }[] {
  return classes
    .map((cls, index) => ({ id: cls.id, index, position: cls.position ?? index }))
    .sort((a, b) => a.position - b.position)
    .map(({ id, index }) => ({ id, index }));
}

/**
 * Ids of the classes considered complete: the first `completedCount`
 * classes sorted by position. A non-positive count yields an empty set.
 * A count larger than the catalog saturates to every class.
 */
export function buildCompletedClassIds(classes: Class[], completedCount: number): Set<number> {
  if (completedCount <= 0 || classes.length === 0) return new Set<number>();
  const ordered = orderedClasses(classes);
  return new Set(ordered.slice(0, Math.min(completedCount, ordered.length)).map((c) => c.id));
}

/**
 * Index (in render order) of the first incomplete class by position,
 * or -1 when every class is complete (or nothing to resume).
 */
export function findResumeIndex(classes: Class[], completedIds: Set<number>): number {
  for (const { index, id } of orderedClasses(classes)) {
    if (!completedIds.has(id)) return index;
  }
  return -1;
}

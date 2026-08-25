import { describe, it, expect } from 'vitest';
import { Class } from '@/types';
import {
  buildCompletedClassIds,
  findResumeIndex,
} from './course-progress';

// Positions arrive unordered on purpose: progress order must follow
// `position`, not payload order.
const classes: Class[] = [
  { id: 11, name: 'Intro', description: 'a', slug: 'intro', position: 2 },
  { id: 12, name: 'Setup', description: 'b', slug: 'setup', position: 1 },
  { id: 13, name: 'Deep dive', description: 'c', slug: 'deep-dive', position: 3 },
];

describe('buildCompletedClassIds', () => {
  it('maps the completed count onto the first N classes by position', () => {
    expect(buildCompletedClassIds(classes, 2)).toEqual(new Set([12, 11]));
  });

  it('returns an empty set for zero or negative counts', () => {
    expect(buildCompletedClassIds(classes, 0)).toEqual(new Set());
    expect(buildCompletedClassIds(classes, -1)).toEqual(new Set());
  });

  it('saturates when the count exceeds the class list', () => {
    expect(buildCompletedClassIds(classes, 99)).toEqual(new Set([11, 12, 13]));
  });

  it('handles courses without any classes', () => {
    expect(buildCompletedClassIds([], 3)).toEqual(new Set());
  });

  it('falls back to array order when positions are missing', () => {
    const unpositioned: Class[] = [
      { id: 21, name: 'A', description: '', slug: 'a' },
      { id: 22, name: 'B', description: '', slug: 'b' },
    ];
    expect(buildCompletedClassIds(unpositioned, 1)).toEqual(new Set([21]));
  });
});

describe('findResumeIndex', () => {
  it('points at the first incomplete class by position (render index)', () => {
    // Classes 12 and 11 are done; the next one by position is id 13,
    // which sits at render index 2.
    expect(findResumeIndex(classes, new Set([12, 11]))).toBe(2);
  });

  it('returns the render index of the position-first class when nothing is complete', () => {
    // Position order is [12, 11, 13]; id 12 sits at render index 1.
    expect(findResumeIndex(classes, new Set())).toBe(1);
  });

  it('returns -1 once every class is complete', () => {
    expect(findResumeIndex(classes, new Set([11, 12, 13]))).toBe(-1);
  });
});

import { describe, it, expect } from 'vitest';
import { getSafeRedirectPath } from './safe-redirect';

describe('getSafeRedirectPath', () => {
  it('returns "/" when next is missing', () => {
    expect(getSafeRedirectPath('')).toBe('/');
    expect(getSafeRedirectPath('?other=param')).toBe('/');
  });

  it('returns same-origin paths as-is', () => {
    expect(getSafeRedirectPath('?next=/course/react')).toBe('/course/react');
    expect(getSafeRedirectPath('?next=/')).toBe('/');
  });

  it('preserves query strings and hashes inside the target', () => {
    expect(getSafeRedirectPath('?next=%2Fcourses%3Fcategoria%3Dia-ml')).toBe(
      '/courses?categoria=ia-ml'
    );
  });

  it('rejects protocol-relative URLs (open redirect)', () => {
    expect(getSafeRedirectPath('?next=//evil.com')).toBe('/');
  });

  it('rejects absolute URLs', () => {
    expect(getSafeRedirectPath('?next=https://evil.com')).toBe('/');
    expect(getSafeRedirectPath('?next=http://evil.com')).toBe('/');
  });

  it('normalizes backslashes before validating to block "\\\\evil.com" tricks', () => {
    expect(getSafeRedirectPath('?next=%2F%5Cevil.com')).toBe('/');
  });
});

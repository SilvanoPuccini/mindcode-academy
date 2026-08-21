/**
 * Favorites API Service
 * Wraps the authenticated favorites endpoints
 * (Backend/app/routers/favorites.py). All authenticated
 * via `apiFetch` (JWT Bearer, client-only).
 *
 * - POST /favorites/toggle/{course_id} -> { course_id, is_favorited, message }
 * - GET  /favorites/course-ids         -> number[]
 * - GET  /favorites/                   -> { id, user_id, course_id, created_at }[]
 */

import { apiFetch } from '@/lib/api';

export interface FavoriteToggleResponse {
  course_id: number;
  is_favorited: boolean;
  message: string;
}

export interface FavoriteRecord {
  id: number;
  user_id: number;
  course_id: number;
  created_at: string | null;
}

export function getFavoriteCourseIds(): Promise<number[]> {
  return apiFetch<number[]>('/favorites/course-ids');
}

export function getFavorites(): Promise<FavoriteRecord[]> {
  return apiFetch<FavoriteRecord[]>('/favorites/');
}

export function toggleFavorite(courseId: number): Promise<FavoriteToggleResponse> {
  return apiFetch<FavoriteToggleResponse>(`/favorites/toggle/${courseId}`, {
    method: 'POST',
  });
}

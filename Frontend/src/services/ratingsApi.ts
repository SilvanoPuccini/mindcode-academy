/**
 * Ratings API Service
 * HTTP calls for the course rating system.
 *
 * - GET endpoints are public and keep the plain-fetch + timeout helpers.
 * - Mutations (POST/PUT/DELETE) target the authenticated user resolved
 *   server-side from the httpOnly session cookie: they go through apiFetch
 *   (credentials: "include"), and anonymous users are redirected to
 *   /login?next=... before any request is made.
 */

import type { CourseRating, RatingRequest, RatingStats } from '@/types/rating';
import { ApiError } from '@/types/rating';
import { ApiClientError, apiFetch } from '@/lib/api';
import { getUser } from '@/services/authApi';

// Base URL del backend API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Guard for rating mutations: only logged-in users may rate. Without a
 * cached profile we bounce to /login carrying the current location as
 * ?next= so the login page can return the user to the course they were
 * rating (src/lib/safe-redirect.ts resolves it after auth). The thrown
 * error lets callers abort their flow while the navigation happens.
 */
function ensureAuthenticated(): void {
  if (typeof window === 'undefined') return;
  if (getUser()) return;

  const currentPath = `${window.location.pathname}${window.location.search}`;
  window.location.href = `/login?next=${encodeURIComponent(currentPath)}`;
  throw new ApiClientError('Iniciá sesión para calificar este curso.', 401);
}

// Opciones extendidas de fetch con timeout
interface FetchOptions extends RequestInit {
  timeout?: number;
}

/**
 * Helper: Fetch con timeout para prevenir requests colgados
 */
async function fetchWithTimeout(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { timeout = 10000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408, 'TIMEOUT');
      }
      throw new ApiError(
        `Network error: ${error.message}`,
        0,
        'NETWORK_ERROR'
      );
    }

    throw new ApiError('Unknown error occurred', 0, 'UNKNOWN');
  }
}

/**
 * Helper: Procesa la respuesta de la API y maneja errores
 */
async function handleApiResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');

  // Verificar que sea JSON
  if (!contentType || !contentType.includes('application/json')) {
    throw new ApiError(
      'Invalid response format',
      response.status,
      'INVALID_FORMAT'
    );
  }

  // Parsear el body
  const data = await response.json();

  // Si la respuesta no es OK, lanzar error con detalles
  if (!response.ok) {
    const message = data.detail || data.message || `HTTP ${response.status}`;
    throw new ApiError(message, response.status, data.code, data);
  }

  return data as T;
}

/**
 * GET /courses/{course_id}/ratings/stats
 * Obtiene las estadísticas de ratings de un curso
 */
async function getRatingStats(courseId: number): Promise<RatingStats> {
  const url = `${API_BASE_URL}/courses/${courseId}/ratings/stats`;

  try {
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return await handleApiResponse<RatingStats>(response);
  } catch (error) {
    // Si el curso no tiene ratings (404), retornar stats vacías
    if (error instanceof ApiError && error.status === 404) {
      return {
        average_rating: 0,
        total_ratings: 0,
      };
    }
    throw error;
  }
}

/**
 * GET /courses/{course_id}/ratings
 * Obtiene todos los ratings de un curso
 */
async function getCourseRatings(courseId: number): Promise<CourseRating[]> {
  const url = `${API_BASE_URL}/courses/${courseId}/ratings`;

  try {
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return await handleApiResponse<CourseRating[]>(response);
  } catch (error) {
    // Si no hay ratings (404), retornar array vacío
    if (error instanceof ApiError && error.status === 404) {
      return [];
    }
    throw error;
  }
}

/**
 * GET /courses/{course_id}/ratings/{user_id}
 * Obtiene el rating de un usuario específico para un curso
 */
async function getUserRating(
  courseId: number,
  userId: number
): Promise<CourseRating | null> {
  const url = `${API_BASE_URL}/courses/${courseId}/ratings/${userId}`;

  try {
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return await handleApiResponse<CourseRating>(response);
  } catch (error) {
    // Si el usuario no ha calificado (404), retornar null
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * GET /courses/{course_id}/ratings/me
 * Returns the authenticated user's own rating value, or null when the API
 * answers 404 {"detail": "Sin calificación"} (no active rating yet).
 * Requires a session like the mutations: goes through apiFetch so the
 * httpOnly cookie rides along; anonymous users are redirected to
 * /login?next=... by ensureAuthenticated() before any request is made.
 */
async function getMyRating(courseId: number): Promise<number | null> {
  ensureAuthenticated();

  try {
    const data = await apiFetch<{ rating: number }>(
      `/courses/${courseId}/ratings/me`
    );
    return data.rating;
  } catch (error) {
    // No active rating yet: documented 404, mapped to null (not an error)
    if (error instanceof ApiClientError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * POST /courses/{course_id}/ratings
 * Creates (or upserts) the authenticated user's rating for a course.
 * Requires a session: goes through apiFetch so the httpOnly cookie rides
 * along, and redirects anonymous users to /login?next=<current page> first.
 * Errors surface as ApiClientError with the backend `detail` message.
 */
async function createRating(
  courseId: number,
  request: RatingRequest
): Promise<CourseRating> {
  ensureAuthenticated();

  return apiFetch<CourseRating>(`/courses/${courseId}/ratings`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * PUT /courses/{course_id}/ratings
 * Updates the authenticated user's existing rating (404 from the API if none).
 */
async function updateRating(
  courseId: number,
  request: RatingRequest
): Promise<CourseRating> {
  ensureAuthenticated();

  return apiFetch<CourseRating>(`/courses/${courseId}/ratings`, {
    method: 'PUT',
    body: JSON.stringify(request),
  });
}

/**
 * DELETE /courses/{course_id}/ratings
 * Soft-deletes only the authenticated user's rating for the course.
 */
async function deleteRating(courseId: number): Promise<void> {
  ensureAuthenticated();

  await apiFetch<void>(`/courses/${courseId}/ratings`, {
    method: 'DELETE',
  });
}

// Export del servicio como objeto constante
export const ratingsApi = {
  getRatingStats,
  getCourseRatings,
  getUserRating,
  getMyRating,
  createRating,
  updateRating,
  deleteRating,
} as const;

// Export de ApiError para manejo en componentes
export { ApiError };

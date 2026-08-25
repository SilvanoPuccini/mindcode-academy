"use client";

import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Course } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { getFavoriteCourseIds, toggleFavorite as toggleFavoriteApi } from '@/services/favoritesApi';
import { inferCategory } from '@/lib/course-taxonomy';
import {
  matchesQuery,
  courseDurationMinutes,
  matchesDurationFilters,
} from '@/lib/course-search';

interface Filters {
  category: number;
  durations: string[];
  minRating: number;
}

interface CourseContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: Filters;
  setFilters: (filters: Filters) => void;
  allCourses: Course[];
  filteredCourses: Course[];
  setAllCourses: (courses: Course[]) => void;
  favorites: number[];
  favoritesLoading: boolean;
  toggleFavorite: (courseId: number) => Promise<void>;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export function CourseProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [filters, setFilters] = useState<Filters>({
    category: 1, // Todos
    durations: [],
    minRating: 0,
  });
  // Favorites now live on the backend (POST /favorites/toggle/{id},
  // GET /favorites/course-ids), keyed to the logged-in user's session
  // cookie. Logged-out visitors simply see an empty list; clicking the
  // heart button hits a 401 and apiFetch() redirects to /login.
  const [favorites, setFavorites] = useState<number[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    let cancelled = false;

    async function loadFavorites() {
      // Anonymous (or not yet validated) session: nothing to load. The
      // effect re-runs when isAuthenticated flips after boot hydration,
      // and clears the list on logout.
      if (!isAuthenticated) {
        setFavorites([]);
        setFavoritesLoading(false);
        return;
      }

      setFavoritesLoading(true);

      try {
        const courseIds = await getFavoriteCourseIds();
        if (!cancelled) setFavorites(courseIds);
      } catch (error) {
        console.error('Error loading favorites:', error);
      } finally {
        if (!cancelled) setFavoritesLoading(false);
      }
    }

    loadFavorites();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const toggleFavorite = async (courseId: number) => {
    const wasFavorite = favorites.includes(courseId);

    // Optimistic update
    setFavorites(prev =>
      wasFavorite ? prev.filter(id => id !== courseId) : [...prev, courseId]
    );

    try {
      await toggleFavoriteApi(courseId);
    } catch (error) {
      // Revert on failure (network error, 404, etc.)
      // Note: a 401 is already handled by apiFetch (session
      // cleared + redirect to /login) before reaching here.
      setFavorites(prev =>
        wasFavorite ? [...prev, courseId] : prev.filter(id => id !== courseId)
      );
      throw error;
    }
  };

  const filteredCourses = useMemo(() => {
    return allCourses.filter(course => {
      // Search filter: accent-insensitive, all tokens must appear across
      // name + description + the inferred category label (so "react" or
      // category-style words also match categorically).
      if (!matchesQuery(course, searchQuery, [inferCategory(course).label])) {
        return false;
      }

      // Rating filter
      if (filters.minRating > 0) {
        if (!course.average_rating || course.average_rating < filters.minRating) {
          return false;
        }
      }

      // Duration filter: selected buckets are OR-ed among themselves.
      // Courses without hydrated classes have unknown duration and are
      // excluded while a duration bucket is selected.
      if (
        filters.durations.length > 0 &&
        !matchesDurationFilters(courseDurationMinutes(course), filters.durations)
      ) {
        return false;
      }

      // Category filter (1 = Todos, skip filter)
      // Applied separately in the home page via inferCategory()

      return true;
    });
  }, [allCourses, searchQuery, filters]);

  return (
    <CourseContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        filters,
        setFilters,
        allCourses,
        filteredCourses,
        setAllCourses,
        favorites,
        favoritesLoading,
        toggleFavorite,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
}

export function useCourses() {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourses must be used within CourseProvider');
  }
  return context;
}

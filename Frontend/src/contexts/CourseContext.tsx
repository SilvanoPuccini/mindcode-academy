"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Course } from '@/types';
import { getToken } from '@/services/authApi';
import { getFavoriteCourseIds, toggleFavorite as toggleFavoriteApi } from '@/services/favoritesApi';

interface Filters {
  category: number;
  levels: string[];
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
    levels: [],
    durations: [],
    minRating: 0,
  });
  // Favorites now live on the backend (POST /favorites/toggle/{id},
  // GET /favorites/course-ids), keyed to the logged-in user's JWT.
  // Logged-out visitors simply see an empty list; clicking the heart
  // button hits a 401 and apiFetch() redirects to /login.
  const [favorites, setFavorites] = useState<number[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadFavorites() {
      if (!getToken()) {
        setFavoritesLoading(false);
        return;
      }

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
  }, []);

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

  const filteredCourses = allCourses.filter(course => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = course.name.toLowerCase().includes(query);
      const matchesDescription = course.description.toLowerCase().includes(query);
      if (!matchesName && !matchesDescription) return false;
    }

    // Rating filter
    if (filters.minRating > 0) {
      if (!course.average_rating || course.average_rating < filters.minRating) {
        return false;
      }
    }

    // Category filter (1 = Todos, skip filter)
    // For now we don't have category in Course type, so we skip this

    return true;
  });

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

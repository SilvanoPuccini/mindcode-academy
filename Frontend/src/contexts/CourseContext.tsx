"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import { Course } from '@/types';

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
  filteredCourses: Course[];
  setAllCourses: (courses: Course[]) => void;
  favorites: number[];
  toggleFavorite: (courseId: number) => void;
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
  const [favorites, setFavorites] = useState<number[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mindIA_favorites');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const toggleFavorite = (courseId: number) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId];

      if (typeof window !== 'undefined') {
        localStorage.setItem('mindIA_favorites', JSON.stringify(newFavorites));
      }

      return newFavorites;
    });
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
        filteredCourses,
        setAllCourses,
        favorites,
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

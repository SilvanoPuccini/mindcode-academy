"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { useCourses } from '@/contexts/CourseContext';
import { useRipple } from '@/hooks/useRipple';
import { matchesQuery, courseDurationMinutes } from '@/lib/course-search';
import { inferCategory } from '@/lib/course-taxonomy';
import { formatDuration } from '@/lib/format-duration';
import { Course } from '@/types';
import { SEARCH_INPUT_ID } from '@/hooks/useSearchFocus';
import styles from './SearchBar.module.scss';

// Quick-match dropdown tuning.
const SUGGESTION_DEBOUNCE_MS = 200;
const MIN_SUGGESTION_LENGTH = 2;
const MAX_SUGGESTIONS = 5;
const LISTBOX_ID = 'searchbar-suggestions';

export function SearchBar() {
  const { allCourses, setSearchQuery } = useCourses();
  const [localQuery, setLocalQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const rippleProps = useRipple();
  const router = useRouter();

  // Dropdown state: matched courses, visibility and keyboard highlight.
  // -1 means "no row highlighted" (Enter then falls through to submit).
  const [suggestions, setSuggestions] = useState<Course[]>([]);
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLFormElement>(null);

  // position:fixed coordinates for the dropdown card. The hero wraps
  // this component with overflow:hidden, so an absolutely positioned
  // popup would be clipped; fixed escapes it but needs manual anchoring
  // to the form's rect (kept in sync on scroll/resize while open).
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  const trimmedQuery = localQuery.trim();

  const updateDropdownPos = useCallback(() => {
    const box = boxRef.current;
    if (!box) return;
    const rect = box.getBoundingClientRect();
    setDropdownPos({ top: rect.bottom + 8, left: rect.left, width: rect.width });
  }, []);

  // Debounce effect - actualiza el contexto después de 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery, setSearchQuery]);

  // Debounced local quick-match for the dropdown (faster than the
  // context push so results feel instant while typing).
  useEffect(() => {
    const timer = setTimeout(() => {
      if (trimmedQuery.length < MIN_SUGGESTION_LENGTH) {
        setSuggestions([]);
        setOpen(false);
        return;
      }
      const matches = allCourses
        .filter((course) =>
          matchesQuery(course, trimmedQuery, [inferCategory(course).label])
        )
        .slice(0, MAX_SUGGESTIONS);
      setSuggestions(matches);
      setHighlightIndex(-1);
      setOpen(true);
    }, SUGGESTION_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [trimmedQuery, allCourses]);

  // While open: keep the fixed card glued to the search box on any
  // scroll (capture catches inner scroll containers) or resize.
  useEffect(() => {
    if (!open) return;
    updateDropdownPos();
    window.addEventListener('scroll', updateDropdownPos, { capture: true, passive: true });
    window.addEventListener('resize', updateDropdownPos);
    return () => {
      window.removeEventListener('scroll', updateDropdownPos, { capture: true });
      window.removeEventListener('resize', updateDropdownPos);
    };
  }, [open, updateDropdownPos]);

  // Click-outside closes the dropdown.
  useEffect(() => {
    if (!open) return;
    const handleMouseDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
        setHighlightIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [open]);

  const navigateToCourse = (course: Course) => {
    setOpen(false);
    setHighlightIndex(-1);
    router.push(`/course/${course.slug}`);
  };

  const handleClear = () => {
    setLocalQuery('');
    setSearchQuery('');
    setSuggestions([]);
    setOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      if (open) {
        event.preventDefault();
        setOpen(false);
        setHighlightIndex(-1);
      }
      // Devolvé el foco al input pase lo que pase.
      inputRef.current?.focus();
      return;
    }

    if (!open || suggestions.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightIndex((index) => (index + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightIndex((index) =>
        index <= 0 ? suggestions.length - 1 : index - 1
      );
    } else if (event.key === 'Enter' && highlightIndex >= 0) {
      // Enter con una fila resaltada navega al curso en vez de enviar
      // la búsqueda al catálogo.
      event.preventDefault();
      navigateToCourse(suggestions[highlightIndex]);
    }
  };

  // Submit (button click or Enter key without a highlighted row) applies the
  // query immediately - no debounce wait - and
  // brings the catalog into view. Smooth only when
  // the user allows motion.
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchQuery(localQuery);
    setOpen(false);
    const catalog = document.getElementById('catalogo');
    if (!catalog) return;
    const prefersSmooth = window.matchMedia(
      '(prefers-reduced-motion: no-preference)'
    ).matches;
    catalog.scrollIntoView({
      behavior: prefersSmooth ? 'smooth' : 'auto',
      block: 'start',
    });
  };

  const showDropdown = open && trimmedQuery.length >= MIN_SUGGESTION_LENGTH;

  return (
    <div className={styles.searchSection} id="buscador" ref={rootRef}>
      <div className={styles.container}>
        <form
          ref={boxRef}
          role="search"
          className={`${styles.searchBox} ${focused ? styles.focused : ''}`}
          onSubmit={handleSubmit}
        >
          <Search size={24} className={styles.searchIcon} aria-hidden="true" />
          <input
            id={SEARCH_INPUT_ID}
            ref={inputRef}
            type="text"
            placeholder="Busca cursos de Machine Learning, Web Development, Data Science..."
            aria-label="Buscar cursos"
            role="combobox"
            aria-expanded={showDropdown}
            aria-controls={LISTBOX_ID}
            aria-autocomplete="list"
            aria-activedescendant={
              showDropdown && highlightIndex >= 0
                ? `${LISTBOX_ID}-option-${highlightIndex}`
                : undefined
            }
            className={styles.searchInput}
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={handleKeyDown}
          />
          {localQuery && (
            <button
              type="button"
              className={`${styles.clearBtn} ripple-container`}
              onClick={handleClear}
              aria-label="Limpiar búsqueda"
              {...rippleProps}
            >
              <X size={20} aria-hidden="true" />
            </button>
          )}
          <button
            type="submit"
            className={`${styles.searchBtn} ripple-container`}
            {...rippleProps}
          >
            Buscar
          </button>
        </form>
      </div>

      {showDropdown && (
        <div
          className={styles.suggestions}
          id={LISTBOX_ID}
          role="listbox"
          aria-label="Sugerencias de cursos"
          style={{
            top: `${dropdownPos.top}px`,
            left: `${dropdownPos.left}px`,
            width: `${dropdownPos.width}px`,
          }}
        >
          {suggestions.length === 0 ? (
            <p className={styles.suggestionEmpty} role="status">
              Sin resultados para «{trimmedQuery}»
            </p>
          ) : (
            suggestions.map((course, index) => (
              <button
                key={course.id}
                type="button"
                id={`${LISTBOX_ID}-option-${index}`}
                role="option"
                aria-selected={index === highlightIndex}
                className={`${styles.suggestionItem} ${
                  index === highlightIndex ? styles.highlighted : ''
                }`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => navigateToCourse(course)}
                onMouseEnter={() => setHighlightIndex(index)}
              >
                <Image
                  src={course.thumbnail}
                  alt=""
                  width={48}
                  height={48}
                  className={styles.thumb}
                />
                <span className={styles.suggestionText}>
                  <span className={styles.suggestionTitle}>{course.name}</span>
                  <span className={styles.suggestionMeta}>
                    {course.average_rating != null
                      ? `★ ${course.average_rating.toFixed(1)}`
                      : 'Sin rating'}
                    {courseDurationMinutes(course) > 0 &&
                      ` · ${formatDuration(courseDurationMinutes(course))}`}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

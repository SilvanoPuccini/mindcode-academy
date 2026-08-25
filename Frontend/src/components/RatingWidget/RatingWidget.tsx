"use client";

/**
 * RatingWidget Component
 * Interactive rating control for the course detail page.
 *
 * Authenticated users can set/update (POST upsert) or remove (DELETE) their
 * own rating; anonymous users see disabled stars plus a login CTA that
 * carries the current path as ?next= so they land back on this course.
 * Community stats are updated optimistically right after each mutation and
 * then reconciled against the public stats endpoint.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { StarIcon } from '@/components/StarRating/StarRating';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/contexts/ToastContext';
import { ratingsApi } from '@/services/ratingsApi';
import styles from './RatingWidget.module.scss';

interface RatingWidgetProps {
  courseId: number;
  /** Community stats snapshot from the server-rendered course payload. */
  initialAverage?: number;
  initialCount?: number;
}

interface CommunityStats {
  average: number;
  count: number;
}

/**
 * Optimistic stats after setting the user's rating to `newValue`.
 * `previousValue` is null when this creates a new rating, otherwise it is
 * the value being replaced (so it must be subtracted before averaging).
 */
function statsAfterSet(
  stats: CommunityStats,
  newValue: number,
  previousValue: number | null
): CommunityStats {
  if (previousValue === null) {
    const count = stats.count + 1;
    const average = count === 1 ? newValue : (stats.average * stats.count + newValue) / count;
    return { average, count };
  }

  if (stats.count <= 1) return { average: newValue, count: stats.count };
  return {
    average: (stats.average * stats.count - previousValue + newValue) / stats.count,
    count: stats.count,
  };
}

/** Optimistic stats after soft-deleting the user's rating. */
function statsAfterRemove(stats: CommunityStats, removedValue: number): CommunityStats {
  const count = Math.max(0, stats.count - 1);
  if (count === 0) return { average: 0, count: 0 };
  return {
    average: Math.max(0, (stats.average * stats.count - removedValue) / count),
    count,
  };
}

export const RatingWidget = ({ courseId, initialAverage, initialCount }: RatingWidgetProps) => {
  const { isAuthenticated, loading } = useAuth();
  const { showToast } = useToast();

  const [myRating, setMyRating] = useState<number | null>(null);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [pending, setPending] = useState(false);
  const [stats, setStats] = useState<CommunityStats>({
    average: initialAverage ?? 0,
    count: initialCount ?? 0,
  });
  // Server render cannot know the current path; start from the plain login
  // route and upgrade after hydration so SSR markup never mismatches.
  const [loginHref, setLoginHref] = useState('/login');

  // Load the user's own rating once auth boot resolves and they are logged in.
  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;
    ratingsApi
      .getMyRating(courseId)
      .then((rating) => {
        if (!cancelled) setMyRating(rating);
      })
      .catch(() => {
        // Background load failure: fall back to "not rated", no toast noise.
        if (!cancelled) setMyRating(null);
      });

    return () => {
      cancelled = true;
    };
  }, [courseId, isAuthenticated]);

  // Build the ?next= redirect target client-side only.
  useEffect(() => {
    const currentPath = `${window.location.pathname}${window.location.search}`;
    setLoginHref(`/login?next=${encodeURIComponent(currentPath)}`);
  }, []);

  // Authoritative numbers straight from the public stats endpoint.
  const refreshStats = async (): Promise<void> => {
    try {
      const fresh = await ratingsApi.getRatingStats(courseId);
      setStats({ average: fresh.average_rating, count: fresh.total_ratings });
    } catch {
      // Keep the optimistic values when the refetch fails; the next
      // successful mutation or page load reconciles them anyway.
    }
  };

  const handleRate = async (value: number): Promise<void> => {
    if (pending || !isAuthenticated || value === myRating) return;

    const hadPrevious = myRating !== null;
    const previous = myRating;
    setPending(true);

    try {
      // POST has upsert semantics: creates when none, updates otherwise.
      await ratingsApi.createRating(courseId, { rating: value });
      setMyRating(value);
      setStats((prev) => statsAfterSet(prev, value, previous));
      showToast(
        hadPrevious ? 'Actualizamos tu calificación.' : '¡Gracias! Registramos tu calificación.',
        'success'
      );
      await refreshStats();
    } catch {
      showToast('No se pudo guardar tu calificación.', 'error');
    } finally {
      setPending(false);
    }
  };

  const handleRemove = async (): Promise<void> => {
    if (pending || myRating === null) return;

    const removed = myRating;
    setPending(true);

    try {
      await ratingsApi.deleteRating(courseId);
      setMyRating(null);
      setStats((prev) => statsAfterRemove(prev, removed));
      showToast('Eliminamos tu calificación.', 'info');
      await refreshStats();
    } catch {
      showToast('No se pudo quitar tu calificación.', 'error');
    } finally {
      setPending(false);
    }
  };

  const interactive = isAuthenticated && !loading && !pending;
  // Hover preview wins over the persisted value while hovering.
  const displayed = hoveredStar > 0 ? hoveredStar : (myRating ?? 0);

  return (
    <div className={styles.ratingWidget}>
      <p className={styles.title}>Tu calificación</p>

      <div className={styles.starsRow} role="radiogroup" aria-label="Calificá este curso">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={myRating === star}
            aria-label={`${star} ${star === 1 ? 'estrella' : 'estrellas'}`}
            className={`${styles.starBtn} ${star <= displayed ? styles.starFilled : ''}`}
            disabled={!interactive}
            onClick={() => handleRate(star)}
            onMouseEnter={() => interactive && setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
          >
            <StarIcon fillState={star <= displayed ? 'full' : 'empty'} />
          </button>
        ))}
      </div>

      <p className={styles.valueLine} aria-live="polite">
        {myRating !== null ? (
          <strong>{myRating} de 5</strong>
        ) : (
          'Sin calificar todavía'
        )}
      </p>

      {stats.count > 0 && (
        <p className={styles.communityStats}>
          ⭐ {stats.average.toFixed(1)} · {stats.count}{' '}
          {stats.count === 1 ? 'calificación' : 'calificaciones'}
        </p>
      )}

      {isAuthenticated && !loading && myRating !== null && (
        <button
          type="button"
          className={styles.removeBtn}
          onClick={handleRemove}
          disabled={pending}
        >
          Quitar mi calificación
        </button>
      )}

      {!loading && !isAuthenticated && (
        <Link href={loginHref} className={styles.loginCta}>
          Iniciá sesión para calificar
        </Link>
      )}
    </div>
  );
};

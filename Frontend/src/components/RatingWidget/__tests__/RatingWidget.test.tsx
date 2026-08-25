/**
 * RatingWidget Component Tests
 * Unit tests with ratingsApi and useAuth mocked at module boundaries.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RatingWidget } from '../RatingWidget';

const mockUseAuth = vi.fn();
const mockShowToast = vi.fn();
const mockGetMyRating = vi.fn();
const mockCreateRating = vi.fn();
const mockDeleteRating = vi.fn();
const mockGetRatingStats = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

vi.mock('@/services/ratingsApi', () => ({
  ratingsApi: {
    getMyRating: (...args: unknown[]) => mockGetMyRating(...args),
    createRating: (...args: unknown[]) => mockCreateRating(...args),
    deleteRating: (...args: unknown[]) => mockDeleteRating(...args),
    getRatingStats: (...args: unknown[]) => mockGetRatingStats(...args),
  },
}));

function authState(partial: { isAuthenticated?: boolean; loading?: boolean } = {}) {
  return {
    user: partial.isAuthenticated ? { id: 42, email: 'user@test.dev' } : null,
    isAuthenticated: partial.isAuthenticated ?? false,
    loading: partial.loading ?? false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  };
}

const defaultProps = {
  courseId: 7,
  initialAverage: 4,
  initialCount: 4,
};

beforeEach(() => {
  // resetAllMocks (not clearAllMocks) so no mockReturnValue leaks between
  // tests: every describe sets up its own explicit auth state.
  vi.resetAllMocks();
  // Pin the location so the login CTA's ?next= is deterministic
  window.history.pushState({}, '', '/course/react-basics');
});

describe('RatingWidget Component', () => {
  describe('Anonymous visitors', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue(authState());
    });

    it('renders disabled stars and a login CTA carrying ?next=', async () => {
      render(<RatingWidget {...defaultProps} />);

      const stars = screen.getAllByRole('radio');
      expect(stars).toHaveLength(5);
      stars.forEach((star) => expect(star).toBeDisabled());

      const link = await screen.findByRole('link', { name: 'Iniciá sesión para calificar' });
      expect(link).toHaveAttribute('href', '/login?next=%2Fcourse%2Freact-basics');
    });

    it('does not fetch the own rating while anonymous', () => {
      render(<RatingWidget {...defaultProps} />);

      expect(mockGetMyRating).not.toHaveBeenCalled();
    });
  });

  describe('While auth boot is loading', () => {
    it('shows disabled stars without the login CTA (avoids wrong flash)', () => {
      mockUseAuth.mockReturnValue(authState({ isAuthenticated: false, loading: true }));

      render(<RatingWidget {...defaultProps} />);

      screen.getAllByRole('radio').forEach((star) => expect(star).toBeDisabled());
      expect(
        screen.queryByRole('link', { name: 'Iniciá sesión para calificar' })
      ).not.toBeInTheDocument();
    });
  });

  describe('Authenticated without a rating', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue(authState({ isAuthenticated: true }));
      mockGetMyRating.mockResolvedValue(null);
    });

    it('enables the stars and POSTs on click, then refetches stats', async () => {
      mockGetRatingStats.mockResolvedValue({ average_rating: 4.2, total_ratings: 5 });

      render(<RatingWidget {...defaultProps} />);

      // Enabled once the own-rating lookup resolves
      await waitFor(() => expect(screen.getAllByRole('radio')[3]).toBeEnabled());
      expect(screen.getByText('Sin calificar todavía')).toBeInTheDocument();

      fireEvent.click(screen.getAllByRole('radio')[3]);

      await waitFor(() =>
        expect(mockCreateRating).toHaveBeenCalledWith(7, { rating: 4 })
      );
      await waitFor(() => expect(mockGetRatingStats).toHaveBeenCalledWith(7));

      // Stats line converges to the refetched numbers
      expect(await screen.findByText(/4\.2 · 5 calificaciones/)).toBeInTheDocument();
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.stringContaining('calificación'),
        'success'
      );
    });

    it('ignores repeated clicks while a submission is pending', async () => {
      let resolvePost: (value: unknown) => void = () => {};
      mockCreateRating.mockImplementation(
        () => new Promise((resolve) => { resolvePost = resolve; })
      );

      render(<RatingWidget {...defaultProps} />);

      await waitFor(() => expect(screen.getAllByRole('radio')[0]).toBeEnabled());

      fireEvent.click(screen.getAllByRole('radio')[4]);
      fireEvent.click(screen.getAllByRole('radio')[1]);

      expect(mockCreateRating).toHaveBeenCalledTimes(1);

      resolvePost({});
      await waitFor(() => expect(mockCreateRating).toHaveBeenCalledTimes(1));
    });
  });

  describe('Authenticated with an existing rating', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue(authState({ isAuthenticated: true }));
      mockGetMyRating.mockResolvedValue(3);
    });

    it('shows the current value and the remove button', async () => {
      render(<RatingWidget {...defaultProps} />);

      expect(await screen.findByText('Tu calificación')).toBeInTheDocument();
      expect(await screen.findByText('3 de 5')).toBeInTheDocument();
      expect(screen.getAllByRole('radio')[2]).toHaveAttribute('aria-checked', 'true');

      expect(
        await screen.findByRole('button', { name: 'Quitar mi calificación' })
      ).toBeInTheDocument();
    });

    it('DELETEs on remove and refreshes stats', async () => {
      mockDeleteRating.mockResolvedValue(undefined);
      mockGetRatingStats.mockResolvedValue({ average_rating: 3.5, total_ratings: 3 });

      render(<RatingWidget {...defaultProps} />);

      const removeBtn = await screen.findByRole('button', { name: 'Quitar mi calificación' });
      fireEvent.click(removeBtn);

      await waitFor(() => expect(mockDeleteRating).toHaveBeenCalledWith(7));
      await waitFor(() => expect(mockGetRatingStats).toHaveBeenCalledWith(7));

      expect(await screen.findByText(/3\.5 · 3 calificaciones/)).toBeInTheDocument();
      expect(mockShowToast).toHaveBeenCalledWith('Eliminamos tu calificación.', 'info');

      // Button disappears once there is no own rating left
      await waitFor(() =>
        expect(
          screen.queryByRole('button', { name: 'Quitar mi calificación' })
        ).not.toBeInTheDocument()
      );
    });
  });

  describe('Error handling', () => {
    it('toasts an error and keeps the previous state when POST fails', async () => {
      mockUseAuth.mockReturnValue(authState({ isAuthenticated: true }));
      mockGetMyRating.mockResolvedValue(null);
      mockCreateRating.mockRejectedValue(new Error('boom'));

      render(<RatingWidget {...defaultProps} />);

      await waitFor(() => expect(screen.getAllByRole('radio')[0]).toBeEnabled());

      fireEvent.click(screen.getAllByRole('radio')[2]);

      // The ToastContext is mocked (no toast DOM), so assert on showToast
      await waitFor(() =>
        expect(mockShowToast).toHaveBeenCalledWith('No se pudo guardar tu calificación.', 'error')
      );

      // Optimistic value was not applied
      expect(screen.getByText('Sin calificar todavía')).toBeInTheDocument();
      expect(mockGetRatingStats).not.toHaveBeenCalled();
    });
  });
});

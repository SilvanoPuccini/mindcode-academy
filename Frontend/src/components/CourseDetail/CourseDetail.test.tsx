import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CourseDetailComponent } from './CourseDetail';
import styles from './CourseDetail.module.scss';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { CourseDetail } from '@/types';

vi.mock('@/lib/api', () => ({
  apiFetch: vi.fn(),
}));

const routerPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: routerPush }),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

// Heavy children with their own network/DOM side effects: stubbed so the
// temario progress logic can be tested in isolation.
vi.mock('@/components/RatingWidget/RatingWidget', () => ({
  RatingWidget: () => <div data-testid="rating-widget-stub" />,
}));
vi.mock('@/components/ShareButtons/ShareButtons', () => ({
  ShareButtons: () => <div data-testid="share-buttons-stub" />,
}));

const mockApiFetch = vi.mocked(apiFetch);
const mockUseAuth = vi.mocked(useAuth);

const course: CourseDetail = {
  id: 7,
  name: 'Curso de React',
  slug: 'curso-de-react',
  thumbnail: 'https://example.com/thumb.jpg',
  description: 'Descripción del curso',
  // Positions arrive unordered on purpose: completion must follow
  // position order (12 -> 11 -> 13), not payload order.
  classes: [
    { id: 11, name: 'Componentes', description: 'Clase dos', slug: 'componentes', position: 2 },
    { id: 12, name: 'Intro', description: 'Clase uno', slug: 'intro', position: 1 },
    { id: 13, name: 'Hooks', description: 'Clase tres', slug: 'hooks', position: 3 },
  ],
};

function mockAuth(isAuthenticated: boolean) {
  mockUseAuth.mockReturnValue({
    user: isAuthenticated
      ? { id: 1, name: 'Ana', email: 'ana@example.com' }
      : null,
    isAuthenticated,
    loading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  } as never);
}

beforeEach(() => {
  vi.clearAllMocks();
});

// The temario list renders inside the "Contenido" tab.
function openContentTab() {
  fireEvent.click(screen.getByRole('button', { name: 'Contenido' }));
}

describe('CourseDetail temario progress', () => {
  it('fetches course progress when authenticated and maps the count onto classes by position', async () => {
    mockAuth(true);
    mockApiFetch.mockResolvedValue({
      id: 1,
      user_id: 1,
      course_id: 7,
      completed_lessons: 2,
      total_lessons: 3,
      progress_percentage: 66.67,
      is_completed: false,
    });

    render(<CourseDetailComponent course={course} />);
    openContentTab();

    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith('/progress/course/7', {
        skipAuthRedirect: true,
      });
    });

    // Classes 12 (position 1) and 11 (position 2) are done; 13 is not.
    await waitFor(() => {
      expect(screen.getByTestId('class-progress-12')).toHaveClass(styles.circleDone);
    });
    expect(screen.getByTestId('class-progress-11')).toHaveClass(styles.circleDone);
    expect(screen.getByTestId('class-progress-13')).not.toHaveClass(styles.circleDone);

    // Resume pill lands on the first incomplete class by position.
    const hooksRow = screen.getByTestId('class-progress-13').closest('a') as HTMLElement;
    expect(within(hooksRow).getByText('Seguí acá')).toBeInTheDocument();
    const introRow = screen.getByTestId('class-progress-12').closest('a') as HTMLElement;
    expect(within(introRow).queryByText('Seguí acá')).not.toBeInTheDocument();
  });

  it('does not fetch progress nor render circles for anonymous users', async () => {
    mockAuth(false);

    render(<CourseDetailComponent course={course} />);
    openContentTab();

    expect(screen.queryByTestId(/^class-progress-/)).not.toBeInTheDocument();
    expect(screen.queryByText('Seguí acá')).not.toBeInTheDocument();
    // Give any stray promise a tick, then confirm no call happened.
    await waitFor(() => {
      expect(mockApiFetch).not.toHaveBeenCalled();
    });
  });

  it('degrades silently to an empty set when the API fails (e.g. 404 not started)', async () => {
    mockAuth(true);
    mockApiFetch.mockRejectedValue(new Error('HTTP 404'));

    render(<CourseDetailComponent course={course} />);
    openContentTab();

    // Circles appear once the fetch settles, all hollow, and the resume
    // pill points at the very first class by position (id 12).
    await waitFor(() => {
      expect(screen.getByTestId('class-progress-12')).toBeInTheDocument();
    });
    expect(screen.getByTestId('class-progress-12')).not.toHaveClass(styles.circleDone);
    expect(screen.getByTestId('class-progress-11')).not.toHaveClass(styles.circleDone);
    expect(screen.getByTestId('class-progress-13')).not.toHaveClass(styles.circleDone);

    const introRow = screen.getByTestId('class-progress-12').closest('a') as HTMLElement;
    expect(within(introRow).getByText('Seguí acá')).toBeInTheDocument();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CourseDetailComponent } from './CourseDetail';
import styles from './CourseDetail.module.scss';
import { apiFetch, publicFetch } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { CourseDetail } from '@/types';

vi.mock('@/lib/api', () => ({
  apiFetch: vi.fn(),
  publicFetch: vi.fn(),
}));

const routerPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: routerPush }),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

const showToast = vi.fn();
vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({ showToast, toasts: [], removeToast: vi.fn() }),
}));

// Heavy child with its own network/DOM side effects: stubbed so the
// temario progress logic can be tested in isolation.
vi.mock('@/components/RatingWidget/RatingWidget', () => ({
  RatingWidget: () => <div data-testid="rating-widget-stub" />,
}));

const mockApiFetch = vi.mocked(apiFetch);
const mockPublicFetch = vi.mocked(publicFetch);
const mockUseAuth = vi.mocked(useAuth);

const course: CourseDetail = {
  id: 7,
  name: 'Curso de React',
  slug: 'curso-de-react',
  thumbnail: 'https://example.com/thumb.jpg',
  description: 'Descripción del curso',
  teachers: [
    { id: 1, name: 'Ana García' },
    { id: 2, name: 'Bruno Díaz' },
  ],
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
  mockAuth(false);
});

// The temario accordion renders inside the "Contenido" tab.
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
    expect(within(screen.getByTestId('class-row-13')).getByText('Seguí acá')).toBeInTheDocument();
    expect(within(screen.getByTestId('class-row-12')).queryByText('Seguí acá')).not.toBeInTheDocument();
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

    expect(within(screen.getByTestId('class-row-12')).getByText('Seguí acá')).toBeInTheDocument();
  });
});

describe('CourseDetail curriculum accordion', () => {
  it('expands a class row to show its description, duration and navigation link', () => {
    render(<CourseDetailComponent course={course} />);
    openContentTab();

    // Rows render in position order: 1. Intro (id 12) first.
    const introHeader = screen.getByRole('button', { name: /Intro/ });
    expect(introHeader).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(introHeader);
    expect(introHeader).toHaveAttribute('aria-expanded', 'true');

    const panel = document.getElementById('class-panel-12');
    expect(panel).not.toHaveAttribute('hidden');
    expect(within(panel as HTMLElement).getByText('Clase uno')).toBeInTheDocument();
    expect(within(panel as HTMLElement).getByText('0 min')).toBeInTheDocument();

    const link = within(panel as HTMLElement).getByRole('link', { name: 'Ver clase' });
    expect(link).toHaveAttribute('href', '/classes/12');

    // Toggling again collapses the row.
    fireEvent.click(introHeader);
    expect(introHeader).toHaveAttribute('aria-expanded', 'false');
    expect(document.getElementById('class-panel-12')).toHaveAttribute('hidden');
  });
});

describe('CourseDetail free-access card', () => {
  it('renders the free badge, includes list and navigates to the first class by position', () => {
    render(<CourseDetailComponent course={course} />);

    expect(screen.getByText('100% Gratis')).toBeInTheDocument();

    // Includes list mirrors the course data (class count also appears
    // in the hero stats badges, hence getAllByText).
    expect(screen.getByText('Este curso incluye:')).toBeInTheDocument();
    expect(screen.getAllByText('3 clases').length).toBeGreaterThan(0);
    expect(screen.getByText('Certificado de finalización')).toBeInTheDocument();
    expect(screen.getByText('Acceso de por vida')).toBeInTheDocument();
    expect(screen.getByText('Mobile y TV')).toBeInTheDocument();

    // "Clase 1" is the first class by POSITION (id 12), not payload order.
    fireEvent.click(screen.getByRole('button', { name: /Empezar clase 1/ }));
    expect(routerPush).toHaveBeenCalledWith('/classes/12');
  });

  it('disables the CTA when the course has no classes', () => {
    render(<CourseDetailComponent course={{ ...course, classes: [] }} />);

    const cta = screen.getByRole('button', { name: 'Sin clases disponibles' });
    expect(cta).toBeDisabled();
    fireEvent.click(cta);
    expect(routerPush).not.toHaveBeenCalled();
  });

  it('shares via clipboard with a success toast when navigator.share is unavailable', async () => {
    const clipboardWrite = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText: clipboardWrite },
      configurable: true,
    });

    render(<CourseDetailComponent course={course} />);

    fireEvent.click(screen.getByRole('button', { name: /Compartir curso/ }));

    await waitFor(() => {
      expect(clipboardWrite).toHaveBeenCalledWith('http://localhost:3000/');
    });
    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith('Link copiado al portapapeles', 'success');
    });
  });
});

describe('CourseDetail hero and description panel', () => {
  it('derives benefits from description sentences and falls back to generic lines', () => {
    render(<CourseDetailComponent course={course} />);

    // Single-sentence description falls back to category-anchored lines
    // ("React" inferred from the course name).
    expect(screen.getByText('Fundamentos sólidos de React')).toBeInTheDocument();
    expect(screen.getByText('Proyectos prácticos y reales')).toBeInTheDocument();
  });

  it('derives one bento card per description sentence when there are enough', () => {
    const richCourse: CourseDetail = {
      ...course,
      description:
        'Domina los fundamentos del lenguaje desde cero. Construye interfaces modernas y accesibles. Aplica buenas prácticas de la industria.',
    };

    render(<CourseDetailComponent course={richCourse} />);

    expect(screen.getByText('Domina los fundamentos del lenguaje desde cero.')).toBeInTheDocument();
    expect(screen.getByText('Construye interfaces modernas y accesibles.')).toBeInTheDocument();
    expect(screen.queryByText('Fundamentos sólidos de React')).not.toBeInTheDocument();
  });

  it('highlights the category keyword in the hero title and lists the teachers', () => {
    const { container } = render(<CourseDetailComponent course={course} />);

    const topicWord = container.querySelector(`.${styles.topicWord}`);
    expect(topicWord).toHaveTextContent('React');
    expect(screen.getByText(/Por Ana García, Bruno Díaz/)).toBeInTheDocument();
    // One instructor card per teacher, each with the fallback bio.
    expect(screen.getAllByText("Instructor en MindCode Academy")).toHaveLength(2);
  });

  it('skips the teacher line and instructor section when the payload has no teachers', () => {
    const { container } = render(<CourseDetailComponent course={{ ...course, teachers: undefined }} />);

    expect(screen.queryByText(/^Por /)).not.toBeInTheDocument();
    expect(container.querySelector(`.${styles.instructorCard}`)).not.toBeInTheDocument();
  });
});

// Score-only rating rows returned by GET /courses/{id}/ratings.
const ratings = [
  {
    id: 1,
    course_id: 7,
    user_id: 10,
    rating: 3,
    created_at: '2026-08-01T10:00:00Z',
    updated_at: '2026-07-01T10:00:00Z',
  },
  {
    id: 2,
    course_id: 7,
    user_id: 21,
    rating: 5,
    created_at: '2026-08-20T10:00:00Z',
    updated_at: '2026-08-20T10:00:00Z',
  },
];

function openReviewsTab() {
  fireEvent.click(screen.getByRole('button', { name: /^Reviews/ }));
}

describe('CourseDetail reviews tab', () => {
  it('fetches ratings on first tab mount and renders score rows newest-first', async () => {
    mockPublicFetch.mockResolvedValue(ratings);

    render(<CourseDetailComponent course={course} />);
    openReviewsTab();

    // Public read against the course's ratings endpoint, once per mount.
    await waitFor(() => {
      expect(mockPublicFetch).toHaveBeenCalledWith('/courses/7/ratings', {
        cache: 'no-store',
      });
    });

    const rows = await screen.findAllByTestId('review-row');
    expect(rows).toHaveLength(2);

    // Newest first: id 2 (updated 2026-08-20) before id 1 (2026-07-01).
    expect(rows[0]).toHaveTextContent('Estudiante #21');
    expect(rows[1]).toHaveTextContent('Estudiante #10');

    // Tab count reconciles to the fetched list length.
    expect(screen.getByRole('button', { name: 'Reviews (2)' })).toBeInTheDocument();

    // Re-opening the tab does not refetch (single request per mount).
    fireEvent.click(screen.getByRole('button', { name: 'Descripción' }));
    openReviewsTab();
    expect(mockPublicFetch).toHaveBeenCalledTimes(1);
  });

  it('invites the first review when the course has no ratings yet', async () => {
    mockPublicFetch.mockResolvedValue([]);

    render(<CourseDetailComponent course={course} />);
    openReviewsTab();

    expect(
      await screen.findByText(/Todavía no hay reseñas — ¡sé el primero!/)
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Calificar este curso' })).toHaveAttribute(
      'href',
      '#rating-widget'
    );
    // Count falls back to the server-rendered total (none here).
    expect(screen.getByRole('button', { name: 'Reviews (0)' })).toBeInTheDocument();
  });

  it('degrades to the empty state when the ratings request fails', async () => {
    mockPublicFetch.mockRejectedValue(new Error('HTTP 500'));

    render(<CourseDetailComponent course={course} />);
    openReviewsTab();

    expect(
      await screen.findByText(/Todavía no hay reseñas — ¡sé el primero!/)
    ).toBeInTheDocument();
    expect(screen.queryByTestId('review-row')).not.toBeInTheDocument();
  });
});

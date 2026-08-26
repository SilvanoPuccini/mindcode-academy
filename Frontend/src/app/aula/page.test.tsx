import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import AulaPage from "./page";

// Heavy chrome stubbed: the page logic under test is the
// gate/auth/content split plus progress mapping.
vi.mock("@/components/Navbar/Navbar", () => ({
  Navbar: () => <nav data-testid="navbar-stub" />,
}));
vi.mock("@/components/Footer/Footer", () => ({
  Footer: () => <footer data-testid="footer-stub" />,
}));

vi.mock("@/contexts/CourseContext", () => ({
  useCourses: vi.fn(),
}));

const authMocks = vi.hoisted(() => ({
  clearSession: vi.fn(() => {}),
  fetchCurrentUser: vi.fn<() => Promise<unknown>>(),
  logout: vi.fn(() => Promise.resolve()),
  getUser: vi.fn<() => unknown>(() => null),
}));

vi.mock("@/services/authApi", () => ({
  AUTH_USER_KEY: "mindcode_user",
  AUTH_CHANGE_EVENT: "mindcode-auth-change",
  getUser: authMocks.getUser,
  clearSession: authMocks.clearSession,
  fetchCurrentUser: authMocks.fetchCurrentUser,
  logout: authMocks.logout,
}));

import { useCourses } from "@/contexts/CourseContext";
const mockedUseCourses = vi.mocked(useCourses);

const ana = { id: 1, email: "ana@example.com", name: "Ana" };

const catalog = [
  {
    id: 7,
    name: "Curso de React",
    description: "Frontend con React",
    thumbnail: "https://example.com/react.jpg",
    slug: "curso-react",
  },
  {
    id: 8,
    name: "Curso de Python",
    description: "Backend con Python",
    thumbnail: "https://example.com/python.jpg",
    slug: "curso-python",
  },
];

// Rows as returned by GET /progress (see ProgressResponse).
const progressRows = [
  {
    id: 1,
    user_id: 1,
    course_id: 7,
    completed_lessons: 2,
    total_lessons: 3,
    progress_percentage: 66.67,
    is_completed: false,
  },
  // Vanished course: dropped instead of rendering a dead card.
  {
    id: 2,
    user_id: 1,
    course_id: 99,
    completed_lessons: 1,
    total_lessons: 5,
    progress_percentage: 20,
    is_completed: false,
  },
  {
    id: 3,
    user_id: 1,
    course_id: 8,
    completed_lessons: 4,
    total_lessons: 4,
    progress_percentage: 100,
    is_completed: true,
  },
];

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  };
}

function stubFetch(handler?: (url: string) => Promise<ReturnType<typeof jsonResponse>>) {
  global.fetch = vi.fn((input: RequestInfo | URL) =>
    handler
      ? handler(typeof input === "string" ? input : input.toString())
      : Promise.resolve(jsonResponse({}, 404))
  ) as unknown as typeof fetch;
}

function mockCatalogContext() {
  mockedUseCourses.mockReturnValue({
    favorites: [7],
    favoritesLoading: false,
    setAllCourses: vi.fn(),
    allCourses: [],
    searchQuery: "",
    setSearchQuery: vi.fn(),
    filters: { category: 1, durations: [], minRating: 0 },
    filteredCourses: [],
    toggleFavorite: vi.fn(),
  } as never);
}

beforeEach(() => {
  vi.clearAllMocks();
  mockCatalogContext();
});

describe("AulaPage", () => {
  it("renders the themed login gate with ?next=/aula for anonymous visitors", async () => {
    authMocks.getUser.mockReturnValue(null);
    authMocks.fetchCurrentUser.mockRejectedValue(
      Object.assign(new Error("HTTP 401"), { status: 401 })
    );
    stubFetch((url) =>
      url.endsWith("/courses")
        ? Promise.resolve(jsonResponse(catalog))
        : Promise.resolve(jsonResponse({}, 404))
    );

    render(<AulaPage />);

    expect(await screen.findByText("Iniciá sesión para ver tu aula")).toBeInTheDocument();
    const loginCta = screen.getByRole("link", { name: "Iniciar sesión" });
    expect(loginCta).toHaveAttribute("href", "/login?next=/aula");
    expect(screen.queryByText(/Continuar viendo/)).not.toBeInTheDocument();
  });

  it("renders stats strip, continue cards and completados for an authenticated user", async () => {
    authMocks.getUser.mockReturnValue(ana);
    authMocks.fetchCurrentUser.mockResolvedValue(ana);
    stubFetch((url) => {
      if (url.endsWith("/courses")) return Promise.resolve(jsonResponse(catalog));
      if (url.endsWith("/progress")) return Promise.resolve(jsonResponse(progressRows));
      return Promise.resolve(jsonResponse({}, 404));
    });

    render(<AulaPage />);

    // Header identity
    expect(await screen.findByText("Tu aprendizaje")).toBeInTheDocument();

    // Stats strip renders once the /progress fetch settles; await it to
    // avoid a race between auth boot and progress state updates (flaky on CI).
    expect(await screen.findByText("curso en progreso")).toBeInTheDocument();
    expect(screen.getByText("completado")).toBeInTheDocument();
    expect(screen.getByText("favorito")).toBeInTheDocument();

    // Continuar viendo: only the row whose course exists (66% -> 67%)
    expect(
      await screen.findByRole("heading", { name: "Continuar viendo" })
    ).toBeInTheDocument();
    const continueCard = screen
      .getByText("Curso de React")
      .closest("a") as HTMLAnchorElement;
    expect(continueCard).toHaveAttribute("href", "/course/curso-react");
    expect(screen.getByText("67%")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Progreso de Curso de React" })).toBeInTheDocument();

    // Vanished course (id 99) never renders a dead card: exactly one
    // link per visible grid card, none pointing at an unknown slug.
    const courseLinks = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('a[href^="/course/"]')
    );
    expect(courseLinks).toHaveLength(2);
    expect(
      courseLinks.some((link) => link.getAttribute("href") === "/course/undefined")
    ).toBe(false);

    // Completados grid with badge
    expect(screen.getByRole("heading", { name: "Completados" })).toBeInTheDocument();
    const doneCard = screen
      .getByText("Curso de Python")
      .closest("a") as HTMLAnchorElement;
    expect(doneCard).toHaveAttribute("href", "/course/curso-python");
    expect(withinCard(doneCard, "Completado")).toBeTruthy();
  });

  it("invites users without any progress to start their first course", async () => {
    authMocks.getUser.mockReturnValue(ana);
    authMocks.fetchCurrentUser.mockResolvedValue(ana);
    stubFetch((url) => {
      if (url.endsWith("/courses")) return Promise.resolve(jsonResponse(catalog));
      if (url.endsWith("/progress")) return Promise.resolve(jsonResponse([]));
      return Promise.resolve(jsonResponse({}, 404));
    });

    render(<AulaPage />);

    expect(await screen.findByText("Arrancá tu primer curso")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explorar cursos" })).toHaveAttribute(
      "href",
      "/#catalogo"
    );
  });
});

// Small helper: assert text inside a card element without leaking
// between the two grids (both render course titles).
function withinCard(card: HTMLElement, text: string): boolean {
  return card.textContent?.includes(text) ?? false;
}

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ClassPage from "./page";

vi.mock("@/components/VideoPlayer/VideoPlayer", () => ({
  VideoPlayer: ({ src, title }: { src: string; title: string }) => (
    <div data-testid="mock-video-player">
      {title} - {src}
    </div>
  ),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ class_id: "19" }),
}));

const authMocks = vi.hoisted(() => ({
  clearSession: vi.fn(() => {}),
  fetchCurrentUser: vi.fn<() => Promise<unknown>>(() =>
    Promise.reject(Object.assign(new Error("HTTP 401"), { status: 401, name: "ApiClientError" }))
  ),
  logout: vi.fn(() => Promise.resolve()),
}));

vi.mock("@/services/authApi", () => ({
  AUTH_USER_KEY: "mindcode_user",
  AUTH_CHANGE_EVENT: "mindcode-auth-change",
  getUser: vi.fn(() => null),
  clearSession: authMocks.clearSession,
  fetchCurrentUser: authMocks.fetchCurrentUser,
  logout: authMocks.logout,
}));

const classDetail = {
  id: 19,
  title: "Clase de Test",
  name: "Clase de Test",
  description: "Descripción de la clase de test",
  slug: "clase-test",
  video: "https://test.com/video.mp4",
  duration: 12, // minutes, as the API sends them
  position: 2,
  total_classes: 3,
  course_id: 7,
  course_slug: "curso-test",
  course_name: "Curso de Test",
};

const courseDetail = {
  id: 7,
  name: "Curso de Test",
  description: "Un curso de prueba",
  thumbnail: "https://test.com/thumb.jpg",
  slug: "curso-test",
  classes: [
    { id: 18, name: "Clase anterior", description: "...", slug: "clase-anterior", position: 1 },
    { id: 19, name: "Clase de Test", description: "...", slug: "clase-test", position: 2 },
    { id: 20, name: "Clase siguiente", description: "...", slug: "clase-siguiente", position: 3, duration: 45 },
  ],
};

const gateBody = {
  detail: {
    msg: "Debés iniciar sesión para ver esta clase",
    course_id: 7,
    course_slug: "curso-test",
    course_name: "Curso de Test",
    title: "Clase de Test",
    position: 2,
    total_classes: 4,
  },
};

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  };
}

type MockHandler = (url: string) => Promise<ReturnType<typeof jsonResponse>>;

function stubFetch(handler: MockHandler) {
  // Two-arg signature so tests can assert on the RequestInit (headers, etc.).
  return vi.fn((input: RequestInfo | URL, _init?: RequestInit) =>
    handler(typeof input === "string" ? input : input.toString())
  );
}

beforeEach(() => {
  // Default boot hydration: anonymous session (GET /auth/me -> 401).
  authMocks.fetchCurrentUser.mockImplementation(() =>
    Promise.reject(Object.assign(new Error("HTTP 401"), { status: 401 }))
  );
  authMocks.clearSession.mockClear();
});

describe("ClassPage", () => {
  it("renders a skeleton while the class request is in flight", () => {
    global.fetch = vi.fn(() => new Promise(() => {})) as unknown as typeof fetch;

    render(<ClassPage />);

    expect(screen.getByTestId("class-page-skeleton")).toBeInTheDocument();
    expect(screen.queryByTestId("mock-video-player")).not.toBeInTheDocument();
  });

  it("shows the lock screen with course context when the API answers 401", async () => {
    const fetchMock = stubFetch((url) => {
      if (url.endsWith("/classes/19")) {
        return Promise.resolve(jsonResponse(gateBody, 401));
      }
      if (url.endsWith("/courses/curso-test")) {
        return Promise.resolve(jsonResponse(courseDetail));
      }
      return Promise.resolve(jsonResponse({}, 404));
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<ClassPage />);

    expect(await screen.findByTestId("lock-screen")).toBeInTheDocument();
    expect(screen.getByText("Curso de Test")).toBeInTheDocument();
    expect(screen.getByText("Clase 2 de 4")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Iniciar Sesión" })
    ).toHaveAttribute("href", "/login?next=/classes/19");
    expect(screen.getByRole("link", { name: "Ver temario" })).toHaveAttribute(
      "href",
      "/course/curso-test"
    );

    // The temario still loads and marks the gated classes (>1) with locks.
    expect(await screen.findByText("Clase siguiente")).toBeInTheDocument();
    expect(screen.getAllByText("Requiere cuenta gratuita")).toHaveLength(2);
  });

  it("renders the player, navigation and temario on success", async () => {
    const fetchMock = stubFetch((url) => {
      if (url.endsWith("/classes/19")) {
        return Promise.resolve(jsonResponse(classDetail));
      }
      if (url.endsWith("/courses/curso-test")) {
        return Promise.resolve(jsonResponse(courseDetail));
      }
      return Promise.resolve(jsonResponse({}, 404));
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<ClassPage />);

    const player = await screen.findByTestId("mock-video-player");
    expect(player).toHaveTextContent("https://test.com/video.mp4");
    expect(screen.getByText("Clase 2 de 3")).toBeInTheDocument();

    // Durations are MINUTES: the active class renders "12 min" in the main
    // chip and the roster entry with duration shows "45 min" (no hh:mm:ss).
    expect(screen.getByText("12 min")).toBeInTheDocument();
    expect(screen.queryByText("20:00")).not.toBeInTheDocument();
    expect(await screen.findByText("45 min")).toBeInTheDocument();

    // Prev/next use real class ids resolved from the parent course roster.
    expect(await screen.findByText("Clase siguiente")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Anterior" })).toHaveAttribute(
      "href",
      "/classes/18"
    );
    expect(screen.getByRole("link", { name: "Siguiente" })).toHaveAttribute(
      "href",
      "/classes/20"
    );

    // Breadcrumb points at the parent course. While logged out, only the
    // classes beyond the current one (position > 2) carry a lock badge.
    expect(screen.getByRole("link", { name: "Inicio" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Curso de Test" })).toHaveAttribute(
      "href",
      "/course/curso-test"
    );
    expect(screen.queryAllByText("Requiere cuenta gratuita")).toHaveLength(1);

    // Curriculum panel header from the blueprint structure.
    expect(screen.getByText("Contenido del curso")).toBeInTheDocument();

    // The current class is highlighted in the sidebar.
    const active = screen.getByRole("link", { current: true });
    expect(active).toHaveTextContent("Clase de Test");
    expect(active).toHaveAttribute("href", "/classes/19");
  });

  it("requests the class with credentials so the session cookie rides along", async () => {
    // Cookie transport: no Authorization header is ever set client-side;
    // apiFetch must send credentials: "include" for the httpOnly cookie.
    const fetchMock = stubFetch((url) => {
      if (url.endsWith("/classes/19")) {
        return Promise.resolve(jsonResponse(classDetail));
      }
      if (url.endsWith("/courses/curso-test")) {
        return Promise.resolve(jsonResponse(courseDetail));
      }
      return Promise.resolve(jsonResponse({}, 404));
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<ClassPage />);

    expect(await screen.findByTestId("mock-video-player")).toBeInTheDocument();

    const [url, init] = fetchMock.mock.calls.find(
      ([u]) => typeof u === "string" && u.endsWith("/classes/19")
    )!;
    expect(url).toContain("/classes/19");
    expect(init?.credentials).toBe("include");
    const headers = new Headers(init?.headers ?? undefined);
    expect(headers.get("Authorization")).toBeNull();
  });
});

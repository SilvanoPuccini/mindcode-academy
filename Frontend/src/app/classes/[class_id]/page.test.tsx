import { renderToString } from "react-dom/server";
import ClassPage from "./page";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/components/VideoPlayer/VideoPlayer", () => ({
  VideoPlayer: ({ src, title }: { src: string; title: string }) => (
    <div data-testid="mock-video-player">
      {title} - {src}
    </div>
  ),
}));

const classDetail = {
  id: 19,
  title: "Clase de Test",
  description: "Descripción de la clase de test",
  video: "https://test.com/video.mp4",
  duration: 1200,
  slug: "clase-test",
};

const courseSummary = {
  id: 7,
  name: "Curso de Test",
  description: "Un curso de prueba",
  thumbnail: "https://test.com/thumb.jpg",
  slug: "curso-test",
};

const courseDetail = {
  ...courseSummary,
  teachers: [{ id: 1, name: "Profesor Test" }],
  classes: [
    { id: 18, name: "Clase anterior", description: "...", slug: "clase-anterior" },
    { id: 19, name: "Clase de Test", description: "Descripción de la clase de test", slug: "clase-test" },
    { id: 20, name: "Clase siguiente", description: "...", slug: "clase-siguiente" },
  ],
};

function mockFetchWithParentCourse() {
  global.fetch = vi.fn().mockImplementation((url: string) => {
    if (url.endsWith("/classes/19")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(classDetail) });
    }
    if (url.endsWith("/courses")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve([courseSummary]) });
    }
    if (url.endsWith("/courses/curso-test")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(courseDetail) });
    }
    return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({}) });
  }) as unknown as typeof fetch;
}

function mockFetchWithoutParentCourse() {
  global.fetch = vi.fn().mockImplementation((url: string) => {
    if (url.endsWith("/classes/19")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(classDetail) });
    }
    if (url.endsWith("/courses")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    }
    return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({}) });
  }) as unknown as typeof fetch;
}

describe("ClassPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders class info, video, breadcrumb and course sidebar when the parent course is found", async () => {
    mockFetchWithParentCourse();

    const html = await renderToString(
      await ClassPage({ params: Promise.resolve({ class_id: "19" }) })
    );

    expect(html).toContain("Clase de Test");
    expect(html).toContain("Descripción de la clase de test");
    expect(html).toContain("mock-video-player");

    // Back navigation now points to the specific course, not the
    // generic home catalog section.
    expect(html).toContain('href="/course/curso-test"');
    expect(html).not.toContain('href="/#catalogo"');

    // Breadcrumb includes the course name.
    expect(html).toContain("Curso de Test");

    // Sidebar lists the other classes of the course.
    expect(html).toContain("Clase anterior");
    expect(html).toContain("Clase siguiente");
  }, 10000);

  it("falls back to the generic catalog link when the parent course can't be resolved", async () => {
    mockFetchWithoutParentCourse();

    const html = await renderToString(
      await ClassPage({ params: Promise.resolve({ class_id: "19" }) })
    );

    expect(html).toContain("Clase de Test");
    expect(html).toContain('href="/#catalogo"');
    expect(html).not.toContain('href="/course/curso-test"');
  }, 10000);
});

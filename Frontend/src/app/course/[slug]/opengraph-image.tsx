import { ImageResponse } from "next/og";

// Course Open Graph art for /course/[slug]. Dynamic route: both the alt
// metadata and the art resolve the course at REQUEST time. Every fetch
// is fail-silent — if the API is unreachable (local build, offline
// prerender, unknown slug) we fall back to generic brand art instead of
// breaking the route.

const size = {
  width: 1200,
  height: 630,
};

interface CourseOgData {
  name: string;
  averageRating: number | null;
}

async function loadCourseOgData(slug: string): Promise<CourseOgData> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/courses/${slug}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return {
      name:
        typeof data?.name === "string" && data.name.trim().length > 0
          ? data.name
          : "MindCode Academy",
      averageRating:
        typeof data?.average_rating === "number" && data.average_rating > 0
          ? data.average_rating
          : null,
    };
  } catch {
    // Fail-silent: keep the OG route renderable with generic art.
    return { name: "MindCode Academy", averageRating: null };
  }
}

// generateMetadata-style dynamic alt text for the image entry.
export async function generateImageMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await loadCourseOgData(slug);

  return [
    {
      contentType: "image/png",
      size,
      id: "default",
      alt:
        course.name === "MindCode Academy"
          ? "MindCode Academy - Plataforma de cursos online con IA"
          : `${course.name} - Curso de MindCode Academy`,
    },
  ];
}

export default async function CourseOpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await loadCourseOgData(slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 96,
          background: "linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #27170E 100%)",
          position: "relative",
        }}
      >
        {/* Decorative brand tiles */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -80,
            width: 420,
            height: 420,
            borderRadius: 64,
            transform: "rotate(18deg)",
            background: "linear-gradient(135deg, #F97316, #DC2626)",
            opacity: 0.85,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -140,
            right: 220,
            width: 300,
            height: 300,
            borderRadius: 48,
            transform: "rotate(-12deg)",
            background: "linear-gradient(135deg, #DC2626, #7C2D12)",
            opacity: 0.5,
            display: "flex",
          }}
        />
        <div
          style={{
            display: "flex",
            fontSize: 28,
            fontWeight: 600,
            color: "#FB923C",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 24,
          }}
        >
          Curso · MindCode Academy
        </div>
        <div
          style={{
            display: "flex",
            fontSize: course.name.length > 40 ? 68 : 84,
            fontWeight: 700,
            color: "#F1F5F9",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            maxWidth: 900,
          }}
        >
          {course.name}
        </div>
        {course.averageRating !== null && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginTop: 36,
              fontSize: 34,
              color: "#FBBF24",
            }}
          >
            <span>★</span>
            <span style={{ color: "#CBD5E1" }}>
              {course.averageRating.toFixed(1)} de valoración promedio
            </span>
          </div>
        )}
      </div>
    ),
    size
  );
}

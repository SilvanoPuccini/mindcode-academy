import { ImageResponse } from "next/og";

// Home Open Graph art (1200x630): brand gradient tile echoing the
// MindCode palette (orange -> red accents on dark slate). System fonts
// only (satori's bundled default) so the build needs no font fetching.

export const alt = "MindCode Academy - Plataforma de cursos online con IA";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpengraphImage() {
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
            position: "absolute",
            top: 96,
            left: 96,
            width: 72,
            height: 10,
            borderRadius: 999,
            background: "linear-gradient(90deg, #F97316, #DC2626)",
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            fontSize: 92,
            fontWeight: 700,
            color: "#F1F5F9",
            letterSpacing: "-0.02em",
          }}
        >
          MindCode Academy
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 40,
            color: "#CBD5E1",
            marginTop: 28,
            maxWidth: 820,
          }}
        >
          Donde la mente y la inteligencia artificial se encuentran para aprender.
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 26,
            fontWeight: 600,
            color: "#FB923C",
            marginTop: 40,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Cursos online · Aprendé a tu ritmo
        </div>
      </div>
    ),
    size
  );
}

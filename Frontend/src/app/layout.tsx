import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import { CourseProvider } from "@/contexts/CourseContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { ToastContainer } from "@/components/Toast/Toast";
import "../styles/reset.scss";

// Outfit Bold - Para títulos y branding
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

// Inter Regular - Para texto base
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Mindia - Aprende con inteligencia",
  description: "Donde la mente y la tecnología se encuentran para aprender. Plataforma de cursos online moderna e inteligente.",
  keywords: ["cursos online", "aprendizaje", "tecnología", "educación"],
  authors: [{ name: "Mindia" }],
  openGraph: {
    title: "Mindia - Aprende con inteligencia",
    description: "Donde la mente y la tecnología se encuentran para aprender",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${outfit.variable} ${inter.variable}`}>
        <ToastProvider>
          <CourseProvider>
            {children}
            <ToastContainer />
          </CourseProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { CourseProvider } from "@/contexts/CourseContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ToastContainer } from "@/components/Toast/Toast";
import { ScrollToTop } from "@/components/ScrollToTop/ScrollToTop";
import "../styles/reset.scss";

// Space Grotesk - Display font for headings and branding
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Inter Regular - Para texto base
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://mindcode-academy.com'),
  title: {
    default: "MindCode Academy - Aprende con inteligencia artificial",
    template: "%s | MindCode Academy",
  },
  description: "Donde la mente y la inteligencia artificial se encuentran para aprender. Plataforma de cursos online con tecnología de IA para potenciar tu aprendizaje.",
  keywords: [
    "cursos online",
    "aprendizaje",
    "tecnología",
    "educación",
    "inteligencia artificial",
    "IA",
    "programación",
    "desarrollo web",
    "ciencia de datos",
    "machine learning",
    "cursos interactivos",
    "educación online",
    "MindCode Academy",
  ],
  authors: [{ name: "MindCode Academy" }],
  creator: "MindCode Academy",
  publisher: "MindCode Academy",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://mindcode-academy.com",
    siteName: "MindCode Academy",
    title: "MindCode Academy - Aprende con inteligencia artificial",
    description: "Donde la mente y la inteligencia artificial se encuentran para aprender.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MindCode Academy - Plataforma de cursos online",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MindCode Academy - Aprende con inteligencia artificial",
    description: "Donde la mente y la inteligencia artificial se encuentran para aprender.",
    images: ["/og-image.png"],
    creator: "@mindcodeacademy",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MindCode Academy",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

// Next.js 15: viewport config lives in its own export, not inside metadata
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#EA580C",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="MindCode Academy" />
        <meta name="theme-color" content="#EA580C" />
      </head>
      <body className={`${spaceGrotesk.variable} ${inter.variable}`}>
        <ThemeProvider>
          <ToastProvider>
            <CourseProvider>
              {children}
              <ToastContainer />
              <ScrollToTop />
            </CourseProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

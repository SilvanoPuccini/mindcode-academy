import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import { CourseProvider } from "@/contexts/CourseContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ToastContainer } from "@/components/Toast/Toast";
import { ScrollToTop } from "@/components/ScrollToTop/ScrollToTop";
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
  metadataBase: new URL('https://mindia.com'),
  title: {
    default: "MIND IA - Aprende con inteligencia artificial",
    template: "%s | MIND IA",
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
    "MIND IA",
  ],
  authors: [{ name: "MIND IA" }],
  creator: "MIND IA",
  publisher: "MIND IA",
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
    url: "https://mindia.com",
    siteName: "MIND IA",
    title: "MIND IA - Aprende con inteligencia artificial",
    description: "Donde la mente y la inteligencia artificial se encuentran para aprender.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MIND IA - Plataforma de cursos online",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MIND IA - Aprende con inteligencia artificial",
    description: "Donde la mente y la inteligencia artificial se encuentran para aprender.",
    images: ["/og-image.png"],
    creator: "@mindia",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    themeColor: "#06B6D4",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MIND IA",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
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
        <meta name="apple-mobile-web-app-title" content="MIND IA" />
        <meta name="theme-color" content="#06B6D4" />
      </head>
      <body className={`${outfit.variable} ${inter.variable}`}>
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

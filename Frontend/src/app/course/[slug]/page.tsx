import { notFound } from "next/navigation";
import { CourseDetail } from "@/types";
import { CourseDetailComponent } from "@/components/CourseDetail/CourseDetail";
import { ScrollToTopOnMount } from "@/components/ScrollToTopOnMount/ScrollToTopOnMount";

interface CoursePageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getCourseData(slug: string): Promise<CourseDetail> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/courses/${slug}`, {
    cache: "no-store", // Ensures fresh data on each request
  });

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error("Failed to fetch course data");
  }

  return response.json();
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;
  const courseData = await getCourseData(slug);

  // JSON-LD Schema para SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: courseData.name,
    description: courseData.description,
    provider: {
      '@type': 'Organization',
      name: 'MindCode Academy',
      sameAs: 'https://mindcode-academy.com',
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: `PT${courseData.classes?.length || 0}H`,
    },
    ...(courseData.average_rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: courseData.average_rating,
        ratingCount: courseData.total_ratings || 0,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    offers: {
      '@type': 'Offer',
      category: 'Education',
      availability: 'https://schema.org/InStock',
    },
    educationalLevel: 'All levels',
    inLanguage: 'es',
    thumbnailUrl: courseData.thumbnail,
  };

  return (
    <>
      <ScrollToTopOnMount />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CourseDetailComponent course={courseData} />
    </>
  );
}

export async function generateMetadata({ params }: CoursePageProps) {
  const { slug } = await params;
  const courseData = await getCourseData(slug);

  return {
    title: `${courseData.name} - Curso Online`,
    description: courseData.description,
  };
}

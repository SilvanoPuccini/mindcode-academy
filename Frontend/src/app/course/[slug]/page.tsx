import { notFound } from "next/navigation";
import { CourseDetail } from "@/types";
import { CourseDetailComponent } from "@/components/CourseDetail/CourseDetail";

interface CoursePageProps {
  params: {
    slug: string;
  };
}

async function getCourseData(slug: string): Promise<CourseDetail> {
  const response = await fetch(`http://localhost:8000/courses/${slug}`, {
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
  const courseData = await getCourseData(params.slug);

  // JSON-LD Schema para SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: courseData.name,
    description: courseData.description,
    provider: {
      '@type': 'Organization',
      name: 'MIND IA',
      sameAs: 'https://mindia.com',
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CourseDetailComponent course={courseData} />
    </>
  );
}

export async function generateMetadata({ params }: CoursePageProps) {
  const courseData = await getCourseData(params.slug);

  return {
    title: `${courseData.title} - Curso Online`,
    description: courseData.description,
  };
}

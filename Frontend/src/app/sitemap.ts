import { MetadataRoute } from 'next';

interface Course {
  id: number;
  name: string;
  slug: string;
  description: string;
  thumbnail: string;
  average_rating?: number;
  total_ratings?: number;
}

/**
 * Generate dynamic sitemap for SEO optimization
 * Includes static pages and dynamic course pages
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mindcode-academy.com';

  // Fetch all courses to generate dynamic routes
  let courses: Course[] = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/courses`, {
      next: { revalidate: 3600 } // Revalidate every hour
    });
    if (res.ok) {
      courses = await res.json();
    }
  } catch (error) {
    console.error('Error fetching courses for sitemap:', error);
  }

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/favorites`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ayuda`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contacto`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terminos`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacidad`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Dynamic course pages
  const coursePages: MetadataRoute.Sitemap = courses.map((course) => ({
    url: `${baseUrl}/course/${course.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  return [...staticPages, ...coursePages];
}

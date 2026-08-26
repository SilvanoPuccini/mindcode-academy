// Course types
export interface Course {
  id: number;
  name: string;
  description: string;
  thumbnail: string;
  slug: string;
  // Campos opcionales de rating
  average_rating?: number; // 0.0 - 5.0
  total_ratings?: number; // Cantidad de ratings
  // Aggregated class stats, present on the list endpoint (GET /courses)
  // without needing to fetch each course's full detail.
  total_classes?: number;
  total_duration_minutes?: number;
  // Optional enrichment (present in detail endpoint, may be absent in list)
  classes?: Class[];
  teachers?: { id: number; name: string }[];
}

// Class types
// List shape (from /courses/{slug}): id, name, description, slug, position
// Detail shape (from /classes/{id}): adds title, video, duration and the
// parent-course context consumed by the playback login gate
// (position, course_id, course_slug, course_name, total_classes).
// All enrichment fields stay optional so both shapes satisfy Class.
export interface Class {
  id: number;
  name: string;
  description: string;
  slug: string;
  title?: string;
  video?: string;
  // Attribution for third-party YouTube content, rides along with `video`.
  // Null/absent when the video has no external channel to credit.
  video_credit?: string | null;
  duration?: number;
  // Enrichment fields (optional everywhere):
  position?: number;
  course_id?: number;
  course_slug?: string;
  course_name?: string;
  total_classes?: number;
}

// Course Detail type
export interface CourseDetail extends Course {
  description: string;
  classes: Class[];
  teachers?: { id: number; name: string }[];
}

// Progress types
export interface Progress {
  progress: number; // seconds
  user_id: number;
}

// Quiz types
export interface QuizOption {
  id: number;
  answer: string;
  correct: boolean;
}

export interface Quiz {
  id: number;
  question: string;
  options: QuizOption[];
}

// Favorite types
export interface FavoriteToggle {
  course_id: number;
}
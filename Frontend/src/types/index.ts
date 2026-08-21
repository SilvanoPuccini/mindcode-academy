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
  // Optional enrichment (present in detail endpoint, may be absent in list)
  classes?: Class[];
  teachers?: { id: number; name: string }[];
}

// Class types
// List shape (from /courses/{slug}): id, name, description, slug
// Detail shape (from /classes/{id}): adds title, video, duration
export interface Class {
  id: number;
  name: string;
  description: string;
  slug: string;
  title?: string;
  video?: string;
  duration?: number;
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
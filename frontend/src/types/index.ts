// User types
export interface User {
  id: string;
  telegramId: number;
  username?: string;
  firstName: string;
  lastName?: string;
  photoUrl?: string;
  email?: string;
  role: 'user' | 'admin';
  createdAt: string;
}

// Course types
export interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  coverImage: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  discount?: number;
  finalPrice: number;
  rating: number;
  reviewsCount: number;
  studentsCount: number;
  duration: string; // e.g., "4 weeks", "20 hours"
  lessonsCount: number;
  instructor: {
    name: string;
    avatar?: string;
    bio?: string;
  };
  lessons: Lesson[];
  tags: string[];
  isPurchased?: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// Lesson types
export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  videoUrl: string;
  duration: number; // in seconds
  order: number;
  isPreview: boolean; // Free preview available
  isCompleted?: boolean;
  createdAt: string;
}

// User Course Progress
export interface CourseProgress {
  courseId: string;
  course: Course;
  progress: number; // 0-100
  lastAccessedAt: string;
  completedLessons: string[];
  totalLessons: number;
  startedAt: string;
  completedAt?: string;
  certificate?: Certificate;
}

// Certificate types
export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  courseName: string;
  issuedAt: string;
  certificateUrl: string;
}

// Purchase types
export interface Purchase {
  id: string;
  userId: string;
  courseId: string;
  course: Course;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  purchasedAt: string;
}

// Review types
export interface Review {
  id: string;
  userId: string;
  courseId: string;
  user: {
    firstName: string;
    photoUrl?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

// Filter and Sort types
export interface CourseFilters {
  search?: string;
  category?: string;
  level?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'popular' | 'rating' | 'price-asc' | 'price-desc' | 'newest';
}

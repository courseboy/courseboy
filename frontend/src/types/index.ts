// User types
export interface User {
  id: number;
  email: string;
  username: string | null;
  isActive: boolean;
  roles: string[];
  createdAt: string;
  lastLogin: string | null;
}

export interface AuthUser {
  userId: number;
  email: string;
  roles: string[];
}

// Course types
export interface Course {
  id: number;
  name: string;
  description: string | null;
  coverImg: string | null;
  isPublished: boolean;
  requiredRole: string | null;
  certificateTemplateUrl: string | null;
  averageRating: number;
  feedbacksCount: number;
  hasAccess: boolean;
  userProgress: CourseProgress | null;
  categories: CourseCategory[];
  createdAt: string;
  updatedAt: string | null;
}

export interface CourseProgress {
  completedLessons: number;
  totalLessons: number;
  percentage: number;
}

export interface CourseCategory {
  id: number;
  name: string;
  orderIndex: number;
  lessons: Lesson[];
  quizzes: Quiz[];
}

// Lesson types
export interface Lesson {
  id: number;
  title: string;
  videoUrl: string | null;
  durationSeconds: number | null;
  isFreePreview: boolean;
  orderIndex: number;
}

export interface LessonDetail extends Lesson {
  courseName: string | null;
  categoryName: string | null;
  userProgress: LessonProgress | null;
}

export interface LessonProgress {
  watchedSeconds: number;
  isCompleted: boolean;
  lastAccessAt: string;
}

// Quiz types
export interface Quiz {
  id: number;
  name: string;
  questionLink: string;
  maxScore: number;
}

export interface QuizSubmission {
  id: number;
  quizId: number;
  answerLink: string | null;
  score: number | null;
  submittedAt: string;
  instructorFeedback: string | null;
}

// Certificate types
export interface Certificate {
  id: number;
  courseId: number;
  certificateCode: string;
  fileUrl: string | null;
  issuedAt: string;
}

// Role types
export interface Role {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
}

// Privilege types
export interface Privilege {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
}

// Admin User types
export interface AdminUser {
  id: number;
  email: string;
  username: string | null;
  isActive: boolean;
  privileges: string[];
  createdAt: string;
  lastLogin: string | null;
}

export interface CreateUserFormData {
  email: string;
  username: string;
  password: string;
  privilegeIds: number[];
}

export interface EditUserFormData {
  username: string;
  email: string;
  isActive: boolean;
  privilegeIds: number[];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

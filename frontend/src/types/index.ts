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
  userProgress?: {
    watchedSeconds: number;
    isCompleted: boolean;
  } | null;
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
  description: string | null;
  passingScore: number;
  timeLimit: number | null;
  isCompleted?: boolean;
  hasPassed?: boolean;
  userSubmission?: QuizSubmission | null;
  questions?: QuizQuestion[];
  _count?: {
    questions: number;
    quizSubmissions?: number;
  };
}

export interface QuizQuestion {
  id: number;
  questionText: string;
  questionType: "multiple_choice" | "true_false";
  options: string[];
  correctAnswer?: number; // Only included for admin or after submission
  points: number;
  orderIndex: number;
  // For results page
  userAnswer?: number | null;
  isCorrect?: boolean;
}

export interface QuizSubmission {
  id: number;
  quizId: number;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  answers?: Record<string, number>;
  timeTaken: number | null;
  submittedAt: string;
}

export interface QuizSubmitResult {
  submission: QuizSubmission;
  isNewRecord: boolean;
  questionsTotal: number;
  questionsCorrect: number;
  message?: string;
}

export interface QuizResults {
  quiz: {
    id: number;
    name: string;
    description: string | null;
    passingScore: number;
  };
  submission: {
    score: number;
    maxScore: number;
    percentage: number;
    passed: boolean;
    timeTaken: number | null;
    submittedAt: string;
  };
  questions: (QuizQuestion & {
    userAnswer: number | null;
    isCorrect: boolean;
  })[];
}

// Quiz Analytics types
export interface QuizAnalyticsStats {
  totalAttempts: number;
  passRate: number;
  avgScore: number;
  avgTimeTaken: number;
  passedCount: number;
  failedCount: number;
}

export interface ScoreDistribution {
  range: string;
  count: number;
}

export interface RecentSubmission {
  id: number;
  user: {
    id: number;
    email: string;
    username: string | null;
  };
  quiz: {
    id: number;
    name: string;
  };
  course: {
    id: number;
    name: string;
  };
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  timeTaken: number | null;
  submittedAt: string;
}

export interface QuizPerformance {
  id: number;
  name: string;
  attempts: number;
  passRate: number;
  avgScore: number;
}

export interface StrugglingUser {
  user: {
    id: number;
    email: string;
    username: string | null;
  };
  failedQuizzes: number;
  totalAttempts: number;
  avgScore: number;
}

export interface QuizAnalyticsOverview {
  stats: QuizAnalyticsStats;
  scoreDistribution: ScoreDistribution[];
  recentSubmissions: RecentSubmission[];
  quizPerformance: QuizPerformance[];
  strugglingUsers: StrugglingUser[];
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

// Admin Course types
export interface AdminCourse {
  id: number;
  name: string | null;
  description: string | null;
  coverImg: string | null;
  isPublished: boolean;
  requiredPrivilege: string | null;
  requiredPrivilegeId: number | null;
  lessonsCount: number;
  categoriesCount: number;
  totalDurationSeconds: number;
  categories: AdminCategory[];
  createdAt: string;
  updatedAt: string | null;
}

export interface AdminCategory {
  id: number;
  name: string;
  orderIndex: number;
  lessonsCount: number;
  lessons: AdminLesson[];
  quizzes: Quiz[];
}

export interface AdminLesson {
  id: number;
  title: string;
  videoUrl: string | null;
  durationSeconds: number | null;
  isFreePreview: boolean;
  orderIndex: number;
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

import axios from "axios";
import Cookies from "js-cookie";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get("refreshToken");
        if (refreshToken) {
          const response = await axios.post(
            `${API_URL}/auth/refresh`,
            { refreshToken },
            { withCredentials: true }
          );

          const { accessToken } = response.data.data;
          Cookies.set("accessToken", accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

// API methods
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"),
  refresh: (refreshToken: string) =>
    api.post("/auth/refresh", { refreshToken }),
  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    api.patch("/auth/change-password", data),
};

export const courseApi = {
  getAll: (page = 1, limit = 10) =>
    api.get(`/courses?page=${page}&limit=${limit}`),
  getById: (id: number) => api.get(`/courses/${id}`),
  create: (data: {
    name: string;
    description?: string;
    coverImg?: string;
    requiredRoleId?: number;
  }) => api.post("/courses", data),
  update: (id: number, data: Record<string, unknown>) =>
    api.patch(`/courses/${id}`, data),
  delete: (id: number) => api.delete(`/courses/${id}`),
};

export const lessonApi = {
  getById: (id: number) => api.get(`/lessons/${id}`),
  updateProgress: (
    id: number,
    data: { watchedSeconds: number; isCompleted?: boolean }
  ) => api.patch(`/lessons/${id}/progress`, data),
};

export const userApi = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (data: { username?: string; email?: string }) =>
    api.patch("/users/profile", data),
  getProgress: () => api.get("/users/progress"),
};

// Admin User Management API
export const adminUserApi = {
  getAll: (page = 1, limit = 10) =>
    api.get(`/users?page=${page}&limit=${limit}`),
  getById: (id: number) => api.get(`/users/${id}`),
  create: (data: {
    email: string;
    username?: string;
    password: string;
    privilegeIds?: number[];
  }) => api.post("/users", data),
  update: (
    id: number,
    data: { username?: string; email?: string; isActive?: boolean }
  ) => api.patch(`/users/${id}`, data),
  deactivate: (id: number) => api.patch(`/users/${id}/deactivate`),
  activate: (id: number) => api.patch(`/users/${id}/activate`),
  getPrivileges: () => api.get("/users/privileges"),
  updatePrivileges: (id: number, privilegeIds: number[]) =>
    api.put(`/users/${id}/privileges`, { privilegeIds }),
};

// Admin Privilege Management API
export const adminPrivilegeApi = {
  getAll: () => api.get("/users/privileges"),
  getById: (id: number) => api.get(`/users/privileges/${id}`),
  create: (data: { name: string; description?: string; price?: number }) =>
    api.post("/users/privileges", data),
  update: (
    id: number,
    data: { name?: string; description?: string | null; price?: number | null }
  ) => api.patch(`/users/privileges/${id}`, data),
  delete: (id: number) => api.delete(`/users/privileges/${id}`),
};

// Admin Course Management API
export const adminCourseApi = {
  getAll: (page = 1, limit = 50) =>
    api.get(`/courses/admin/all?page=${page}&limit=${limit}`),
  getById: (id: number) => api.get(`/courses/${id}`),
  create: (data: {
    name: string;
    description?: string;
    coverImg?: string;
    requiredPrivilegeId?: number;
    isPublished?: boolean;
  }) => api.post("/courses", data),
  update: (
    id: number,
    data: {
      name?: string;
      description?: string;
      coverImg?: string;
      requiredPrivilegeId?: number | null;
      isPublished?: boolean;
    }
  ) => api.patch(`/courses/${id}`, data),
  delete: (id: number) => api.delete(`/courses/${id}`),

  // Category management
  createCategory: (courseId: number, data: { name: string }) =>
    api.post(`/courses/${courseId}/categories`, data),
  updateCategory: (categoryId: number, data: { name?: string }) =>
    api.patch(`/courses/categories/${categoryId}`, data),
  deleteCategory: (categoryId: number) =>
    api.delete(`/courses/categories/${categoryId}`),
  reorderCategories: (courseId: number, categoryIds: number[]) =>
    api.put(`/courses/${courseId}/categories/reorder`, { categoryIds }),

  // Lesson management
  createLesson: (
    courseId: number,
    categoryId: number,
    data: {
      title: string;
      videoUrl?: string;
      durationSeconds?: number;
      isFreePreview?: boolean;
    }
  ) =>
    api.post(
      `/lessons/courses/${courseId}/categories/${categoryId}/lessons`,
      data
    ),
  updateLesson: (
    lessonId: number,
    data: {
      title?: string;
      videoUrl?: string;
      durationSeconds?: number;
      isFreePreview?: boolean;
    }
  ) => api.patch(`/lessons/${lessonId}`, data),
  deleteLesson: (lessonId: number) => api.delete(`/lessons/${lessonId}`),
  reorderLessons: (categoryId: number, lessonIds: number[]) =>
    api.put(`/courses/categories/${categoryId}/lessons/reorder`, { lessonIds }),

  // Quiz management
  createQuiz: (
    categoryId: number,
    data: {
      name: string;
      description?: string;
      passingScore?: number;
      timeLimit?: number | null;
    }
  ) => api.post(`/quizzes/category/${categoryId}`, data),
  updateQuiz: (
    quizId: number,
    data: {
      name?: string;
      description?: string;
      passingScore?: number;
      timeLimit?: number | null;
    }
  ) => api.patch(`/quizzes/${quizId}`, data),
  deleteQuiz: (quizId: number) => api.delete(`/quizzes/${quizId}`),
  getQuizAdmin: (quizId: number) => api.get(`/quizzes/${quizId}/admin`),
  getQuizSubmissions: (quizId: number) =>
    api.get(`/quizzes/${quizId}/submissions`),

  // Question management
  createQuestion: (
    quizId: number,
    data: {
      questionText: string;
      questionType?: "multiple_choice" | "true_false";
      options: string[];
      correctAnswer: number;
      points?: number;
    }
  ) => api.post(`/quizzes/${quizId}/questions`, data),
  updateQuestion: (
    questionId: number,
    data: {
      questionText?: string;
      questionType?: "multiple_choice" | "true_false";
      options?: string[];
      correctAnswer?: number;
      points?: number;
    }
  ) => api.patch(`/quizzes/questions/${questionId}`, data),
  deleteQuestion: (questionId: number) =>
    api.delete(`/quizzes/questions/${questionId}`),
  reorderQuestions: (quizId: number, questionIds: number[]) =>
    api.post(`/quizzes/${quizId}/questions/reorder`, { questionIds }),

  // Quiz analytics
  getAnalyticsOverview: (courseId?: number, quizId?: number) => {
    const params = new URLSearchParams();
    if (courseId) params.append("courseId", courseId.toString());
    if (quizId) params.append("quizId", quizId.toString());
    const queryString = params.toString();
    return api.get(
      `/quizzes/analytics/overview${queryString ? `?${queryString}` : ""}`
    );
  },
  getQuestionAnalytics: (quizId: number) =>
    api.get(`/quizzes/${quizId}/analytics`),
};

// Quiz API (for users)
export const quizApi = {
  getById: (id: number) => api.get(`/quizzes/${id}`),
  submit: (id: number, answers: Record<number, number>, timeTaken?: number) =>
    api.post(`/quizzes/${id}/submit`, { answers, timeTaken }),
  getResults: (id: number) => api.get(`/quizzes/${id}/results`),
  getUserSubmissions: (courseId: number) =>
    api.get(`/quizzes/course/${courseId}/submissions`),
};

export default api;

"use client";

import { useState } from "react";
import { AdminCourse, AdminCategory, AdminLesson, Quiz } from "@/types";

interface CourseModals {
  isCreateCourseModalOpen: boolean;
  isEditCourseModalOpen: boolean;
  selectedCourse: AdminCourse | null;
}

interface CategoryModals {
  isCreateCategoryModalOpen: boolean;
  isEditCategoryModalOpen: boolean;
  selectedCourseForCategory: number | null;
  selectedCategory: AdminCategory | null;
}

interface LessonModals {
  isCreateLessonModalOpen: boolean;
  isEditLessonModalOpen: boolean;
  selectedCourseForLesson: number | null;
  selectedCategoryForLesson: number | null;
  selectedLesson: AdminLesson | null;
}

interface QuizModals {
  isCreateQuizModalOpen: boolean;
  isEditQuizModalOpen: boolean;
  isDeleteQuizModalOpen: boolean;
  isManageQuestionsModalOpen: boolean;
  selectedCourseForQuiz: number | null;
  selectedCategoryForQuiz: AdminCategory | null;
  selectedQuiz: Quiz | null;
}

interface UseCourseModalsReturn {
  courseModals: CourseModals;
  categoryModals: CategoryModals;
  lessonModals: LessonModals;
  quizModals: QuizModals;
  openCreateCourse: () => void;
  openEditCourse: (course: AdminCourse) => void;
  openCreateCategory: (courseId: number) => void;
  openEditCategory: (category: AdminCategory) => void;
  openCreateLesson: (courseId: number, categoryId: number) => void;
  openEditLesson: (lesson: AdminLesson) => void;
  openCreateQuiz: (courseId: number, category: AdminCategory) => void;
  openEditQuiz: (courseId: number, quiz: Quiz) => void;
  openDeleteQuiz: (courseId: number, quiz: Quiz) => void;
  openManageQuestions: (courseId: number, quiz: Quiz) => void;
  closeAllModals: () => void;
}

/**
 * Manages all modal states for course management
 */
export function useCourseModals(): UseCourseModalsReturn {
  // Course modals
  const [isCreateCourseModalOpen, setIsCreateCourseModalOpen] = useState(false);
  const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<AdminCourse | null>(
    null
  );

  // Category modals
  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] =
    useState(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [selectedCourseForCategory, setSelectedCourseForCategory] = useState<
    number | null
  >(null);
  const [selectedCategory, setSelectedCategory] =
    useState<AdminCategory | null>(null);

  // Lesson modals
  const [isCreateLessonModalOpen, setIsCreateLessonModalOpen] = useState(false);
  const [isEditLessonModalOpen, setIsEditLessonModalOpen] = useState(false);
  const [selectedCourseForLesson, setSelectedCourseForLesson] = useState<
    number | null
  >(null);
  const [selectedCategoryForLesson, setSelectedCategoryForLesson] = useState<
    number | null
  >(null);
  const [selectedLesson, setSelectedLesson] = useState<AdminLesson | null>(
    null
  );

  // Quiz modals
  const [isCreateQuizModalOpen, setIsCreateQuizModalOpen] = useState(false);
  const [isEditQuizModalOpen, setIsEditQuizModalOpen] = useState(false);
  const [isDeleteQuizModalOpen, setIsDeleteQuizModalOpen] = useState(false);
  const [isManageQuestionsModalOpen, setIsManageQuestionsModalOpen] =
    useState(false);
  const [selectedCourseForQuiz, setSelectedCourseForQuiz] = useState<
    number | null
  >(null);
  const [selectedCategoryForQuiz, setSelectedCategoryForQuiz] =
    useState<AdminCategory | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  const closeAllModals = () => {
    setIsCreateCourseModalOpen(false);
    setIsEditCourseModalOpen(false);
    setIsCreateCategoryModalOpen(false);
    setIsEditCategoryModalOpen(false);
    setIsCreateLessonModalOpen(false);
    setIsEditLessonModalOpen(false);
    setIsCreateQuizModalOpen(false);
    setIsEditQuizModalOpen(false);
    setIsDeleteQuizModalOpen(false);
    setIsManageQuestionsModalOpen(false);
    setSelectedCourse(null);
    setSelectedCategory(null);
    setSelectedLesson(null);
    setSelectedQuiz(null);
    setSelectedCategoryForQuiz(null);
    setSelectedCourseForQuiz(null);
    setSelectedCourseForCategory(null);
    setSelectedCourseForLesson(null);
    setSelectedCategoryForLesson(null);
  };

  return {
    courseModals: {
      isCreateCourseModalOpen,
      isEditCourseModalOpen,
      selectedCourse,
    },
    categoryModals: {
      isCreateCategoryModalOpen,
      isEditCategoryModalOpen,
      selectedCourseForCategory,
      selectedCategory,
    },
    lessonModals: {
      isCreateLessonModalOpen,
      isEditLessonModalOpen,
      selectedCourseForLesson,
      selectedCategoryForLesson,
      selectedLesson,
    },
    quizModals: {
      isCreateQuizModalOpen,
      isEditQuizModalOpen,
      isDeleteQuizModalOpen,
      isManageQuestionsModalOpen,
      selectedCourseForQuiz,
      selectedCategoryForQuiz,
      selectedQuiz,
    },
    openCreateCourse: () => setIsCreateCourseModalOpen(true),
    openEditCourse: (course) => {
      setSelectedCourse(course);
      setIsEditCourseModalOpen(true);
    },
    openCreateCategory: (courseId) => {
      setSelectedCourseForCategory(courseId);
      setIsCreateCategoryModalOpen(true);
    },
    openEditCategory: (category) => {
      setSelectedCategory(category);
      setIsEditCategoryModalOpen(true);
    },
    openCreateLesson: (courseId, categoryId) => {
      setSelectedCourseForLesson(courseId);
      setSelectedCategoryForLesson(categoryId);
      setIsCreateLessonModalOpen(true);
    },
    openEditLesson: (lesson) => {
      setSelectedLesson(lesson);
      setIsEditLessonModalOpen(true);
    },
    openCreateQuiz: (courseId, category) => {
      setSelectedCourseForQuiz(courseId);
      setSelectedCategoryForQuiz(category);
      setIsCreateQuizModalOpen(true);
    },
    openEditQuiz: (courseId, quiz) => {
      setSelectedCourseForQuiz(courseId);
      setSelectedQuiz(quiz);
      setIsEditQuizModalOpen(true);
    },
    openDeleteQuiz: (courseId, quiz) => {
      setSelectedCourseForQuiz(courseId);
      setSelectedQuiz(quiz);
      setIsDeleteQuizModalOpen(true);
    },
    openManageQuestions: (courseId, quiz) => {
      setSelectedCourseForQuiz(courseId);
      setSelectedQuiz(quiz);
      setIsManageQuestionsModalOpen(true);
    },
    closeAllModals,
  };
}

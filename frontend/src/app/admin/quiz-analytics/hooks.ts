"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminCourseApi, courseApi } from "@/lib/api";
import { QuizAnalyticsOverview } from "@/types";

interface Course {
  id: number;
  name: string;
}

interface Quiz {
  id: number;
  name: string;
}

interface UseAnalyticsFiltersReturn {
  selectedCourseId: number | undefined;
  selectedQuizId: number | undefined;
  handleCourseChange: (courseId: number | undefined) => void;
  handleQuizChange: (quizId: number | undefined) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

/**
 * Manages filter state for course and quiz selection
 */
export function useAnalyticsFilters(): UseAnalyticsFiltersReturn {
  const [selectedCourseId, setSelectedCourseId] = useState<number | undefined>(
    undefined
  );
  const [selectedQuizId, setSelectedQuizId] = useState<number | undefined>(
    undefined
  );

  const handleCourseChange = (courseId: number | undefined) => {
    setSelectedCourseId(courseId);
    setSelectedQuizId(undefined); // Reset quiz when course changes
  };

  const handleQuizChange = (quizId: number | undefined) => {
    setSelectedQuizId(quizId);
  };

  const clearFilters = () => {
    setSelectedCourseId(undefined);
    setSelectedQuizId(undefined);
  };

  const hasActiveFilters =
    selectedCourseId !== undefined || selectedQuizId !== undefined;

  return {
    selectedCourseId,
    selectedQuizId,
    handleCourseChange,
    handleQuizChange,
    clearFilters,
    hasActiveFilters,
  };
}

/**
 * Fetches all courses for the filter dropdown
 */
export function useCourses() {
  return useQuery<Course[]>({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const response = await courseApi.getAll();
      return response.data.data;
    },
  });
}

/**
 * Fetches available quizzes for the dropdown (unfiltered by quiz selection)
 */
export function useAvailableQuizzes(courseId: number | undefined) {
  const query = useQuery<QuizAnalyticsOverview>({
    queryKey: ["quiz-analytics-quizzes", courseId],
    queryFn: async () => {
      const response = await adminCourseApi.getAnalyticsOverview(
        courseId,
        undefined
      );
      return response.data.data;
    },
  });

  const availableQuizzes: Quiz[] = query.data?.quizPerformance || [];

  return { ...query, availableQuizzes };
}

/**
 * Fetches filtered analytics data based on selected course and quiz
 */
export function useQuizAnalytics(
  courseId: number | undefined,
  quizId: number | undefined
) {
  return useQuery<QuizAnalyticsOverview>({
    queryKey: ["quiz-analytics", courseId, quizId],
    queryFn: async () => {
      const response = await adminCourseApi.getAnalyticsOverview(
        courseId,
        quizId
      );
      return response.data.data;
    },
  });
}

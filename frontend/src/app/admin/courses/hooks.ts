"use client";

import { useState, useEffect, useCallback } from "react";
import { adminCourseApi, adminUserApi } from "@/lib/api";
import { AdminCourse, Privilege } from "@/types";

interface UseCoursesReturn {
  courses: AdminCourse[];
  privileges: Privilege[];
  loading: boolean;
  error: string | null;
  refreshCourses: () => Promise<void>;
}

/**
 * Manages course data fetching
 */
export function useCourses(): UseCoursesReturn {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [privileges, setPrivileges] = useState<Privilege[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminCourseApi.getAll();
      setCourses(response.data.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPrivileges = async () => {
    try {
      const response = await adminUserApi.getPrivileges();
      setPrivileges(response.data.data);
    } catch (err) {
      console.error("Failed to fetch privileges:", err);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchPrivileges();
  }, [fetchCourses]);

  return {
    courses,
    privileges,
    loading,
    error,
    refreshCourses: fetchCourses,
  };
}

interface UseExpandedItemsReturn {
  expandedCourses: Set<number>;
  expandedCategories: Set<number>;
  toggleCourse: (courseId: number) => void;
  toggleCategory: (categoryId: number) => void;
}

/**
 * Manages expanded/collapsed state for courses and categories
 */
export function useExpandedItems(): UseExpandedItemsReturn {
  const [expandedCourses, setExpandedCourses] = useState<Set<number>>(
    new Set()
  );
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
    new Set()
  );

  const toggleCourse = (courseId: number) => {
    setExpandedCourses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  return {
    expandedCourses,
    expandedCategories,
    toggleCourse,
    toggleCategory,
  };
}

interface UseCourseActionsReturn {
  actionLoading: string | null;
  handleDeleteCourse: (
    courseId: number,
    onSuccess: () => void
  ) => Promise<void>;
  handleDeleteCategory: (
    categoryId: number,
    onSuccess: () => void
  ) => Promise<void>;
  handleDeleteLesson: (
    lessonId: number,
    onSuccess: () => void
  ) => Promise<void>;
  handleTogglePublish: (
    course: AdminCourse,
    onSuccess: () => void
  ) => Promise<void>;
}

/**
 * Manages course/category/lesson delete and publish actions
 */
export function useCourseActions(): UseCourseActionsReturn {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleDeleteCourse = async (
    courseId: number,
    onSuccess: () => void
  ) => {
    if (
      !confirm(
        "Are you sure you want to delete this course? This will also delete all categories and lessons."
      )
    ) {
      return;
    }

    try {
      setActionLoading(`course-${courseId}`);
      await adminCourseApi.delete(courseId);
      onSuccess();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || "Failed to delete course");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCategory = async (
    categoryId: number,
    onSuccess: () => void
  ) => {
    if (
      !confirm(
        "Are you sure you want to delete this category? This will also delete all lessons in it."
      )
    ) {
      return;
    }

    try {
      setActionLoading(`category-${categoryId}`);
      await adminCourseApi.deleteCategory(categoryId);
      onSuccess();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || "Failed to delete category");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteLesson = async (
    lessonId: number,
    onSuccess: () => void
  ) => {
    if (!confirm("Are you sure you want to delete this lesson?")) {
      return;
    }

    try {
      setActionLoading(`lesson-${lessonId}`);
      await adminCourseApi.deleteLesson(lessonId);
      onSuccess();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || "Failed to delete lesson");
    } finally {
      setActionLoading(null);
    }
  };

  const handleTogglePublish = async (
    course: AdminCourse,
    onSuccess: () => void
  ) => {
    try {
      setActionLoading(`publish-${course.id}`);
      await adminCourseApi.update(course.id, {
        isPublished: !course.isPublished,
      });
      onSuccess();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || "Failed to update course");
    } finally {
      setActionLoading(null);
    }
  };

  return {
    actionLoading,
    handleDeleteCourse,
    handleDeleteCategory,
    handleDeleteLesson,
    handleTogglePublish,
  };
}

/**
 * Hook for tracking and managing lesson progress
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { lessonApi } from "@/lib/api";

interface UseProgressTrackingOptions {
  lessonId: number;
  courseId: number;
  initialProgress?: number;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export function useProgressTracking({
  lessonId,
  courseId,
  initialProgress = 0,
  onComplete,
  onError,
}: UseProgressTrackingOptions) {
  const [currentProgress, setCurrentProgress] = useState(initialProgress);
  const [isCompleted, setIsCompleted] = useState(false);
  const lastSavedProgress = useRef(initialProgress);
  const queryClient = useQueryClient();

  // Progress update mutation
  const updateProgressMutation = useMutation({
    mutationFn: async ({
      watchedSeconds,
      completed,
    }: {
      watchedSeconds: number;
      completed?: boolean;
    }) => {
      return lessonApi.updateProgress(lessonId, {
        watchedSeconds,
        isCompleted: completed,
      });
    },
    onSuccess: (_, variables) => {
      lastSavedProgress.current = variables.watchedSeconds;
      if (variables.completed) {
        setIsCompleted(true);
        queryClient.invalidateQueries({ queryKey: ["course", courseId] });
        queryClient.invalidateQueries({ queryKey: ["lesson", lessonId] });
        onComplete?.();
      }
    },
    onError: (error: Error) => {
      console.error("Failed to update progress:", error);
      onError?.(error);
    },
  });

  // Update progress (debounced)
  const updateProgress = useCallback(
    (watchedSeconds: number, completed: boolean = false) => {
      setCurrentProgress(watchedSeconds);

      // Only update if significant change or completed
      if (
        completed ||
        Math.abs(watchedSeconds - lastSavedProgress.current) >= 3
      ) {
        updateProgressMutation.mutate({ watchedSeconds, completed });
      }
    },
    [updateProgressMutation]
  );

  // Mark as complete
  const markComplete = useCallback(
    (watchedSeconds?: number) => {
      const progress = watchedSeconds ?? currentProgress;
      updateProgressMutation.mutate({
        watchedSeconds: Math.floor(progress),
        completed: true,
      });
    },
    [currentProgress, updateProgressMutation]
  );

  return {
    currentProgress,
    isCompleted,
    updateProgress,
    markComplete,
    isUpdating: updateProgressMutation.isPending,
    error: updateProgressMutation.error,
  };
}

/**
 * Hook for managing course-wide progress
 */
interface UseCourseProgressOptions {
  courseId: number;
}

export function useCourseProgress({ courseId }: UseCourseProgressOptions) {
  const queryClient = useQueryClient();

  const refreshProgress = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["course", courseId] });
  }, [courseId, queryClient]);

  return {
    refreshProgress,
  };
}

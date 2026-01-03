"use client";

import { calculateProgress, formatDuration } from "@/lib/progressUtils";

interface ProgressBarProps {
  watchedSeconds: number;
  totalDuration: number;
  showTime?: boolean;
  showPercentage?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProgressBar({
  watchedSeconds,
  totalDuration,
  showTime = false,
  showPercentage = false,
  size = "md",
  className = "",
}: ProgressBarProps) {
  const percentage = calculateProgress(watchedSeconds, totalDuration);

  const heightClass = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  }[size];

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`w-full bg-gray-200 rounded-full ${heightClass} overflow-hidden`}
      >
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {(showTime || showPercentage) && (
        <div className="mt-1 flex justify-between text-xs text-gray-600">
          {showTime && (
            <>
              <span>{formatDuration(watchedSeconds)}</span>
              <span>{formatDuration(totalDuration)}</span>
            </>
          )}
          {showPercentage && !showTime && (
            <span className="ml-auto">{percentage}%</span>
          )}
        </div>
      )}
    </div>
  );
}

interface CompletionBadgeProps {
  isCompleted: boolean;
  size?: "sm" | "md" | "lg";
}

export function CompletionBadge({
  isCompleted,
  size = "md",
}: CompletionBadgeProps) {
  if (!isCompleted) return null;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2",
  }[size];

  const iconSize = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-green-100 font-bold text-green-700 ${sizeClasses}`}
    >
      <span className={`material-symbols-outlined ${iconSize}`}>
        check_circle
      </span>
      Completed
    </span>
  );
}

interface CourseProgressCardProps {
  completedLessons: number;
  totalLessons: number;
  className?: string;
}

export function CourseProgressCard({
  completedLessons,
  totalLessons,
  className = "",
}: CourseProgressCardProps) {
  const percentage =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-4 ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700">Your Progress</h3>
        <span className="text-sm font-bold text-blue-600">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden mb-2">
        <div
          className="h-full bg-blue-600 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-gray-600">
        {completedLessons} of {totalLessons} lessons completed
      </p>
    </div>
  );
}

interface LessonStatusIconProps {
  isCompleted: boolean;
  isInProgress: boolean;
  isLocked: boolean;
  isActive?: boolean;
}

export function LessonStatusIcon({
  isCompleted,
  isInProgress,
  isLocked,
  isActive = false,
}: LessonStatusIconProps) {
  if (isLocked) {
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-gray-400">
        <span className="material-symbols-outlined text-sm">lock</span>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white">
        <span className="material-symbols-outlined text-sm">check</span>
      </div>
    );
  }

  if (isActive) {
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
        <span className="material-symbols-outlined text-sm">play_arrow</span>
      </div>
    );
  }

  if (isInProgress) {
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-white">
        <span className="material-symbols-outlined text-sm">play_circle</span>
      </div>
    );
  }

  return (
    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-gray-600">
      <span className="material-symbols-outlined text-sm">play_circle</span>
    </div>
  );
}

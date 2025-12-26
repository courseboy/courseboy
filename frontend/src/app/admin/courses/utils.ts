/**
 * Utility functions for course management
 */

/**
 * Formats seconds into a human-readable duration (e.g., "1h 30m" or "45m")
 */
export function formatCourseDuration(seconds: number): string {
  if (!seconds) return "0m";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Formats lesson duration into MM:SS format
 */
export function formatLessonDuration(seconds: number | null): string {
  if (!seconds) return "--:--";
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Creates a unique action loading key for different entity types
 */
export function createActionKey(
  type: "course" | "category" | "lesson" | "publish",
  id: number
): string {
  return `${type}-${id}`;
}

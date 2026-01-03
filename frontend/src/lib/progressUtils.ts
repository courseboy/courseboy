/**
 * Format seconds to HH:MM:SS or MM:SS
 */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(
  watchedSeconds: number,
  totalDuration: number
): number {
  if (totalDuration <= 0) return 0;
  return Math.min(Math.round((watchedSeconds / totalDuration) * 100), 100);
}

/**
 * Determine if video is considered completed
 * Video is completed if watched >= 60% or marked as completed
 */
export function isVideoCompleted(
  watchedSeconds: number,
  totalDuration: number,
  markedCompleted: boolean = false
): boolean {
  if (markedCompleted) return true;
  if (totalDuration <= 0) return false;
  return watchedSeconds / totalDuration >= 0.6;
}

/**
 * Convert Google Drive URL to embeddable format
 */
export function getGoogleDriveEmbedUrl(url: string): string {
  // Handle various Google Drive URL formats
  const patterns = [
    /drive\.google\.com\/file\/d\/([^\/]+)/,
    /drive\.google\.com\/open\?id=([^&]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
  }

  return url; // Return original if no pattern matches
}

/**
 * Throttle function - limits how often a function can be called
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutId: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>) {
    const now = Date.now();

    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    } else {
      // Schedule for later
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        func(...args);
      }, delay - (now - lastCall));
    }
  };
}

/**
 * Debounce function - delays execution until after delay has passed since last call
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Calculate course completion statistics
 */
export interface CourseStats {
  totalLessons: number;
  completedLessons: number;
  percentage: number;
  totalDuration: number;
  watchedDuration: number;
}

export function calculateCourseStats(
  lessons: Array<{
    durationSeconds: number | null;
    userProgress?: {
      watchedSeconds: number;
      isCompleted: boolean;
    } | null;
  }>
): CourseStats {
  const stats: CourseStats = {
    totalLessons: lessons.length,
    completedLessons: 0,
    percentage: 0,
    totalDuration: 0,
    watchedDuration: 0,
  };

  lessons.forEach((lesson) => {
    const duration = lesson.durationSeconds || 0;
    stats.totalDuration += duration;

    if (lesson.userProgress) {
      stats.watchedDuration += lesson.userProgress.watchedSeconds;
      if (
        lesson.userProgress.isCompleted ||
        isVideoCompleted(
          lesson.userProgress.watchedSeconds,
          duration,
          lesson.userProgress.isCompleted
        )
      ) {
        stats.completedLessons++;
      }
    }
  });

  if (stats.totalLessons > 0) {
    stats.percentage = Math.round(
      (stats.completedLessons / stats.totalLessons) * 100
    );
  }

  return stats;
}

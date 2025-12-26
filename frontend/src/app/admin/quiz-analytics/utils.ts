/**
 * Utility functions for quiz analytics formatting
 */

/**
 * Formats seconds into a human-readable time string (e.g., "5m 30s")
 */
export function formatDuration(seconds: number | null): string {
  if (!seconds) return "-";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Formats a date string into a localized short format
 */
export function formatSubmissionDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Returns the appropriate color class based on score range
 */
export function getScoreRangeColor(range: string): string {
  const colorMap: Record<string, string> = {
    "81-100": "bg-green-500",
    "61-80": "bg-blue-500",
    "41-60": "bg-yellow-500",
    "21-40": "bg-orange-500",
    "0-20": "bg-red-500",
  };
  return colorMap[range] || "bg-gray-500";
}

/**
 * Returns status badge styling based on pass rate percentage
 */
export function getPassRateStyle(passRate: number): string {
  if (passRate >= 70) return "bg-green-100 text-green-700";
  if (passRate >= 50) return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
}

/**
 * Extracts display name from user object (username or email prefix)
 */
export function getUserDisplayName(user: {
  username?: string | null;
  email: string;
}): string {
  return user.username || user.email.split("@")[0];
}

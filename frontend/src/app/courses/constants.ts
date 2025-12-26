/**
 * Constants for course page configuration
 */

export const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-secondary",
  easy: "bg-secondary",
  new: "bg-accent",
  intermediate: "bg-primary",
  advanced: "bg-purple-500",
};

/**
 * Gets difficulty badge color for a given difficulty level
 */
export function getDifficultyColor(difficulty: string | undefined): string {
  const key = difficulty?.toLowerCase() || "beginner";
  return DIFFICULTY_COLORS[key] || DIFFICULTY_COLORS.beginner;
}

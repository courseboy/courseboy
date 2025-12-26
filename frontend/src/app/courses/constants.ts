/**
 * Constants for course page configuration
 */

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const CATEGORIES: Category[] = [
  { id: "all", name: "All Topics", icon: "grid_view", color: "text-white" },
  {
    id: "health",
    name: "Health",
    icon: "self_improvement",
    color: "text-secondary",
  },
  {
    id: "technology",
    name: "Technology",
    icon: "smartphone",
    color: "text-primary",
  },
  { id: "hobbies", name: "Hobbies", icon: "palette", color: "text-accent" },
  { id: "cooking", name: "Cooking", icon: "restaurant", color: "text-red-400" },
];

export const CATEGORY_STYLES: Record<string, { text: string; icon: string }> = {
  health: { text: "text-secondary", icon: "self_improvement" },
  technology: { text: "text-primary", icon: "smartphone" },
  hobbies: { text: "text-accent", icon: "palette" },
  cooking: { text: "text-red-400", icon: "restaurant" },
};

export const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-secondary",
  easy: "bg-secondary",
  new: "bg-accent",
  intermediate: "bg-primary",
  advanced: "bg-purple-500",
};

/**
 * Gets category style for a given category name
 */
export function getCategoryStyle(category: string | undefined) {
  const key = category?.toLowerCase() || "technology";
  return CATEGORY_STYLES[key] || CATEGORY_STYLES.technology;
}

/**
 * Gets difficulty badge color for a given difficulty level
 */
export function getDifficultyColor(difficulty: string | undefined): string {
  const key = difficulty?.toLowerCase() || "beginner";
  return DIFFICULTY_COLORS[key] || DIFFICULTY_COLORS.beginner;
}

/**
 * Utility functions for user management
 */
import { AdminUser } from "@/types";

/**
 * Maps privilege names to their badge styles
 */
const PRIVILEGE_BADGE_STYLES: Record<string, string> = {
  Admin: "bg-[#3A7BD5]/10 text-[#3A7BD5]",
  Instructor: "bg-[#7BC8A4]/15 text-[#7BC8A4]",
  Manager: "bg-[#F4A261]/15 text-[#F4A261]",
};

const DEFAULT_BADGE_STYLE = "bg-slate-100 text-slate-600";

/**
 * Returns the appropriate badge style for a privilege
 */
export function getPrivilegeBadgeStyle(privilege: string): string {
  return PRIVILEGE_BADGE_STYLES[privilege] || DEFAULT_BADGE_STYLE;
}

/**
 * Extracts user initials from username or email
 */
export function getUserInitials(user: AdminUser): string {
  if (user.username) {
    return user.username
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return user.email.slice(0, 2).toUpperCase();
}

"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore, useAuthHydration } from "@/lib/store/auth";
import { Spinner } from "@/components/ui/spinner";

const sidebarLinks = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: "dashboard",
  },
  {
    name: "User Management",
    href: "/admin/users",
    icon: "group",
  },
  {
    name: "Courses",
    href: "/admin/courses",
    icon: "book_2",
  },
  {
    name: "Quiz Analytics",
    href: "/admin/quiz-analytics",
    icon: "analytics",
  },
  {
    name: "Privileges",
    href: "/admin/privileges",
    icon: "verified_user",
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const isHydrated = useAuthHydration();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isHydrated) {
      // Check if user is authenticated and has Admin privilege
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }

      if (!user?.roles?.includes("Admin")) {
        router.push("/");
        return;
      }
    }
  }, [isHydrated, isAuthenticated, user, router]);

  if (!isHydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !user?.roles?.includes("Admin")) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
        <Spinner size="lg" />
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const isActiveLink = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F8FAFC]">
      {/* Side Navigation - Desktop */}
      <aside className="hidden md:flex w-72 bg-white h-full border-r border-slate-200 flex-col justify-between shrink-0">
        <div className="flex flex-col">
          {/* Logo Area */}
          <div className="h-20 flex items-center px-8 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-[#3A7BD5] flex items-center justify-center text-white">
                <span className="material-symbols-outlined">school</span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-[#1F2933] text-lg font-bold leading-tight">
                  CoursePanel
                </h1>
                <p className="text-[#6B7280] text-xs font-medium">
                  Admin Portal
                </p>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <div className="flex flex-col gap-2 p-4">
            <p className="px-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2 mt-2">
              Main Menu
            </p>
            {sidebarLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActiveLink(link.href)
                    ? "bg-[#3A7BD5]/10 text-[#3A7BD5]"
                    : "text-[#6B7280] hover:bg-[#EEF2F7] group"
                }`}
              >
                <span
                  className={`material-symbols-outlined ${
                    isActiveLink(link.href)
                      ? "fill-1"
                      : "group-hover:text-[#3A7BD5] transition-colors"
                  }`}
                >
                  {link.icon}
                </span>
                <span
                  className={`text-sm ${
                    isActiveLink(link.href) ? "font-bold" : "font-medium"
                  }`}
                >
                  {link.name}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-100">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#6B7280] hover:bg-[#EEF2F7] transition-colors group"
          >
            <span className="material-symbols-outlined group-hover:text-[#1F2933]">
              home
            </span>
            <span className="text-sm font-medium">Back to Site</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors mt-1"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm font-medium">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <div className="md:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-[#3A7BD5] flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[20px]">
                school
              </span>
            </div>
            <span className="font-bold text-[#1F2933]">CoursePanel</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-[#1F2933]"
          >
            <span className="material-symbols-outlined">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute inset-0 top-16 bg-white z-50 p-4">
            <div className="flex flex-col gap-2">
              {sidebarLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActiveLink(link.href)
                      ? "bg-[#3A7BD5]/10 text-[#3A7BD5]"
                      : "text-[#6B7280] hover:bg-[#EEF2F7]"
                  }`}
                >
                  <span className="material-symbols-outlined">{link.icon}</span>
                  <span
                    className={`text-sm ${
                      isActiveLink(link.href) ? "font-bold" : "font-medium"
                    }`}
                  >
                    {link.name}
                  </span>
                </Link>
              ))}
              <hr className="my-2" />
              <Link
                href="/"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#6B7280] hover:bg-[#EEF2F7] transition-colors"
              >
                <span className="material-symbols-outlined">home</span>
                <span className="text-sm font-medium">Back to Site</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
              >
                <span className="material-symbols-outlined">logout</span>
                <span className="text-sm font-medium">Log Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10">{children}</div>
      </main>
    </div>
  );
}

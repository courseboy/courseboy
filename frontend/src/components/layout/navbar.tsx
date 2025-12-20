"use client";

import Link from "next/link";
import { useAuthStore, useAuthHydration } from "@/lib/store/auth";
import { useState } from "react";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const hydrated = useAuthHydration();

  // Don't render auth-dependent UI until hydrated to prevent mismatch
  const showAuthenticated = hydrated && isAuthenticated;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex h-20 max-w-[1280px] items-center justify-between px-6 lg:px-10">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-3xl">school</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-text-main">
            SeniorLearn
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className="text-lg font-medium text-text-main transition-colors hover:text-primary"
          >
            Home
          </Link>
          <Link
            href="/courses"
            className="text-lg font-medium text-text-secondary transition-colors hover:text-primary"
          >
            All Courses
          </Link>
          <Link
            href="/help"
            className="text-lg font-medium text-text-secondary transition-colors hover:text-primary"
          >
            Help
          </Link>
        </div>

        {/* Right side buttons */}
        <div className="flex items-center gap-4">
          {showAuthenticated ? (
            <>
              {user?.roles?.includes("Admin") && (
                <Link
                  href="/admin"
                  className="hidden items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 md:flex"
                >
                  <span className="material-symbols-outlined text-lg">
                    admin_panel_settings
                  </span>
                  Admin
                </Link>
              )}
              <Link
                href="/my-courses"
                className="flex h-12 items-center justify-center rounded-xl bg-primary px-6 text-lg font-bold text-white shadow-md transition-transform hover:scale-105 hover:bg-primary-hover"
              >
                My Courses
              </Link>
              <button
                onClick={logout}
                className="hidden items-center gap-2 text-lg font-medium text-text-secondary transition-colors hover:text-primary md:flex"
              >
                <span className="material-symbols-outlined">logout</span>
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="flex h-12 items-center justify-center rounded-xl bg-primary px-6 text-lg font-bold text-white shadow-md transition-transform hover:scale-105 hover:bg-primary-hover"
            >
              Login
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            className="flex size-12 items-center justify-center rounded-full text-text-main hover:bg-gray-100 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="material-symbols-outlined text-3xl">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white md:hidden">
          <div className="flex flex-col gap-2 px-6 py-4">
            <Link
              href="/"
              className="rounded-lg px-4 py-3 text-lg font-medium text-text-main hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/courses"
              className="rounded-lg px-4 py-3 text-lg font-medium text-text-secondary hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              All Courses
            </Link>
            <Link
              href="/help"
              className="rounded-lg px-4 py-3 text-lg font-medium text-text-secondary hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              Help
            </Link>
            {showAuthenticated ? (
              <>
                {user?.roles?.includes("Admin") && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-3 text-lg font-medium text-slate-700 hover:bg-slate-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="material-symbols-outlined">
                      admin_panel_settings
                    </span>
                    Admin Panel
                  </Link>
                )}
                <Link
                  href="/my-courses"
                  className="rounded-lg px-4 py-3 text-lg font-medium text-text-secondary hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Courses
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="rounded-lg px-4 py-3 text-left text-lg font-medium text-red-600 hover:bg-gray-100"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="mt-2 flex h-12 items-center justify-center rounded-xl bg-primary text-lg font-bold text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

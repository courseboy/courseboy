"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/store/auth";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <nav className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-primary-600">
          CourseBoy
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/courses"
            className="text-secondary-600 hover:text-primary-600"
          >
            Courses
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className="text-secondary-600 hover:text-primary-600"
              >
                Dashboard
              </Link>
              <div className="flex items-center gap-4">
                <span className="text-sm text-secondary-600">
                  {user?.username || user?.email}
                </span>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register">
                <Button>Sign Up</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t bg-white md:hidden">
          <div className="container py-4">
            <div className="flex flex-col gap-4">
              <Link
                href="/courses"
                className="text-secondary-600 hover:text-primary-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Courses
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-secondary-600 hover:text-primary-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button className="w-full">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store/auth";
import { userApi } from "@/lib/api";
import { LoadingScreen } from "@/components/ui/spinner";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const { data: progressData, isLoading } = useQuery({
    queryKey: ["userProgress"],
    queryFn: async () => {
      const response = await userApi.getProgress();
      return response.data.data;
    },
    enabled: isAuthenticated,
  });

  if (!isAuthenticated || isLoading) {
    return <LoadingScreen />;
  }

  const progress = progressData || [];

  return (
    <div className="w-full bg-background-light py-12 lg:py-16">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        {/* Welcome Header */}
        <div className="mb-10">
          <span className="mb-2 inline-flex items-center gap-2 rounded-full bg-secondary/20 px-4 py-2 text-base font-bold text-teal-700">
            <span className="material-symbols-outlined">waving_hand</span>
            Welcome back!
          </span>
          <h1 className="text-3xl font-bold text-text-main sm:text-4xl">
            Hello, {user?.username || "Learner"}!
          </h1>
          <p className="mt-2 text-xl text-text-secondary">
            Track your learning progress and continue where you left off.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon="menu_book"
            title="Courses in Progress"
            value={progress.length.toString()}
            color="primary"
          />
          <StatCard
            icon="schedule"
            title="Total Watch Time"
            value={formatWatchTime(
              progress.reduce(
                (sum: number, p: any) => sum + p.totalWatchedSeconds,
                0
              )
            )}
            color="blue"
          />
          <StatCard
            icon="trending_up"
            title="Lessons Completed"
            value={progress
              .reduce((sum: number, p: any) => sum + p.completedLessons, 0)
              .toString()}
            color="green"
          />
          <StatCard
            icon="workspace_premium"
            title="Certificates Earned"
            value="0"
            color="yellow"
          />
        </div>

        {/* Continue Learning */}
        <section>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-bold text-text-main sm:text-3xl">
              Continue Learning
            </h2>
            <Link
              href="/courses"
              className="flex h-12 items-center justify-center rounded-xl border-2 border-primary/20 bg-white px-6 text-lg font-bold text-primary transition-colors hover:bg-primary/5"
            >
              Browse All Courses
            </Link>
          </div>

          {progress.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center shadow-md">
              <span className="material-symbols-outlined text-6xl text-text-secondary">
                school
              </span>
              <h3 className="mt-4 text-2xl font-bold text-text-main">
                No courses yet
              </h3>
              <p className="mt-2 text-lg text-text-secondary">
                Start learning by enrolling in a course
              </p>
              <Link
                href="/courses"
                className="mt-6 inline-flex h-14 items-center justify-center rounded-xl bg-primary px-8 text-xl font-bold text-white shadow-lg transition-transform hover:-translate-y-1 hover:bg-primary-hover"
              >
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {progress.map((course: any) => (
                <article
                  key={course.courseId}
                  className="group overflow-hidden rounded-2xl bg-white p-6 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
                >
                  <h3 className="mb-4 text-xl font-bold text-text-main">
                    {course.courseName}
                  </h3>
                  <div className="mb-4">
                    <div className="flex justify-between text-base">
                      <span className="text-text-secondary">Progress</span>
                      <span className="font-medium text-text-main">
                        {course.completedLessons} lessons completed
                      </span>
                    </div>
                    <div className="mt-2 h-3 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: "30%" }}
                      />
                    </div>
                  </div>
                  <Link
                    href={`/courses/${course.courseId}`}
                    className="flex w-full items-center justify-center rounded-xl border-2 border-primary/10 bg-primary/5 py-3 text-lg font-bold text-primary transition-colors hover:bg-primary hover:text-white"
                  >
                    Continue
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  color,
}: {
  icon: string;
  title: string;
  value: string;
  color: "primary" | "blue" | "green" | "yellow";
}) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
  };

  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-md">
      <div className={`rounded-xl p-4 ${colorClasses[color]}`}>
        <span className="material-symbols-outlined text-3xl">{icon}</span>
      </div>
      <div>
        <p className="text-base text-text-secondary">{title}</p>
        <p className="text-3xl font-bold text-text-main">{value}</p>
      </div>
    </div>
  );
}

function formatWatchTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore, useAuthHydration } from "@/lib/store/auth";
import { userApi } from "@/lib/api";
import { LoadingScreen } from "@/components/ui/spinner";
import Link from "next/link";

type FilterType = "all" | "in-progress" | "completed";

interface CourseProgress {
  courseId: number;
  courseName: string;
  coverImg?: string;
  description?: string;
  completedLessons: number;
  totalLessons: number;
  totalWatchedSeconds: number;
  percentage: number;
  isNew?: boolean;
}

export default function MyCoursesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const hydrated = useAuthHydration();
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    // Only redirect after hydration is complete
    if (hydrated && !isAuthenticated) {
      router.push("/login");
    }
  }, [hydrated, isAuthenticated, router]);

  const { data: progressData, isLoading } = useQuery({
    queryKey: ["userProgress"],
    queryFn: async () => {
      const response = await userApi.getProgress();
      return response.data.data;
    },
    enabled: hydrated && isAuthenticated,
  });

  if (!hydrated || !isAuthenticated || isLoading) {
    return <LoadingScreen />;
  }

  const courses: CourseProgress[] = progressData || [];

  // Filter courses based on selected filter
  const filteredCourses = courses.filter((course) => {
    if (filter === "all") return true;
    if (filter === "in-progress")
      return course.percentage > 0 && course.percentage < 100;
    if (filter === "completed") return course.percentage === 100;
    return true;
  });

  const getStatus = (percentage: number) => {
    if (percentage === 100) return "completed";
    if (percentage > 0) return "in-progress";
    return "not-started";
  };

  return (
    <div className="min-h-screen w-full bg-background-light">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-10">
        {/* Page Header */}
        <section className="mb-10">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-black tracking-tight text-text-main md:text-4xl">
              My Courses
            </h2>
            <p className="text-lg text-text-secondary">
              Welcome back! Select a course to continue learning.
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="mb-10">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setFilter("all")}
              className={`flex items-center justify-center gap-2 rounded-full px-6 py-3 text-lg font-medium shadow-md transition-transform hover:scale-105 ${
                filter === "all"
                  ? "bg-primary text-white"
                  : "border border-gray-300 bg-white text-text-secondary hover:bg-section-bg"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                grid_view
              </span>
              <span>All</span>
            </button>
            <button
              onClick={() => setFilter("in-progress")}
              className={`flex items-center justify-center gap-2 rounded-full px-6 py-3 text-lg font-medium transition-colors ${
                filter === "in-progress"
                  ? "bg-primary text-white shadow-md"
                  : "border border-gray-300 bg-white text-text-secondary hover:bg-section-bg"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                play_circle
              </span>
              <span>In Progress</span>
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`flex items-center justify-center gap-2 rounded-full px-6 py-3 text-lg font-medium transition-colors ${
                filter === "completed"
                  ? "bg-primary text-white shadow-md"
                  : "border border-gray-300 bg-white text-text-secondary hover:bg-section-bg"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                check_circle
              </span>
              <span>Completed</span>
            </button>
          </div>
        </section>

        {/* Course Grid */}
        <section className="pb-20">
          {filteredCourses.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center shadow-md">
              <span className="material-symbols-outlined text-6xl text-text-secondary">
                school
              </span>
              <h3 className="mt-4 text-2xl font-bold text-text-main">
                {filter === "all"
                  ? "No courses yet"
                  : filter === "in-progress"
                  ? "No courses in progress"
                  : "No completed courses"}
              </h3>
              <p className="mt-2 text-lg text-text-secondary">
                {filter === "all"
                  ? "Start learning by enrolling in a course"
                  : "Check back when you start learning!"}
              </p>
              <Link
                href="/courses"
                className="mt-6 inline-flex h-14 items-center justify-center rounded-xl bg-primary px-8 text-xl font-bold text-white shadow-lg transition-transform hover:-translate-y-1 hover:bg-blue-600"
              >
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.courseId}
                  course={course}
                  status={getStatus(course.percentage)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function CourseCard({
  course,
  status,
}: {
  course: CourseProgress;
  status: "in-progress" | "completed" | "not-started";
}) {
  const progressColor =
    status === "completed"
      ? "bg-secondary"
      : status === "in-progress"
      ? "bg-primary"
      : "bg-slate-200";

  const progressTextColor =
    status === "completed"
      ? "text-secondary"
      : status === "in-progress"
      ? "text-primary"
      : "text-text-secondary";

  // Default placeholder images for courses without cover images
  const placeholderImages = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCleI_MhIBjcZSHKcuW7Qp431Bd2L6okEC8UEmpasnrcKyMSv4GIHghnsld4uX4Q_4AJIuivHGr88XfQ_i_l1uWMkhGPizoRqDMawjiGpaxAStU8jkxI7FWQ_nrJwpMDEig8xJgaqVd18DXdfDXWbEOnGSDsgP7o4PdZZd0hM1LwLUHd6stTJg5jmi_hqyHXS_v2xMjvkikU1XZ3pbWBdd8YaIleLyFlPcc8TcSwrrOr2Wi9buxzUw2kvKPipu_knbqXe7cz62oSsUx",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCykctezqFymuEiXYNHR3ST3V1D_9AAuneAiJE9Etg8CMFeCJV6qHv9NwwVp4JTwzKuFb1BASu8FV_WFFWN16NUB_yC68LtCMMkNgW_zHo_-5Rd4IF-RhMW9oskgqupmpJdUV9In0-b-vu9GckX7wCW6BA2f1zqKjtwlRtW6uOKHTxoMQZOW2-bsSlcM25fqMaF-F4dzVEzTrdbGA2KrWtjIaqBn_4sQhqHg1NjfdDWxLLVpft_dEeSMLI_3ZqB-wCUimiukgxLd6YF",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuB2ZA4-J9kfT1mIvVc_54DnhBXrTnSIkiJMcRIm76XMtDD4qwtjw2xxEm4HlZqXiVMMRlz_5nVNP7T7InKc5jNjssTytUmuRG2_Sjtt-LirTEuS_ikavu15QbkzI-A1tQ5YGUJs5oxgsVR2OaS7Hba5ZgyE5PDMvOf4YDj5ABdocvkT_SmjnvzPIJFpVUXVzC5a0YkGTdlWVR7VP6qHjdsBnn97amIzxs-8rb9pUCNSdooVgW_2ek8mH2INOIwre6P9CPm3zktiALns",
  ];

  const coverImage =
    course.coverImg ||
    placeholderImages[course.courseId % placeholderImages.length];

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg ${
        status === "completed" ? "opacity-90" : ""
      }`}
    >
      {/* Image Section */}
      <div className="relative h-56 w-full overflow-hidden">
        {/* Cover Image */}
        <div
          className="h-full w-full bg-cover bg-center"
          style={{ backgroundImage: `url('${coverImage}')` }}
        />

        {/* Completed Overlay */}
        {status === "completed" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="material-symbols-outlined text-6xl text-white drop-shadow-lg">
              check_circle
            </span>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute right-4 top-4">
          {status === "in-progress" && (
            <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-bold text-primary shadow-sm backdrop-blur-sm">
              In Progress
            </span>
          )}
          {status === "completed" && (
            <span className="rounded-full bg-secondary px-3 py-1 text-sm font-bold text-white shadow-sm">
              Completed
            </span>
          )}
          {status === "not-started" && course.isNew && (
            <span className="rounded-full bg-accent px-3 py-1 text-sm font-bold text-white shadow-sm">
              New
            </span>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col bg-section-bg p-6">
        <div className="mb-4">
          <h3 className="mb-2 line-clamp-2 text-2xl font-bold leading-tight text-text-main transition-colors group-hover:text-primary">
            {course.courseName}
          </h3>
          <p className="line-clamp-2 text-base text-text-secondary">
            {course.description ||
              "Continue your learning journey with this course."}
          </p>
        </div>

        {/* Progress Section */}
        <div className="mt-auto border-t border-slate-200 pt-4">
          <div className="mb-2 flex items-end justify-between">
            <span className="text-sm font-semibold text-text-main">
              Progress
            </span>
            <span className={`text-lg font-bold ${progressTextColor}`}>
              {course.percentage}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mb-6 h-3 w-full rounded-full border border-slate-100 bg-white shadow-inner">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${progressColor}`}
              style={{ width: `${course.percentage}%` }}
            />
          </div>

          {/* Action Button */}
          {status === "in-progress" && (
            <Link
              href={`/courses/${course.courseId}/learn`}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-lg font-bold text-white shadow-md transition-colors hover:bg-blue-600"
            >
              <span className="material-symbols-outlined">play_arrow</span>
              Continue
            </Link>
          )}

          {status === "not-started" && (
            <Link
              href={`/courses/${course.courseId}/learn`}
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-primary bg-white py-3 text-lg font-bold text-primary shadow-sm transition-colors hover:bg-primary hover:text-white"
            >
              <span className="material-symbols-outlined">school</span>
              Start Learning
            </Link>
          )}

          {status === "completed" && (
            <Link
              href={`/courses/${course.courseId}/learn`}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white py-3 text-lg font-medium text-text-main shadow-sm transition-colors hover:bg-slate-50"
            >
              <span className="material-symbols-outlined">replay</span>
              Review Course
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

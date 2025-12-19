"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { courseApi } from "@/lib/api";
import { LoadingScreen } from "@/components/ui/spinner";

interface Course {
  id: number;
  name: string;
  description: string;
  coverImg: string;
  requiredRole: string;
  lessonsCount: number;
  averageRating: number;
  feedbacksCount: number;
}

const roleColors: Record<string, string> = {
  Member: "bg-blue-100 text-blue-700",
  VIP: "bg-purple-100 text-purple-700",
  SuperVIP: "bg-yellow-100 text-yellow-700",
};

export default function CoursesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const response = await courseApi.getAll(1, 20);
      return response.data;
    },
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-[1280px] px-6 py-12 text-center lg:px-10">
        <div className="rounded-2xl bg-red-50 p-8">
          <span className="material-symbols-outlined text-5xl text-red-500">
            error
          </span>
          <p className="mt-4 text-xl text-red-600">
            Failed to load courses. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const courses: Course[] = data?.data || [];

  return (
    <div className="w-full bg-background-light py-12 lg:py-16">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-text-main sm:text-4xl">
            All Courses
          </h1>
          <p className="mt-2 text-xl text-text-secondary">
            Explore our collection of easy-to-follow courses designed for you
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-md">
            <span className="material-symbols-outlined text-6xl text-text-secondary">
              school
            </span>
            <h3 className="mt-4 text-2xl font-bold text-text-main">
              No courses available yet
            </h3>
            <p className="mt-2 text-lg text-text-secondary">
              Check back later for new courses
            </p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CourseCard({ course }: { course: Course }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-all hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-video w-full bg-gray-200">
        {course.coverImg ? (
          <Image
            src={course.coverImg}
            alt={course.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
            <span className="material-symbols-outlined text-5xl text-primary">
              play_circle
            </span>
          </div>
        )}
        {course.requiredRole && course.requiredRole !== "Member" && (
          <span
            className={`absolute right-3 top-3 rounded-full px-3 py-1 text-sm font-bold ${
              roleColors[course.requiredRole] || "bg-gray-100 text-gray-700"
            }`}
          >
            {course.requiredRole}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-center gap-3">
          <span className="flex items-center gap-1 text-lg text-text-secondary">
            <span className="material-symbols-outlined text-xl">menu_book</span>
            {course.lessonsCount} lessons
          </span>
          {course.averageRating > 0 && (
            <div className="flex items-center gap-1 text-yellow-500">
              <span className="material-symbols-outlined text-lg">star</span>
              <span className="text-sm font-bold text-text-main">
                {course.averageRating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
        <h3 className="mb-2 text-2xl font-bold text-text-main transition-colors group-hover:text-primary">
          {course.name}
        </h3>
        <p className="mb-6 flex-1 text-lg leading-normal text-text-secondary line-clamp-2">
          {course.description}
        </p>
        <Link
          href={`/courses/${course.id}`}
          className="w-full rounded-xl border-2 border-primary/10 bg-primary/5 py-3 text-center text-lg font-bold text-primary transition-colors hover:bg-primary hover:text-white"
        >
          View Course
        </Link>
      </div>
    </article>
  );
}

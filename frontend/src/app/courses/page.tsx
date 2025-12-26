"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { courseApi } from "@/lib/api";
import { LoadingScreen } from "@/components/ui/spinner";
import { CourseCard, EmptyState, SearchBar } from "./components";

interface Course {
  id: number;
  name: string;
  description: string;
  coverImg: string;
  requiredRole: string;
  lessonsCount: number;
  averageRating: number;
  feedbacksCount: number;
  category?: string;
  duration?: string;
  difficulty?: string;
  totalDurationSeconds?: number;
}

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("");

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
      <div className="mx-auto max-w-[1280px] px-6 py-12 text-center">
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

  // Filter courses based on search
  const filteredCourses = courses.filter((course) => {
    return (
      searchQuery === "" ||
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen w-full bg-background-light">
      <div className="mx-auto max-w-[1280px] px-6 py-10">
        {/* Hero & Search Section */}
        <section className="mb-12 flex flex-col items-center text-center">
          <h2 className="mb-6 text-3xl font-bold leading-tight tracking-tight text-text-main md:text-5xl">
            What would you like to <span className="text-primary">learn</span>{" "}
            today?
          </h2>
          <p className="mb-8 max-w-2xl text-lg text-text-secondary md:text-xl">
            Explore easy-to-follow courses designed specially for you.
          </p>
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </section>

        {/* Course Grid */}
        <section>
          {filteredCourses.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

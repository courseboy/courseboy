"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
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
  category?: string;
  duration?: string;
  difficulty?: string;
}

const categories = [
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

const categoryColors: Record<string, { text: string; icon: string }> = {
  health: { text: "text-secondary", icon: "self_improvement" },
  technology: { text: "text-primary", icon: "smartphone" },
  hobbies: { text: "text-accent", icon: "palette" },
  cooking: { text: "text-red-400", icon: "restaurant" },
};

const difficultyColors: Record<string, string> = {
  beginner: "bg-secondary",
  easy: "bg-secondary",
  new: "bg-accent",
  intermediate: "bg-primary",
  advanced: "bg-purple-500",
};

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

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

  // Filter courses based on search and category
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      searchQuery === "" ||
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "all" ||
      course.category?.toLowerCase() === activeCategory;
    return matchesSearch && matchesCategory;
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

          {/* Search Bar */}
          <div className="w-full max-w-2xl">
            <div className="relative flex h-16 w-full items-center rounded-xl bg-white shadow-lg ring-primary/20 transition-shadow focus-within:ring-4">
              <div className="grid h-full w-16 place-items-center text-gray-400">
                <span className="material-symbols-outlined text-[28px]">
                  search
                </span>
              </div>
              <input
                type="text"
                placeholder="Type here to find a course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-full w-full bg-transparent pr-4 text-lg text-text-main outline-none placeholder:text-gray-400"
              />
              <button className="mr-2 h-12 rounded-lg bg-primary px-8 text-lg font-medium text-white transition-colors hover:bg-blue-600">
                Search
              </button>
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="mb-12">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 rounded-full px-6 py-3 text-lg font-medium shadow-md ring-2 ring-transparent transition-all active:scale-95 focus:ring-primary ${
                  activeCategory === category.id
                    ? "bg-text-main text-white"
                    : "bg-section-bg text-text-main hover:bg-gray-200"
                }`}
              >
                <span
                  className={`material-symbols-outlined ${
                    activeCategory === category.id
                      ? "text-white"
                      : category.color
                  }`}
                >
                  {category.icon}
                </span>
                {category.name}
              </button>
            ))}
          </div>
        </section>

        {/* Course Grid */}
        <section>
          {filteredCourses.length === 0 ? (
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

function CourseCard({ course }: { course: Course }) {
  const category = course.category?.toLowerCase() || "technology";
  const categoryStyle = categoryColors[category] || categoryColors.technology;
  const difficulty = course.difficulty?.toLowerCase() || "beginner";
  const difficultyColor =
    difficultyColors[difficulty] || difficultyColors.beginner;
  const duration = course.duration || `${course.lessonsCount * 15} mins`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-xl">
      {/* Image Section */}
      <div className="relative h-56 overflow-hidden">
        {/* Difficulty Badge */}
        <div className="absolute left-4 top-4 z-10">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold text-white shadow-sm ${difficultyColor}`}
          >
            {course.difficulty || "Beginner"}
          </span>
        </div>

        {course.coverImg ? (
          <Image
            src={course.coverImg}
            alt={course.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className="h-full w-full bg-gray-200"
            style={{
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAy8B4rcipD3cyhNP_LyPibeKalOd8PU4CqSpkbKMQbHPFt-qXJ0McmfG-EAsIsZv6Dabrd5pm48xxImZ9eqKQffW7bVW5y09aLhDaRVlvAPrLqqJKjrzM9Yd5GYnzPqiGSEBYTsz7Ll0n62i8slpZp2tlhKjggc0gKhZ1Mt2XAV_wvJyj2_2V5YSBaga1v1D6EpiXB4ByPSgPbljBH2q8tXI8SDPu2saZqTLbMM57xcB2EiObnXMGYnxDxzag4zLh1H4Gllr_B87Uh')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-6">
        {/* Category */}
        <div
          className={`mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider ${categoryStyle.text}`}
        >
          <span className="material-symbols-outlined text-lg">
            {categoryStyle.icon}
          </span>
          {course.category || "Technology"}
        </div>

        {/* Title */}
        <h3 className="mb-3 text-2xl font-bold leading-snug text-text-main transition-colors group-hover:text-primary">
          {course.name}
        </h3>

        {/* Description */}
        <p className="mb-6 flex-grow text-lg leading-relaxed text-text-secondary line-clamp-2">
          {course.description}
        </p>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
          <span className="flex items-center gap-1 text-sm font-medium text-text-secondary">
            <span className="material-symbols-outlined text-lg">schedule</span>
            {duration}
          </span>
          <Link
            href={`/courses/${course.id}`}
            className="rounded-lg bg-primary px-6 py-2.5 font-bold text-white transition-colors hover:bg-blue-600"
          >
            Start Learning
          </Link>
        </div>
      </div>
    </article>
  );
}

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { courseApi } from "@/lib/api";
import { LoadingScreen } from "@/components/ui/spinner";
import { formatDuration } from "@/lib/utils";

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = parseInt(params.id as string);
  const [openCategories, setOpenCategories] = useState<Set<number>>(new Set());

  const toggleCategory = (categoryId: number) => {
    setOpenCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const response = await courseApi.getById(courseId);
      // Open first category by default
      if (response.data.data?.categories?.[0]) {
        setOpenCategories(new Set([response.data.data.categories[0].id]));
      }
      return response.data.data;
    },
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-12 text-center sm:px-6 lg:px-8">
        <div className="rounded-xl bg-white p-12 shadow-md">
          <span className="material-symbols-outlined text-6xl text-red-500">
            error
          </span>
          <p className="mt-4 text-xl text-red-600">
            Course not found or failed to load.
          </p>
          <Link
            href="/courses"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-lg bg-primary px-6 text-lg font-bold text-white shadow-lg transition-colors hover:bg-primary-hover"
          >
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const course = data;
  const totalLessons =
    course.categories?.reduce(
      (sum: number, cat: any) => sum + cat.lessons.length,
      0
    ) || 0;
  const totalDurationSeconds =
    course.categories?.reduce(
      (sum: number, cat: any) =>
        sum +
        cat.lessons.reduce(
          (lessonSum: number, lesson: any) =>
            lessonSum + (lesson.durationSeconds || 0),
          0
        ),
      0
    ) || 0;

  return (
    <main className="min-h-screen bg-background-light">
      {/* Breadcrumbs */}
      <div className="mx-auto max-w-[1200px] px-4 pt-8 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link
                href="/"
                className="text-lg text-text-secondary hover:text-primary"
              >
                Home
              </Link>
            </li>
            <li>
              <span className="text-lg text-text-secondary">/</span>
            </li>
            <li>
              <Link
                href="/courses"
                className="text-lg text-text-secondary hover:text-primary"
              >
                Courses
              </Link>
            </li>
            <li>
              <span className="text-lg text-text-secondary">/</span>
            </li>
            <li
              aria-current="page"
              className="text-lg font-medium text-primary"
            >
              {course.name}
            </li>
          </ol>
        </nav>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Left Column: Content */}
          <div className="flex flex-col gap-10 lg:col-span-2">
            {/* Video/Image Hero */}
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-lg">
              {course.coverImg ? (
                <Image
                  src={course.coverImg}
                  alt={course.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-800">
                  <span className="material-symbols-outlined text-6xl text-white/50">
                    image
                  </span>
                </div>
              )}
            </div>

            {/* Course Title & Basic Info */}
            <div className="flex flex-col gap-4">
              <h1 className="text-xl font-extrabold leading-tight text-text-main sm:text-2xl md:text-3xl">
                {course.name}
              </h1>
              <p className="text-base leading-relaxed text-text-secondary">
                {course.description}
              </p>

              {/* Progress Bar */}
              {course.userProgress && (
                <div className="mt-4 rounded-lg bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between text-base">
                    <span className="font-medium text-text-main">
                      Your Progress
                    </span>
                    <span className="font-bold text-primary">
                      {course.userProgress.percentage}%
                    </span>
                  </div>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full bg-secondary transition-all"
                      style={{ width: `${course.userProgress.percentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Course Content Accordion */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold text-text-main">
                  Course Content
                </h2>
                <div className="flex items-center gap-4 text-text-secondary">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[20px]">
                      menu_book
                    </span>
                    {totalLessons} lessons
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[20px]">
                      schedule
                    </span>
                    {formatDuration(totalDurationSeconds)} total
                  </span>
                </div>
              </div>
              <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
                {course.categories?.map((category: any) => {
                  const isOpen = openCategories.has(category.id);
                  const categoryDuration = category.lessons.reduce(
                    (sum: number, lesson: any) =>
                      sum + (lesson.durationSeconds || 0),
                    0
                  );
                  return (
                    <div key={category.id}>
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="flex w-full cursor-pointer items-center justify-between bg-background-section/50 p-5 transition-colors hover:bg-background-section"
                      >
                        <div className="flex flex-col items-start gap-1">
                          <span className="text-lg font-bold text-text-main">
                            {category.name}
                          </span>
                          <span className="text-sm text-text-secondary">
                            {category.lessons.length} lessons •{" "}
                            {formatDuration(categoryDuration)}
                          </span>
                        </div>
                        <span
                          className={`material-symbols-outlined transition-transform duration-300 ${
                            isOpen ? "scale-y-[-1]" : "scale-y-100"
                          }`}
                        >
                          expand_more
                        </span>
                      </button>
                      <div
                        className={`grid transition-all duration-300 ease-in-out ${
                          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="flex flex-col gap-1 p-5 pt-2 text-text-secondary">
                            {category.lessons.map((lesson: any) => {
                              const canAccess =
                                lesson.isFreePreview || course.hasAccess;

                              const lessonRow = (
                                <div className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0">
                                  <div className="flex items-center gap-3">
                                    {canAccess ? (
                                      <span className="material-symbols-outlined text-primary">
                                        play_circle
                                      </span>
                                    ) : (
                                      <span className="material-symbols-outlined text-gray-400">
                                        lock
                                      </span>
                                    )}
                                    <span className="text-lg text-text-main">
                                      {lesson.title}
                                    </span>
                                    {lesson.isFreePreview && (
                                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-sm font-medium text-green-700">
                                        Free
                                      </span>
                                    )}
                                  </div>
                                  {lesson.durationSeconds && (
                                    <span className="text-base">
                                      {formatDuration(lesson.durationSeconds)}
                                    </span>
                                  )}
                                </div>
                              );

                              return canAccess ? (
                                <Link
                                  key={lesson.id}
                                  href={`/courses/${courseId}/learn?lesson=${lesson.id}`}
                                  className="rounded-lg transition-colors hover:bg-primary/5"
                                >
                                  {lessonRow}
                                </Link>
                              ) : (
                                <div
                                  key={lesson.id}
                                  className="cursor-not-allowed opacity-60"
                                >
                                  {lessonRow}
                                </div>
                              );
                            })}

                            {category.quizzes?.length > 0 && (
                              <div className="mt-3 border-t border-gray-100 pt-3">
                                <h4 className="mb-2 flex items-center gap-2 text-base font-bold text-text-secondary">
                                  <span className="material-symbols-outlined">
                                    quiz
                                  </span>
                                  Quizzes
                                </h4>
                                {category.quizzes.map((quiz: any) => (
                                  <div
                                    key={quiz.id}
                                    className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                                  >
                                    <span className="text-lg text-text-main">
                                      {quiz.name}
                                    </span>
                                    <span className="text-base text-text-secondary">
                                      Max: {quiz.maxScore} pts
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
              <div className="flex flex-col gap-6 p-8">
                {!course.hasAccess ? (
                  <>
                    <Link
                      href={`/courses/${courseId}/learn`}
                      className="flex w-full transform items-center justify-center gap-2 rounded-lg bg-primary py-4 text-xl font-bold text-white shadow-lg transition-transform hover:bg-primary-hover active:scale-95"
                    >
                      Enroll Now
                      <span className="material-symbols-outlined">
                        arrow_forward
                      </span>
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <span className="material-symbols-outlined text-3xl">
                        check_circle
                      </span>
                      <span className="text-xl font-bold">You have access</span>
                    </div>
                    <Link
                      href={`/courses/${courseId}/learn`}
                      className="flex w-full transform items-center justify-center gap-2 rounded-lg bg-primary py-4 text-xl font-bold text-white shadow-lg transition-transform hover:bg-primary-hover active:scale-95"
                    >
                      Continue Learning
                      <span className="material-symbols-outlined">
                        arrow_forward
                      </span>
                    </Link>
                  </>
                )}

                <div className="h-px w-full bg-gray-200" />

                <div className="mt-2 flex flex-col gap-3 text-text-secondary">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">
                      menu_book
                    </span>
                    <span className="text-lg">{totalLessons} lessons</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">
                      schedule
                    </span>
                    <span className="text-lg">
                      {formatDuration(totalDurationSeconds)} total length
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">
                      signal_cellular_alt
                    </span>
                    <span className="text-lg">
                      {course.requiredRole || "All Levels"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">
                      all_inclusive
                    </span>
                    <span className="text-lg">Lifetime access</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">
                      devices
                    </span>
                    <span className="text-lg">
                      Access on mobile and desktop
                    </span>
                  </div>
                  {course.certificateTemplateUrl && (
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">
                        workspace_premium
                      </span>
                      <span className="text-lg">Certificate of completion</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

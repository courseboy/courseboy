"use client";

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

  const { data, isLoading, error } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const response = await courseApi.getById(courseId);
      return response.data.data;
    },
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-[1280px] px-6 py-12 text-center lg:px-10">
        <div className="rounded-2xl bg-white p-12 shadow-md">
          <span className="material-symbols-outlined text-6xl text-red-500">
            error
          </span>
          <p className="mt-4 text-xl text-red-600">
            Course not found or failed to load.
          </p>
          <Link
            href="/courses"
            className="mt-6 inline-flex h-14 items-center justify-center rounded-xl bg-primary px-8 text-xl font-bold text-white shadow-lg transition-transform hover:-translate-y-1 hover:bg-primary-hover"
          >
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const course = data;

  return (
    <div className="min-h-screen bg-background-light">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary to-primary-hover text-white">
        <div className="mx-auto max-w-[1280px] px-6 py-12 lg:px-10 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <span className="mb-4 inline-block rounded-full bg-white/20 px-4 py-2 text-base font-bold">
                {course.requiredRole || "All Members"}
              </span>
              <h1 className="text-3xl font-extrabold lg:text-5xl">
                {course.name}
              </h1>
              <p className="mt-4 text-xl leading-relaxed text-white/90">
                {course.description}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-6 text-lg">
                {course.averageRating > 0 && (
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-yellow-400">
                      star
                    </span>
                    <span className="font-bold">
                      {course.averageRating.toFixed(1)}
                    </span>
                    <span className="text-white/70">
                      ({course.feedbacksCount} reviews)
                    </span>
                  </span>
                )}
                <span className="flex items-center gap-2 text-white/90">
                  <span className="material-symbols-outlined">menu_book</span>
                  {course.categories?.reduce(
                    (sum: number, cat: any) => sum + cat.lessons.length,
                    0
                  )}{" "}
                  lessons
                </span>
              </div>

              {course.userProgress && (
                <div className="mt-8">
                  <div className="flex items-center justify-between text-base">
                    <span>Your Progress</span>
                    <span className="font-bold">
                      {course.userProgress.percentage}%
                    </span>
                  </div>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/30">
                    <div
                      className="h-full bg-secondary transition-all"
                      style={{ width: `${course.userProgress.percentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="relative aspect-video overflow-hidden rounded-2xl shadow-xl lg:aspect-[4/3]">
              {course.coverImg ? (
                <Image
                  src={course.coverImg}
                  alt={course.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-white/10">
                  <span className="material-symbols-outlined text-6xl text-white/50">
                    play_circle
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="mx-auto max-w-[1280px] px-6 py-12 lg:px-10 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Course Content */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-text-main sm:text-3xl">
              Course Content
            </h2>
            <div className="mt-6 space-y-4">
              {course.categories?.map((category: any) => (
                <div
                  key={category.id}
                  className="overflow-hidden rounded-2xl bg-white shadow-md"
                >
                  <div className="border-b border-gray-100 bg-background-section px-6 py-4">
                    <h3 className="text-xl font-bold text-text-main">
                      {category.name}
                    </h3>
                  </div>
                  <div className="p-4">
                    <ul className="space-y-2">
                      {category.lessons.map((lesson: any) => (
                        <li
                          key={lesson.id}
                          className="flex items-center justify-between rounded-xl p-4 transition-colors hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            {lesson.isFreePreview || course.hasAccess ? (
                              <span className="material-symbols-outlined text-2xl text-primary">
                                play_circle
                              </span>
                            ) : (
                              <span className="material-symbols-outlined text-2xl text-text-secondary">
                                lock
                              </span>
                            )}
                            <span className="text-lg text-text-main">
                              {lesson.title}
                            </span>
                            {lesson.isFreePreview && (
                              <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
                                Free Preview
                              </span>
                            )}
                          </div>
                          {lesson.durationSeconds && (
                            <span className="text-base text-text-secondary">
                              {formatDuration(lesson.durationSeconds)}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>

                    {category.quizzes?.length > 0 && (
                      <div className="mt-4 border-t border-gray-100 pt-4">
                        <h4 className="mb-3 flex items-center gap-2 text-base font-bold text-text-secondary">
                          <span className="material-symbols-outlined">
                            quiz
                          </span>
                          Quizzes
                        </h4>
                        {category.quizzes.map((quiz: any) => (
                          <div
                            key={quiz.id}
                            className="flex items-center justify-between rounded-xl bg-gray-50 p-4"
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
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="overflow-hidden rounded-2xl bg-white p-6 shadow-md">
              {!course.hasAccess ? (
                <>
                  <div className="mb-4 text-center">
                    <span className="material-symbols-outlined text-5xl text-accent">
                      workspace_premium
                    </span>
                    <p className="mt-2 text-lg text-text-secondary">
                      {course.requiredRole
                        ? `Requires ${course.requiredRole} membership`
                        : "Enroll to access all lessons"}
                    </p>
                  </div>
                  <Link
                    href="/pricing"
                    className="flex h-14 w-full items-center justify-center rounded-xl bg-accent text-xl font-bold text-white shadow-lg transition-transform hover:scale-105"
                  >
                    Get Access
                  </Link>
                </>
              ) : (
                <>
                  <div className="mb-4 flex items-center justify-center gap-2 text-green-600">
                    <span className="material-symbols-outlined text-3xl">
                      check_circle
                    </span>
                    <span className="text-xl font-bold">You have access</span>
                  </div>
                  <button className="flex h-14 w-full items-center justify-center rounded-xl bg-primary text-xl font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-primary-hover">
                    Continue Learning
                  </button>
                </>
              )}
            </div>

            {course.certificateTemplateUrl && (
              <div className="overflow-hidden rounded-2xl bg-white p-6 text-center shadow-md">
                <span className="material-symbols-outlined text-5xl text-primary">
                  workspace_premium
                </span>
                <h3 className="mt-4 text-xl font-bold text-text-main">
                  Earn a Certificate
                </h3>
                <p className="mt-2 text-lg text-text-secondary">
                  Complete this course to receive a certificate of completion
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

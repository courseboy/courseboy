"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { courseApi, lessonApi } from "@/lib/api";
import { useAuthHydration } from "@/lib/store/auth";
import { LoadingScreen, Spinner } from "@/components/ui/spinner";
import { Course, Lesson, LessonProgress, Quiz } from "@/types";
import VideoPlayer from "@/components/VideoPlayer";
import { formatDuration } from "@/lib/progressUtils";

function formatDurationLocal(seconds: number | null): string {
  if (!seconds) return "0:00";
  return formatDuration(seconds);
}

// Quiz type already has isCompleted, hasPassed, and userSubmission
type QuizWithStatus = Quiz;

interface LessonDetail {
  id: number;
  title: string;
  videoUrl: string | null;
  durationSeconds: number | null;
  isFreePreview: boolean;
  orderIndex: number;
  courseName: string | null;
  categoryName: string | null;
  userProgress: LessonProgress | null;
}

export default function LearnCoursePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const courseId = parseInt(params.id as string);
  const lessonIdParam = searchParams.get("lesson");

  const hydrated = useAuthHydration();

  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(
    lessonIdParam ? parseInt(lessonIdParam) : null
  );
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
    new Set()
  );
  const [expandedQuizSections, setExpandedQuizSections] = useState<Set<number>>(
    new Set()
  );

  // Fetch course data
  const {
    data: course,
    isLoading: courseLoading,
    error: courseError,
  } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const response = await courseApi.getById(courseId);
      return response.data.data as Course;
    },
    enabled: hydrated,
  });

  // Fetch current lesson details
  const { data: lessonDetail, isLoading: lessonLoading } = useQuery({
    queryKey: ["lesson", selectedLessonId],
    queryFn: async () => {
      const response = await lessonApi.getById(selectedLessonId!);
      return response.data.data as LessonDetail;
    },
    enabled: !!selectedLessonId && hydrated,
  });

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async ({
      lessonId,
      watchedSeconds,
      isCompleted,
    }: {
      lessonId: number;
      watchedSeconds: number;
      isCompleted?: boolean;
    }) => {
      return lessonApi.updateProgress(lessonId, {
        watchedSeconds,
        isCompleted,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      queryClient.invalidateQueries({ queryKey: ["lesson", selectedLessonId] });
    },
  });

  // Select first lesson if none selected
  useEffect(() => {
    if (course && !selectedLessonId) {
      const firstCategory = course.categories?.[0];
      const firstLesson = firstCategory?.lessons?.[0];
      if (firstLesson) {
        setSelectedLessonId(firstLesson.id);
        // Expand first category
        setExpandedCategories(new Set([firstCategory.id]));
      }
    }
  }, [course, selectedLessonId]);

  // Expand category containing selected lesson
  useEffect(() => {
    if (course && selectedLessonId) {
      for (const category of course.categories || []) {
        if (category.lessons.some((l) => l.id === selectedLessonId)) {
          setExpandedCategories((prev) => {
            const newSet = new Set(Array.from(prev));
            newSet.add(category.id);
            return newSet;
          });
          break;
        }
      }
    }
  }, [course, selectedLessonId]);

  // Update URL when lesson changes
  useEffect(() => {
    if (selectedLessonId) {
      const newUrl = `/courses/${courseId}/learn?lesson=${selectedLessonId}`;
      window.history.replaceState(null, "", newUrl);
    }
  }, [selectedLessonId, courseId]);

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const toggleQuizSection = (categoryId: number) => {
    setExpandedQuizSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleLessonSelect = (lesson: Lesson) => {
    if (lesson.isFreePreview || course?.hasAccess) {
      setSelectedLessonId(lesson.id);
    }
  };

  const handleMarkComplete = async () => {
    if (!selectedLessonId) return;
    await updateProgressMutation.mutateAsync({
      lessonId: selectedLessonId,
      watchedSeconds: lessonDetail?.durationSeconds || 0,
      isCompleted: true,
    });
  };

  // Navigate to next/previous lesson
  const getAdjacentLessons = () => {
    if (!course || !selectedLessonId) return { prev: null, next: null };

    const allLessons: { lesson: Lesson; categoryId: number }[] = [];
    for (const category of course.categories || []) {
      for (const lesson of category.lessons) {
        allLessons.push({ lesson, categoryId: category.id });
      }
    }

    const currentIndex = allLessons.findIndex(
      (l) => l.lesson.id === selectedLessonId
    );
    const prev = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
    const next =
      currentIndex < allLessons.length - 1
        ? allLessons[currentIndex + 1]
        : null;

    return { prev, next };
  };

  const { prev, next } = getAdjacentLessons();

  if (!hydrated || courseLoading) {
    return <LoadingScreen />;
  }

  if (courseError || !course) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-red-500">
            error
          </span>
          <p className="mt-4 text-xl text-red-600">Failed to load course</p>
          <Link
            href="/courses"
            className="mt-6 inline-block rounded-xl bg-primary px-8 py-3 font-bold text-white"
          >
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  // Check access
  if (!course.hasAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light">
        <div className="max-w-md text-center">
          <span className="material-symbols-outlined text-6xl text-accent">
            lock
          </span>
          <h2 className="mt-4 text-2xl font-bold text-text-main">
            Access Required
          </h2>
          <p className="mt-2 text-lg text-text-secondary">
            You need the required privilege to access this course.
          </p>
          <Link
            href={`/courses/${courseId}`}
            className="mt-6 inline-block rounded-xl bg-primary px-8 py-3 font-bold text-white"
          >
            View Course Details
          </Link>
        </div>
      </div>
    );
  }

  const totalLessons =
    course.categories?.reduce((sum, cat) => sum + cat.lessons.length, 0) || 0;
  const completedLessons = course.userProgress?.completedLessons || 0;
  const progressPercentage = course.userProgress?.percentage || 0;

  return (
    <div className="flex min-h-screen flex-col bg-background-light">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo & Back */}
          <div className="flex items-center gap-4">
            <Link
              href={`/courses/${courseId}`}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-text-main transition-colors hover:bg-gray-100"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              <span className="hidden font-medium sm:inline">
                Back to Course
              </span>
            </Link>
            <div className="hidden h-6 w-px bg-gray-200 sm:block" />
            <h1 className="hidden truncate text-lg font-bold text-text-main sm:block">
              {course.name}
            </h1>
          </div>

          {/* Progress & User */}
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-3 sm:flex">
              <span className="text-sm text-text-secondary">
                {completedLessons}/{totalLessons} lessons
              </span>
              <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-secondary transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="text-sm font-bold text-secondary">
                {progressPercentage}%
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col lg:flex-row">
        {/* Video & Lesson Content (Left) */}
        <div className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8">
          {/* Breadcrumbs */}
          <nav className="mb-4 flex flex-wrap items-center gap-2 text-sm text-text-secondary">
            <span>{course.name}</span>
            <span className="material-symbols-outlined text-xs">
              chevron_right
            </span>
            <span className="font-medium text-primary">
              {lessonDetail?.title || "Select a lesson"}
            </span>
          </nav>

          {/* Video Player */}
          <div className="relative w-full">
            {lessonLoading ? (
              <div className="flex aspect-video h-full items-center justify-center rounded-2xl bg-black">
                <Spinner size="lg" />
              </div>
            ) : lessonDetail?.videoUrl ? (
              <VideoPlayer
                lessonId={lessonDetail.id}
                videoUrl={lessonDetail.videoUrl}
                videoDuration={lessonDetail.durationSeconds || 0}
                initialProgress={lessonDetail.userProgress?.watchedSeconds || 0}
                initialCompleted={
                  lessonDetail.userProgress?.isCompleted || false
                }
                onProgressUpdate={(watchedSeconds, isCompleted) => {
                  if (isCompleted) {
                    queryClient.invalidateQueries({
                      queryKey: ["course", courseId],
                    });
                    queryClient.invalidateQueries({
                      queryKey: ["lesson", selectedLessonId],
                    });
                  }
                }}
              />
            ) : (
              <div className="flex aspect-video h-full flex-col items-center justify-center gap-4 rounded-2xl bg-black text-white/70">
                <span className="material-symbols-outlined text-6xl">
                  videocam_off
                </span>
                <p className="text-lg">No video available for this lesson</p>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="mt-6 flex flex-col gap-4 sm:flex-row">
            <button
              onClick={() => prev && handleLessonSelect(prev.lesson)}
              disabled={!prev}
              className="flex flex-1 items-center justify-center gap-3 rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-lg font-bold text-text-main transition-all hover:border-primary/30 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Previous Lesson
            </button>
            <button
              onClick={() => next && handleLessonSelect(next.lesson)}
              disabled={!next}
              className="flex flex-1 items-center justify-center gap-3 rounded-xl bg-primary px-6 py-4 text-lg font-bold text-white shadow-md transition-all hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next Lesson
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>

          {/* Lesson Details */}
          {lessonDetail && (
            <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-text-main sm:text-3xl">
                  {lessonDetail.title}
                </h2>
                {lessonDetail.userProgress?.isCompleted ? (
                  <span className="flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
                    <span className="material-symbols-outlined text-lg">
                      check_circle
                    </span>
                    Completed
                  </span>
                ) : (
                  <button
                    onClick={handleMarkComplete}
                    disabled={updateProgressMutation.isPending}
                    className="flex items-center gap-2 rounded-full bg-secondary/10 px-4 py-2 text-sm font-bold text-secondary transition-colors hover:bg-secondary/20 disabled:opacity-50"
                  >
                    {updateProgressMutation.isPending ? (
                      <Spinner size="sm" />
                    ) : (
                      <span className="material-symbols-outlined text-lg">
                        task_alt
                      </span>
                    )}
                    Mark as Complete
                  </button>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                {lessonDetail.categoryName && (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-lg">
                      folder
                    </span>
                    {lessonDetail.categoryName}
                  </span>
                )}
                {lessonDetail.durationSeconds && (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-lg">
                      schedule
                    </span>
                    {formatDurationLocal(lessonDetail.durationSeconds)}
                  </span>
                )}
                {lessonDetail.isFreePreview && (
                  <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent">
                    FREE PREVIEW
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar (Right) */}
        <aside className="w-full flex-shrink-0 border-t border-gray-200 bg-background-section lg:w-[380px] lg:border-l lg:border-t-0">
          <div className="flex flex-col p-4 sm:p-6 lg:p-8">
            {/* Syllabus */}
            <h3 className="mb-4 text-lg font-bold text-text-main">
              Course Syllabus
            </h3>
            <div
              className="flex flex-col gap-3 overflow-y-auto pr-2"
              style={{ maxHeight: "calc(100vh - 70px)" }}
            >
              {course.categories?.map((category) => (
                <div
                  key={category.id}
                  className="rounded-xl border border-gray-200 bg-white"
                >
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`material-symbols-outlined text-lg text-text-secondary transition-transform ${
                          expandedCategories.has(category.id)
                            ? "rotate-180"
                            : ""
                        }`}
                      >
                        expand_more
                      </span>
                      <span className="font-bold text-text-main">
                        {category.name}
                      </span>
                    </div>
                    <span className="text-xs text-text-secondary">
                      {category.lessons.length} lessons
                    </span>
                  </button>

                  {/* Lessons */}
                  {expandedCategories.has(category.id) && (
                    <div className="border-t border-gray-100 bg-gray-50/50 p-2">
                      {category.lessons.map((lesson) => {
                        const isSelected = lesson.id === selectedLessonId;
                        const canAccess =
                          lesson.isFreePreview || course.hasAccess;
                        const isCompleted =
                          lesson.userProgress?.isCompleted || false;

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => handleLessonSelect(lesson)}
                            disabled={!canAccess}
                            className={`flex w-full items-start gap-3 rounded-lg p-3 text-left transition-all ${
                              isSelected
                                ? "border-2 border-primary bg-white shadow-sm"
                                : canAccess
                                ? "hover:bg-white/80"
                                : "cursor-not-allowed opacity-50"
                            }`}
                          >
                            <div
                              className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${
                                isCompleted
                                  ? "bg-green-500 text-white"
                                  : isSelected
                                  ? "bg-primary text-white"
                                  : canAccess
                                  ? "bg-gray-200 text-text-secondary"
                                  : "bg-gray-200 text-gray-400"
                              }`}
                            >
                              <span className="material-symbols-outlined text-sm">
                                {isCompleted
                                  ? "check"
                                  : isSelected
                                  ? "play_arrow"
                                  : canAccess
                                  ? "play_circle"
                                  : "lock"}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p
                                  className={`truncate text-sm font-medium ${
                                    isSelected
                                      ? "text-primary"
                                      : "text-text-main"
                                  }`}
                                >
                                  {lesson.title}
                                </p>
                                {isCompleted && (
                                  <span className="flex-shrink-0 text-green-600">
                                    <span className="material-symbols-outlined text-base">
                                      check_circle
                                    </span>
                                  </span>
                                )}
                              </div>
                              <div className="mt-1 flex items-center gap-2">
                                <span className="text-xs text-text-secondary">
                                  {formatDurationLocal(lesson.durationSeconds)}
                                </span>
                                {lesson.isFreePreview && (
                                  <span className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-bold text-accent">
                                    FREE
                                  </span>
                                )}
                                {isCompleted && (
                                  <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-bold text-green-700">
                                    COMPLETED
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}

                      {/* Quizzes Section */}
                      {category.quizzes && category.quizzes.length > 0 && (
                        <div className="mt-3 border-t border-gray-200 pt-3">
                          <button
                            onClick={() => toggleQuizSection(category.id)}
                            className="mb-2 flex w-full items-center justify-between px-3 py-1 text-left transition-colors hover:bg-gray-100/50 rounded-lg"
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-sm text-accent">
                                quiz
                              </span>
                              <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                                Quizzes
                              </span>
                            </div>
                            <span
                              className={`material-symbols-outlined text-lg text-text-secondary transition-transform ${
                                expandedQuizSections.has(category.id)
                                  ? "rotate-180"
                                  : ""
                              }`}
                            >
                              expand_more
                            </span>
                          </button>
                          {expandedQuizSections.has(category.id) && (
                            <div className="animate-in slide-in-from-top-2 duration-200">
                              {category.quizzes.map((quiz: QuizWithStatus) => {
                                const canTakeQuiz = course.hasAccess;
                                const isCompleted = quiz.isCompleted;
                                const hasPassed = quiz.hasPassed;
                                const submission = quiz.userSubmission;

                                return (
                                  <div
                                    key={quiz.id}
                                    className={`mb-2 flex items-start gap-3 rounded-lg border p-3 ${
                                      isCompleted && hasPassed
                                        ? "border-green-300 bg-green-50"
                                        : isCompleted && !hasPassed
                                        ? "border-orange-300 bg-orange-50"
                                        : canTakeQuiz
                                        ? "border-blue-300 bg-blue-50"
                                        : "border-gray-200 bg-gray-100 opacity-50"
                                    }`}
                                  >
                                    <div
                                      className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${
                                        isCompleted && hasPassed
                                          ? "bg-green-500 text-white"
                                          : isCompleted && !hasPassed
                                          ? "bg-orange-500 text-white"
                                          : canTakeQuiz
                                          ? "bg-accent/20 text-accent"
                                          : "bg-gray-200 text-gray-400"
                                      }`}
                                    >
                                      <span className="material-symbols-outlined text-sm">
                                        {isCompleted && hasPassed
                                          ? "check"
                                          : isCompleted && !hasPassed
                                          ? "refresh"
                                          : canTakeQuiz
                                          ? "assignment"
                                          : "lock"}
                                      </span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p
                                        className={`truncate text-sm font-medium ${
                                          isCompleted && hasPassed
                                            ? "text-green-700"
                                            : isCompleted && !hasPassed
                                            ? "text-orange-700"
                                            : "text-text-main"
                                        }`}
                                      >
                                        {quiz.name}
                                      </p>
                                      <div className="mt-1 flex flex-wrap items-center gap-2">
                                        {submission ? (
                                          <>
                                            <span
                                              className={`rounded px-1.5 py-0.5 text-xs font-bold ${
                                                hasPassed
                                                  ? "bg-green-100 text-green-700"
                                                  : "bg-orange-100 text-orange-700"
                                              }`}
                                            >
                                              {submission.percentage}% (
                                              {submission.score}/
                                              {submission.maxScore})
                                            </span>
                                            {hasPassed && (
                                              <span className="text-xs text-green-600">
                                                ✓ Passed
                                              </span>
                                            )}
                                            {!hasPassed && (
                                              <span className="text-xs text-orange-600">
                                                Need {quiz.passingScore}% to pass
                                              </span>
                                            )}
                                          </>
                                        ) : (
                                          <span className="text-xs text-text-secondary">
                                            Pass: {quiz.passingScore}% •{" "}
                                            {quiz._count?.questions || 0} questions
                                          </span>
                                        )}
                                      </div>
                                      {canTakeQuiz && (
                                        <div className="mt-2 flex gap-2">
                                          {!isCompleted || !hasPassed ? (
                                            <Link
                                              href={`/courses/${course.id}/quiz?quiz=${quiz.id}`}
                                              className="flex items-center gap-1 rounded-md bg-primary px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-600"
                                            >
                                              <span className="material-symbols-outlined text-sm">
                                                quiz
                                              </span>
                                              {isCompleted
                                                ? "Retake Quiz"
                                                : "Take Quiz"}
                                            </Link>
                                          ) : null}
                                          {isCompleted && (
                                            <Link
                                              href={`/courses/${course.id}/quiz/results?quiz=${quiz.id}`}
                                              className="flex items-center gap-1 rounded-md bg-gray-500 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-gray-600"
                                            >
                                              <span className="material-symbols-outlined text-sm">
                                                visibility
                                              </span>
                                              View Results
                                            </Link>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

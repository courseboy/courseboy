"use client";

import { useState, useEffect, useCallback } from "react";
import { adminCourseApi, adminUserApi } from "@/lib/api";
import {
  AdminCourse,
  AdminCategory,
  AdminLesson,
  Privilege,
  Quiz,
} from "@/types";
import { Spinner } from "@/components/ui/spinner";
import { CreateCourseModal } from "@/components/admin/courses/CreateCourseModal";
import { EditCourseModal } from "@/components/admin/courses/EditCourseModal";
import { CreateCategoryModal } from "@/components/admin/courses/CreateCategoryModal";
import { EditCategoryModal } from "@/components/admin/courses/EditCategoryModal";
import { CreateLessonModal } from "@/components/admin/courses/CreateLessonModal";
import { EditLessonModal } from "@/components/admin/courses/EditLessonModal";
import {
  CreateQuizModal,
  EditQuizModal,
  DeleteQuizModal,
  ManageQuestionsModal,
} from "@/components/admin/courses/QuizModals";

function formatDuration(seconds: number): string {
  if (!seconds) return "0m";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function formatLessonDuration(seconds: number | null): string {
  if (!seconds) return "--:--";
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [privileges, setPrivileges] = useState<Privilege[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCourses, setExpandedCourses] = useState<Set<number>>(
    new Set()
  );
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
    new Set()
  );

  // Modal states
  const [isCreateCourseModalOpen, setIsCreateCourseModalOpen] = useState(false);
  const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<AdminCourse | null>(
    null
  );

  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] =
    useState(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [selectedCourseForCategory, setSelectedCourseForCategory] = useState<
    number | null
  >(null);
  const [selectedCategory, setSelectedCategory] =
    useState<AdminCategory | null>(null);

  const [isCreateLessonModalOpen, setIsCreateLessonModalOpen] = useState(false);
  const [isEditLessonModalOpen, setIsEditLessonModalOpen] = useState(false);
  const [selectedCourseForLesson, setSelectedCourseForLesson] = useState<
    number | null
  >(null);
  const [selectedCategoryForLesson, setSelectedCategoryForLesson] = useState<
    number | null
  >(null);
  const [selectedLesson, setSelectedLesson] = useState<AdminLesson | null>(
    null
  );

  // Quiz modal states
  const [isCreateQuizModalOpen, setIsCreateQuizModalOpen] = useState(false);
  const [isEditQuizModalOpen, setIsEditQuizModalOpen] = useState(false);
  const [isDeleteQuizModalOpen, setIsDeleteQuizModalOpen] = useState(false);
  const [isManageQuestionsModalOpen, setIsManageQuestionsModalOpen] =
    useState(false);
  const [selectedCourseForQuiz, setSelectedCourseForQuiz] = useState<
    number | null
  >(null);
  const [selectedCategoryForQuiz, setSelectedCategoryForQuiz] =
    useState<AdminCategory | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminCourseApi.getAll();
      setCourses(response.data.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPrivileges = async () => {
    try {
      const response = await adminUserApi.getPrivileges();
      setPrivileges(response.data.data);
    } catch (err) {
      console.error("Failed to fetch privileges:", err);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchPrivileges();
  }, [fetchCourses]);

  const toggleCourse = (courseId: number) => {
    setExpandedCourses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

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

  const handleDeleteCourse = async (courseId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this course? This will also delete all categories and lessons."
      )
    )
      return;

    try {
      setActionLoading(`course-${courseId}`);
      await adminCourseApi.delete(courseId);
      await fetchCourses();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || "Failed to delete course");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this category? This will also delete all lessons in it."
      )
    )
      return;

    try {
      setActionLoading(`category-${categoryId}`);
      await adminCourseApi.deleteCategory(categoryId);
      await fetchCourses();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || "Failed to delete category");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;

    try {
      setActionLoading(`lesson-${lessonId}`);
      await adminCourseApi.deleteLesson(lessonId);
      await fetchCourses();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || "Failed to delete lesson");
    } finally {
      setActionLoading(null);
    }
  };

  const handleTogglePublish = async (course: AdminCourse) => {
    try {
      setActionLoading(`publish-${course.id}`);
      await adminCourseApi.update(course.id, {
        isPublished: !course.isPublished,
      });
      await fetchCourses();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || "Failed to update course");
    } finally {
      setActionLoading(null);
    }
  };

  // Edit handlers
  const handleEditCourse = (course: AdminCourse) => {
    setSelectedCourse(course);
    setIsEditCourseModalOpen(true);
  };

  const handleAddCategory = (courseId: number) => {
    setSelectedCourseForCategory(courseId);
    setIsCreateCategoryModalOpen(true);
  };

  const handleEditCategory = (category: AdminCategory) => {
    setSelectedCategory(category);
    setIsEditCategoryModalOpen(true);
  };

  const handleAddLesson = (courseId: number, categoryId: number) => {
    setSelectedCourseForLesson(courseId);
    setSelectedCategoryForLesson(categoryId);
    setIsCreateLessonModalOpen(true);
  };

  const handleEditLesson = (lesson: AdminLesson) => {
    setSelectedLesson(lesson);
    setIsEditLessonModalOpen(true);
  };

  // Quiz handlers
  const handleAddQuiz = (courseId: number, category: AdminCategory) => {
    setSelectedCourseForQuiz(courseId);
    setSelectedCategoryForQuiz(category);
    setIsCreateQuizModalOpen(true);
  };

  const handleEditQuiz = (courseId: number, quiz: Quiz) => {
    setSelectedCourseForQuiz(courseId);
    setSelectedQuiz(quiz);
    setIsEditQuizModalOpen(true);
  };

  const handleDeleteQuiz = (courseId: number, quiz: Quiz) => {
    setSelectedCourseForQuiz(courseId);
    setSelectedQuiz(quiz);
    setIsDeleteQuizModalOpen(true);
  };

  const handleSuccess = () => {
    fetchCourses();
    // Close all modals
    setIsCreateCourseModalOpen(false);
    setIsEditCourseModalOpen(false);
    setIsCreateCategoryModalOpen(false);
    setIsEditCategoryModalOpen(false);
    setIsCreateLessonModalOpen(false);
    setIsEditLessonModalOpen(false);
    setIsCreateQuizModalOpen(false);
    setIsEditQuizModalOpen(false);
    setIsDeleteQuizModalOpen(false);
    // Clear selections
    setSelectedCourse(null);
    setSelectedCategory(null);
    setSelectedLesson(null);
    setSelectedQuiz(null);
    setSelectedCategoryForQuiz(null);
    setSelectedCourseForQuiz(null);
  };

  if (loading && courses.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8">
      {/* Page Header & Main Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#1F2933] tracking-tight">
            Curriculum
          </h2>
          <p className="text-[#6B7280] mt-1 text-base">
            Manage your courses, categories, and learning materials.
          </p>
        </div>
        <button
          onClick={() => setIsCreateCourseModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-[#3A7BD5] hover:bg-[#2c62b0] text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">
            add_circle
          </span>
          <span>Create New Course</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Course List */}
      <div className="flex flex-col gap-6">
        {courses.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center">
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="bg-slate-100 p-3 rounded-full">
                <span className="material-symbols-outlined text-slate-400 text-3xl">
                  school
                </span>
              </div>
              <p className="text-[#6B7280] mt-2">No courses yet.</p>
              <button
                onClick={() => setIsCreateCourseModalOpen(true)}
                className="text-sm text-[#3A7BD5] font-medium hover:underline mt-2"
              >
                Create your first course
              </button>
            </div>
          </div>
        ) : (
          courses.map((course) => (
            <div
              key={course.id}
              className="group bg-white rounded-xl shadow-[0_2px_8px_rgb(0,0,0,0.04)] border border-slate-200 overflow-hidden"
            >
              {/* Course Header */}
              <div
                className={`flex items-center justify-between p-4 md:p-5 cursor-pointer bg-white hover:bg-slate-50 transition-colors select-none ${
                  expandedCourses.has(course.id)
                    ? "border-b border-slate-100"
                    : ""
                }`}
                onClick={() => toggleCourse(course.id)}
              >
                <div className="flex items-center gap-4 flex-1">
                  <span
                    className={`material-symbols-outlined text-[#6B7280] text-2xl transition-transform ${
                      expandedCourses.has(course.id) ? "rotate-180" : ""
                    }`}
                  >
                    expand_more
                  </span>
                  <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center text-[#3A7BD5] shrink-0">
                    <span className="material-symbols-outlined text-[28px]">
                      school
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-lg font-bold text-[#1F2933] leading-tight">
                      {course.name || "Untitled Course"}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                          course.isPublished
                            ? "bg-[#7BC8A4]/10 text-[#7BC8A4] ring-[#7BC8A4]/20"
                            : "bg-gray-100 text-[#6B7280] ring-gray-500/10"
                        }`}
                      >
                        {course.isPublished ? "Active" : "Draft"}
                      </span>
                      <span className="text-xs text-[#6B7280]">
                        • {course.lessonsCount} Lessons
                      </span>
                      <span className="text-xs text-[#6B7280]">
                        • {formatDuration(course.totalDurationSeconds)}
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  className="flex items-center gap-2 md:gap-3 shrink-0 ml-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  {actionLoading === `publish-${course.id}` ? (
                    <Spinner size="sm" />
                  ) : (
                    <button
                      onClick={() => handleTogglePublish(course)}
                      className={`p-2 rounded-lg transition-colors ${
                        course.isPublished
                          ? "text-[#7BC8A4] hover:bg-green-50"
                          : "text-[#6B7280] hover:text-[#7BC8A4] hover:bg-green-50"
                      }`}
                      title={course.isPublished ? "Unpublish" : "Publish"}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {course.isPublished ? "visibility" : "visibility_off"}
                      </span>
                    </button>
                  )}
                  <button
                    onClick={() => handleAddCategory(course.id)}
                    className="p-2 text-[#6B7280] hover:text-[#3A7BD5] hover:bg-blue-50 rounded-lg transition-colors"
                    title="Add Category"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      create_new_folder
                    </span>
                  </button>
                  <button
                    onClick={() => handleEditCourse(course)}
                    className="p-2 text-[#6B7280] hover:text-[#3A7BD5] hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Course"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      edit
                    </span>
                  </button>
                  {actionLoading === `course-${course.id}` ? (
                    <Spinner size="sm" />
                  ) : (
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="p-2 text-[#6B7280] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Course"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        delete
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Categories Container */}
              {expandedCourses.has(course.id) && (
                <div className="bg-[#F8FAFC] flex flex-col p-3 md:p-4 gap-3">
                  {course.categories.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="bg-white p-3 rounded-full border border-dashed border-slate-300">
                          <span className="material-symbols-outlined text-slate-400">
                            folder_off
                          </span>
                        </div>
                        <p className="text-sm text-[#6B7280]">
                          No content in this course yet.
                        </p>
                        <button
                          onClick={() => handleAddCategory(course.id)}
                          className="text-sm text-[#3A7BD5] font-medium hover:underline"
                        >
                          Add your first Category
                        </button>
                      </div>
                    </div>
                  ) : (
                    course.categories.map((category) => (
                      <div
                        key={category.id}
                        className="rounded-lg border border-slate-200 bg-[#EEF2F7] overflow-hidden"
                      >
                        {/* Category Header */}
                        <div
                          className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-200/50 transition-colors"
                          onClick={() => toggleCategory(category.id)}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`material-symbols-outlined text-[#6B7280] text-[20px] transition-transform ${
                                expandedCategories.has(category.id)
                                  ? "rotate-180"
                                  : ""
                              }`}
                            >
                              expand_more
                            </span>
                            <span className="material-symbols-outlined text-[#6B7280] text-[20px]">
                              folder
                            </span>
                            <span className="font-medium text-[#1F2933]">
                              {category.name}
                            </span>
                            <span className="text-xs text-[#6B7280]">
                              ({category.lessonsCount} lessons)
                            </span>
                          </div>
                          <div
                            className="flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() =>
                                handleAddLesson(course.id, category.id)
                              }
                              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#3A7BD5] hover:bg-white rounded transition-colors mr-2"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                add
                              </span>
                              Add Lesson
                            </button>
                            <button
                              onClick={() => handleEditCategory(category)}
                              className="p-1.5 text-[#6B7280] hover:text-[#1F2933] rounded hover:bg-white transition-colors"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                edit
                              </span>
                            </button>
                            {actionLoading === `category-${category.id}` ? (
                              <Spinner size="sm" />
                            ) : (
                              <button
                                onClick={() =>
                                  handleDeleteCategory(category.id)
                                }
                                className="p-1.5 text-[#6B7280] hover:text-red-500 rounded hover:bg-white transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  delete
                                </span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Lessons List */}
                        {expandedCategories.has(category.id) && (
                          <div className="px-4 pb-3 pt-1 flex flex-col gap-2">
                            {category.lessons.length === 0 ? (
                              <div className="p-4 text-center bg-white rounded-md border border-dashed border-slate-200">
                                <p className="text-sm text-[#6B7280]">
                                  No lessons yet.
                                </p>
                                <button
                                  onClick={() =>
                                    handleAddLesson(course.id, category.id)
                                  }
                                  className="text-sm text-[#3A7BD5] font-medium hover:underline mt-1"
                                >
                                  Add your first lesson
                                </button>
                              </div>
                            ) : (
                              category.lessons.map((lesson) => (
                                <div
                                  key={lesson.id}
                                  className="flex items-center justify-between bg-white p-3 rounded-md border border-slate-200 shadow-sm hover:border-[#3A7BD5]/30 transition-colors group/lesson"
                                >
                                  <div className="flex items-center gap-3 overflow-hidden">
                                    <span className="material-symbols-outlined text-slate-300 cursor-grab hover:text-[#6B7280]">
                                      drag_indicator
                                    </span>
                                    <div
                                      className={`h-8 w-8 rounded flex items-center justify-center shrink-0 ${
                                        lesson.videoUrl
                                          ? "bg-blue-50 text-[#3A7BD5]"
                                          : "bg-slate-100 text-slate-400"
                                      }`}
                                    >
                                      <span className="material-symbols-outlined text-[18px]">
                                        {lesson.videoUrl
                                          ? "play_circle"
                                          : "videocam_off"}
                                      </span>
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                      <span className="text-sm font-medium text-[#1F2933] truncate">
                                        {lesson.title || "Untitled Lesson"}
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-[#6B7280] uppercase tracking-wider font-semibold">
                                          Video •{" "}
                                          {formatLessonDuration(
                                            lesson.durationSeconds
                                          )}
                                        </span>
                                        {lesson.isFreePreview && (
                                          <span className="text-[10px] bg-[#F4A261]/20 text-[#F4A261] px-1.5 py-0.5 rounded font-semibold">
                                            FREE PREVIEW
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 opacity-0 group-hover/lesson:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => handleEditLesson(lesson)}
                                      className="p-1.5 text-[#6B7280] hover:text-[#3A7BD5] rounded hover:bg-slate-50"
                                    >
                                      <span className="material-symbols-outlined text-[18px]">
                                        edit
                                      </span>
                                    </button>
                                    {actionLoading === `lesson-${lesson.id}` ? (
                                      <Spinner size="sm" />
                                    ) : (
                                      <button
                                        onClick={() =>
                                          handleDeleteLesson(lesson.id)
                                        }
                                        className="p-1.5 text-[#6B7280] hover:text-red-500 rounded hover:bg-red-50"
                                      >
                                        <span className="material-symbols-outlined text-[18px]">
                                          delete
                                        </span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))
                            )}

                            {/* Quizzes Section */}
                            <div className="mt-4 pt-4 border-t border-slate-200">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="material-symbols-outlined text-[#F4A261] text-lg">
                                    quiz
                                  </span>
                                  <span className="text-sm font-semibold text-[#1F2933]">
                                    Quizzes ({category.quizzes?.length || 0})
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddQuiz(course.id, category);
                                  }}
                                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#F4A261] hover:bg-[#E8954F] rounded-md transition-colors shadow-sm"
                                >
                                  <span className="material-symbols-outlined text-[14px]">
                                    add
                                  </span>
                                  Add Quiz
                                </button>
                              </div>

                              {!category.quizzes ||
                              category.quizzes.length === 0 ? (
                                <div className="p-3 text-center bg-orange-50/50 rounded-md border border-dashed border-orange-200">
                                  <p className="text-xs text-[#6B7280]">
                                    No quizzes yet. Add a quiz using a Google
                                    Form link.
                                  </p>
                                </div>
                              ) : (
                                <div className="flex flex-col gap-2">
                                  {category.quizzes.map((quiz) => (
                                    <div
                                      key={quiz.id}
                                      className="flex items-center justify-between bg-orange-50/50 p-3 rounded-md border border-orange-200 hover:border-[#F4A261]/50 transition-colors group/quiz"
                                    >
                                      <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="h-8 w-8 rounded flex items-center justify-center shrink-0 bg-orange-100 text-[#F4A261]">
                                          <span className="material-symbols-outlined text-[18px]">
                                            assignment
                                          </span>
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                          <span className="text-sm font-medium text-[#1F2933] truncate">
                                            {quiz.name}
                                          </span>
                                          <span className="text-[10px] text-[#6B7280] uppercase tracking-wider font-semibold">
                                            {quiz._count?.questions || 0}{" "}
                                            Questions • Pass:{" "}
                                            {quiz.passingScore}%
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1 opacity-0 group-hover/quiz:opacity-100 transition-opacity">
                                        <button
                                          onClick={() => {
                                            setSelectedQuiz(quiz);
                                            setSelectedCourseForQuiz(course.id);
                                            setIsManageQuestionsModalOpen(true);
                                          }}
                                          className="p-1.5 text-[#6B7280] hover:text-green-600 rounded hover:bg-green-50"
                                          title="Manage Questions"
                                        >
                                          <span className="material-symbols-outlined text-[18px]">
                                            quiz
                                          </span>
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleEditQuiz(course.id, quiz)
                                          }
                                          className="p-1.5 text-[#6B7280] hover:text-[#3A7BD5] rounded hover:bg-white"
                                          title="Edit Quiz Settings"
                                        >
                                          <span className="material-symbols-outlined text-[18px]">
                                            edit
                                          </span>
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleDeleteQuiz(course.id, quiz)
                                          }
                                          className="p-1.5 text-[#6B7280] hover:text-red-500 rounded hover:bg-red-50"
                                          title="Delete Quiz"
                                        >
                                          <span className="material-symbols-outlined text-[18px]">
                                            delete
                                          </span>
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      <CreateCourseModal
        isOpen={isCreateCourseModalOpen}
        onClose={() => setIsCreateCourseModalOpen(false)}
        onSuccess={handleSuccess}
        privileges={privileges}
      />

      {selectedCourse && (
        <EditCourseModal
          isOpen={isEditCourseModalOpen}
          onClose={() => {
            setIsEditCourseModalOpen(false);
            setSelectedCourse(null);
          }}
          onSuccess={handleSuccess}
          course={selectedCourse}
          privileges={privileges}
        />
      )}

      {selectedCourseForCategory && (
        <CreateCategoryModal
          isOpen={isCreateCategoryModalOpen}
          onClose={() => {
            setIsCreateCategoryModalOpen(false);
            setSelectedCourseForCategory(null);
          }}
          onSuccess={handleSuccess}
          courseId={selectedCourseForCategory}
        />
      )}

      {selectedCategory && (
        <EditCategoryModal
          isOpen={isEditCategoryModalOpen}
          onClose={() => {
            setIsEditCategoryModalOpen(false);
            setSelectedCategory(null);
          }}
          onSuccess={handleSuccess}
          category={selectedCategory}
        />
      )}

      {selectedCourseForLesson && selectedCategoryForLesson && (
        <CreateLessonModal
          isOpen={isCreateLessonModalOpen}
          onClose={() => {
            setIsCreateLessonModalOpen(false);
            setSelectedCourseForLesson(null);
            setSelectedCategoryForLesson(null);
          }}
          onSuccess={handleSuccess}
          courseId={selectedCourseForLesson}
          categoryId={selectedCategoryForLesson}
        />
      )}

      {selectedLesson && (
        <EditLessonModal
          isOpen={isEditLessonModalOpen}
          onClose={() => {
            setIsEditLessonModalOpen(false);
            setSelectedLesson(null);
          }}
          onSuccess={handleSuccess}
          lesson={selectedLesson}
        />
      )}

      {/* Quiz Modals */}
      {isCreateQuizModalOpen &&
        selectedCourseForQuiz &&
        selectedCategoryForQuiz && (
          <CreateQuizModal
            courseId={selectedCourseForQuiz}
            categoryId={selectedCategoryForQuiz.id}
            categoryName={selectedCategoryForQuiz.name}
            onClose={() => {
              setIsCreateQuizModalOpen(false);
              setSelectedCourseForQuiz(null);
              setSelectedCategoryForQuiz(null);
              handleSuccess();
            }}
          />
        )}

      {isEditQuizModalOpen && selectedCourseForQuiz && selectedQuiz && (
        <EditQuizModal
          courseId={selectedCourseForQuiz}
          quiz={selectedQuiz}
          onClose={() => {
            setIsEditQuizModalOpen(false);
            setSelectedCourseForQuiz(null);
            setSelectedQuiz(null);
            handleSuccess();
          }}
        />
      )}

      {isDeleteQuizModalOpen && selectedCourseForQuiz && selectedQuiz && (
        <DeleteQuizModal
          courseId={selectedCourseForQuiz}
          quiz={selectedQuiz}
          onClose={() => {
            setIsDeleteQuizModalOpen(false);
            setSelectedCourseForQuiz(null);
            setSelectedQuiz(null);
            handleSuccess();
          }}
        />
      )}

      {isManageQuestionsModalOpen && selectedCourseForQuiz && selectedQuiz && (
        <ManageQuestionsModal
          courseId={selectedCourseForQuiz}
          quizId={selectedQuiz.id}
          quizName={selectedQuiz.name}
          onClose={() => {
            setIsManageQuestionsModalOpen(false);
            setSelectedCourseForQuiz(null);
            setSelectedQuiz(null);
            handleSuccess();
          }}
        />
      )}
    </div>
  );
}

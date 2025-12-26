"use client";

import { AdminCourse } from "@/types";
import { Spinner } from "@/components/ui/spinner";
import { formatCourseDuration } from "../utils";
import { CategorySection } from "./CategorySection";

interface CourseCardProps {
  course: AdminCourse;
  isExpanded: boolean;
  onToggle: () => void;
  onTogglePublish: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddCategory: () => void;
  actionLoading: string | null;
  expandedCategories: Set<number>;
  onToggleCategory: (categoryId: number) => void;
  onEditCategory: (category: AdminCourse["categories"][0]) => void;
  onDeleteCategory: (categoryId: number) => void;
  onAddLesson: (categoryId: number) => void;
  onEditLesson: (lesson: AdminCourse["categories"][0]["lessons"][0]) => void;
  onDeleteLesson: (lessonId: number) => void;
  onAddQuiz: (category: AdminCourse["categories"][0]) => void;
  onEditQuiz: (quiz: AdminCourse["categories"][0]["quizzes"][0]) => void;
  onDeleteQuiz: (quiz: AdminCourse["categories"][0]["quizzes"][0]) => void;
  onManageQuestions: (quiz: AdminCourse["categories"][0]["quizzes"][0]) => void;
}

export function CourseCard({
  course,
  isExpanded,
  onToggle,
  onTogglePublish,
  onEdit,
  onDelete,
  onAddCategory,
  actionLoading,
  expandedCategories,
  onToggleCategory,
  onEditCategory,
  onDeleteCategory,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
  onAddQuiz,
  onEditQuiz,
  onDeleteQuiz,
  onManageQuestions,
}: CourseCardProps) {
  return (
    <div className="group bg-white rounded-xl shadow-[0_2px_8px_rgb(0,0,0,0.04)] border border-slate-200 overflow-hidden">
      {/* Course Header */}
      <CourseHeader
        course={course}
        isExpanded={isExpanded}
        onToggle={onToggle}
        onTogglePublish={onTogglePublish}
        onEdit={onEdit}
        onDelete={onDelete}
        onAddCategory={onAddCategory}
        actionLoading={actionLoading}
      />

      {/* Categories Container */}
      {isExpanded && (
        <div className="bg-[#F8FAFC] flex flex-col p-3 md:p-4 gap-3">
          {course.categories.length === 0 ? (
            <EmptyCategoriesState onAddCategory={onAddCategory} />
          ) : (
            course.categories.map((category) => (
              <CategorySection
                key={category.id}
                category={category}
                courseId={course.id}
                isExpanded={expandedCategories.has(category.id)}
                onToggle={() => onToggleCategory(category.id)}
                onEdit={() => onEditCategory(category)}
                onDelete={() => onDeleteCategory(category.id)}
                onAddLesson={() => onAddLesson(category.id)}
                onEditLesson={onEditLesson}
                onDeleteLesson={onDeleteLesson}
                onAddQuiz={() => onAddQuiz(category)}
                onEditQuiz={onEditQuiz}
                onDeleteQuiz={onDeleteQuiz}
                onManageQuestions={onManageQuestions}
                actionLoading={actionLoading}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

interface CourseHeaderProps {
  course: AdminCourse;
  isExpanded: boolean;
  onToggle: () => void;
  onTogglePublish: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddCategory: () => void;
  actionLoading: string | null;
}

function CourseHeader({
  course,
  isExpanded,
  onToggle,
  onTogglePublish,
  onEdit,
  onDelete,
  onAddCategory,
  actionLoading,
}: CourseHeaderProps) {
  return (
    <div
      className={`flex items-center justify-between p-4 md:p-5 cursor-pointer bg-white hover:bg-slate-50 transition-colors select-none ${
        isExpanded ? "border-b border-slate-100" : ""
      }`}
      onClick={onToggle}
    >
      <div className="flex items-center gap-4 flex-1">
        <span
          className={`material-symbols-outlined text-[#6B7280] text-2xl transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        >
          expand_more
        </span>
        <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center text-[#3A7BD5] shrink-0">
          <span className="material-symbols-outlined text-[28px]">school</span>
        </div>
        <div className="flex flex-col">
          <h3 className="text-lg font-bold text-[#1F2933] leading-tight">
            {course.name || "Untitled Course"}
          </h3>
          <CourseMetadata course={course} />
        </div>
      </div>
      <CourseActions
        course={course}
        onTogglePublish={onTogglePublish}
        onEdit={onEdit}
        onDelete={onDelete}
        onAddCategory={onAddCategory}
        actionLoading={actionLoading}
      />
    </div>
  );
}

function CourseMetadata({ course }: { course: AdminCourse }) {
  return (
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
        • {formatCourseDuration(course.totalDurationSeconds)}
      </span>
    </div>
  );
}

interface CourseActionsProps {
  course: AdminCourse;
  onTogglePublish: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddCategory: () => void;
  actionLoading: string | null;
}

function CourseActions({
  course,
  onTogglePublish,
  onEdit,
  onDelete,
  onAddCategory,
  actionLoading,
}: CourseActionsProps) {
  return (
    <div
      className="flex items-center gap-2 md:gap-3 shrink-0 ml-4"
      onClick={(e) => e.stopPropagation()}
    >
      {actionLoading === `publish-${course.id}` ? (
        <Spinner size="sm" />
      ) : (
        <button
          onClick={onTogglePublish}
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
        onClick={onAddCategory}
        className="p-2 text-[#6B7280] hover:text-[#3A7BD5] hover:bg-blue-50 rounded-lg transition-colors"
        title="Add Category"
      >
        <span className="material-symbols-outlined text-[20px]">
          create_new_folder
        </span>
      </button>
      <button
        onClick={onEdit}
        className="p-2 text-[#6B7280] hover:text-[#3A7BD5] hover:bg-blue-50 rounded-lg transition-colors"
        title="Edit Course"
      >
        <span className="material-symbols-outlined text-[20px]">edit</span>
      </button>
      {actionLoading === `course-${course.id}` ? (
        <Spinner size="sm" />
      ) : (
        <button
          onClick={onDelete}
          className="p-2 text-[#6B7280] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete Course"
        >
          <span className="material-symbols-outlined text-[20px]">delete</span>
        </button>
      )}
    </div>
  );
}

function EmptyCategoriesState({
  onAddCategory,
}: {
  onAddCategory: () => void;
}) {
  return (
    <div className="p-8 text-center">
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="bg-white p-3 rounded-full border border-dashed border-slate-300">
          <span className="material-symbols-outlined text-slate-400">
            folder_off
          </span>
        </div>
        <p className="text-sm text-[#6B7280]">No content in this course yet.</p>
        <button
          onClick={onAddCategory}
          className="text-sm text-[#3A7BD5] font-medium hover:underline"
        >
          Add your first Category
        </button>
      </div>
    </div>
  );
}

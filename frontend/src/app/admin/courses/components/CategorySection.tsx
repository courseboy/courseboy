"use client";

import { AdminCategory, AdminLesson, Quiz } from "@/types";
import { Spinner } from "@/components/ui/spinner";
import { LessonItem } from "./LessonItem";
import { QuizSection } from "./QuizSection";

interface CategorySectionProps {
  category: AdminCategory;
  courseId: number;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddLesson: () => void;
  onEditLesson: (lesson: AdminLesson) => void;
  onDeleteLesson: (lessonId: number) => void;
  onAddQuiz: () => void;
  onEditQuiz: (quiz: Quiz) => void;
  onDeleteQuiz: (quiz: Quiz) => void;
  onManageQuestions: (quiz: Quiz) => void;
  actionLoading: string | null;
}

export function CategorySection({
  category,
  courseId,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
  onAddQuiz,
  onEditQuiz,
  onDeleteQuiz,
  onManageQuestions,
  actionLoading,
}: CategorySectionProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-[#EEF2F7] overflow-hidden">
      {/* Category Header */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-200/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <span
            className={`material-symbols-outlined text-[#6B7280] text-[20px] transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
          >
            expand_more
          </span>
          <span className="material-symbols-outlined text-[#6B7280] text-[20px]">
            folder
          </span>
          <span className="font-medium text-[#1F2933]">{category.name}</span>
          <span className="text-xs text-[#6B7280]">
            ({category.lessonsCount} lessons)
          </span>
        </div>
        <CategoryActions
          onAddLesson={onAddLesson}
          onEdit={onEdit}
          onDelete={onDelete}
          categoryId={category.id}
          actionLoading={actionLoading}
        />
      </div>

      {/* Lessons List */}
      {isExpanded && (
        <div className="px-4 pb-3 pt-1 flex flex-col gap-2">
          {category.lessons.length === 0 ? (
            <EmptyLessonsState onAddLesson={onAddLesson} />
          ) : (
            category.lessons.map((lesson) => (
              <LessonItem
                key={lesson.id}
                lesson={lesson}
                onEdit={() => onEditLesson(lesson)}
                onDelete={() => onDeleteLesson(lesson.id)}
                actionLoading={actionLoading}
              />
            ))
          )}

          {/* Quizzes Section */}
          <QuizSection
            quizzes={category.quizzes || []}
            onAddQuiz={onAddQuiz}
            onEditQuiz={onEditQuiz}
            onDeleteQuiz={onDeleteQuiz}
            onManageQuestions={onManageQuestions}
          />
        </div>
      )}
    </div>
  );
}

interface CategoryActionsProps {
  onAddLesson: () => void;
  onEdit: () => void;
  onDelete: () => void;
  categoryId: number;
  actionLoading: string | null;
}

function CategoryActions({
  onAddLesson,
  onEdit,
  onDelete,
  categoryId,
  actionLoading,
}: CategoryActionsProps) {
  return (
    <div
      className="flex items-center gap-1"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onAddLesson}
        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#3A7BD5] hover:bg-white rounded transition-colors mr-2"
      >
        <span className="material-symbols-outlined text-[16px]">add</span>
        Add Lesson
      </button>
      <button
        onClick={onEdit}
        className="p-1.5 text-[#6B7280] hover:text-[#1F2933] rounded hover:bg-white transition-colors"
      >
        <span className="material-symbols-outlined text-[18px]">edit</span>
      </button>
      {actionLoading === `category-${categoryId}` ? (
        <Spinner size="sm" />
      ) : (
        <button
          onClick={onDelete}
          className="p-1.5 text-[#6B7280] hover:text-red-500 rounded hover:bg-white transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">delete</span>
        </button>
      )}
    </div>
  );
}

function EmptyLessonsState({ onAddLesson }: { onAddLesson: () => void }) {
  return (
    <div className="p-4 text-center bg-white rounded-md border border-dashed border-slate-200">
      <p className="text-sm text-[#6B7280]">No lessons yet.</p>
      <button
        onClick={onAddLesson}
        className="text-sm text-[#3A7BD5] font-medium hover:underline mt-1"
      >
        Add your first lesson
      </button>
    </div>
  );
}

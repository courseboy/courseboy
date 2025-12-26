"use client";

import { Quiz } from "@/types";

interface QuizSectionProps {
  quizzes: Quiz[];
  onAddQuiz: () => void;
  onEditQuiz: (quiz: Quiz) => void;
  onDeleteQuiz: (quiz: Quiz) => void;
  onManageQuestions: (quiz: Quiz) => void;
}

export function QuizSection({
  quizzes,
  onAddQuiz,
  onEditQuiz,
  onDeleteQuiz,
  onManageQuestions,
}: QuizSectionProps) {
  return (
    <div className="mt-4 pt-4 border-t border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#F4A261] text-lg">
            quiz
          </span>
          <span className="text-sm font-semibold text-[#1F2933]">
            Quizzes ({quizzes.length})
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAddQuiz();
          }}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#F4A261] hover:bg-[#E8954F] rounded-md transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-[14px]">add</span>
          Add Quiz
        </button>
      </div>

      {quizzes.length === 0 ? (
        <EmptyQuizzesState />
      ) : (
        <div className="flex flex-col gap-2">
          {quizzes.map((quiz) => (
            <QuizItem
              key={quiz.id}
              quiz={quiz}
              onEdit={() => onEditQuiz(quiz)}
              onDelete={() => onDeleteQuiz(quiz)}
              onManageQuestions={() => onManageQuestions(quiz)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyQuizzesState() {
  return (
    <div className="p-3 text-center bg-orange-50/50 rounded-md border border-dashed border-orange-200">
      <p className="text-xs text-[#6B7280]">
        No quizzes yet. Add a quiz using a Google Form link.
      </p>
    </div>
  );
}

interface QuizItemProps {
  quiz: Quiz;
  onEdit: () => void;
  onDelete: () => void;
  onManageQuestions: () => void;
}

function QuizItem({
  quiz,
  onEdit,
  onDelete,
  onManageQuestions,
}: QuizItemProps) {
  return (
    <div className="flex items-center justify-between bg-orange-50/50 p-3 rounded-md border border-orange-200 hover:border-[#F4A261]/50 transition-colors group/quiz">
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
            {quiz._count?.questions || 0} Questions • Pass: {quiz.passingScore}%
          </span>
        </div>
      </div>
      <QuizActions
        onManageQuestions={onManageQuestions}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}

interface QuizActionsProps {
  onManageQuestions: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function QuizActions({
  onManageQuestions,
  onEdit,
  onDelete,
}: QuizActionsProps) {
  return (
    <div className="flex items-center gap-1 opacity-0 group-hover/quiz:opacity-100 transition-opacity">
      <button
        onClick={onManageQuestions}
        className="p-1.5 text-[#6B7280] hover:text-green-600 rounded hover:bg-green-50"
        title="Manage Questions"
      >
        <span className="material-symbols-outlined text-[18px]">quiz</span>
      </button>
      <button
        onClick={onEdit}
        className="p-1.5 text-[#6B7280] hover:text-[#3A7BD5] rounded hover:bg-white"
        title="Edit Quiz Settings"
      >
        <span className="material-symbols-outlined text-[18px]">edit</span>
      </button>
      <button
        onClick={onDelete}
        className="p-1.5 text-[#6B7280] hover:text-red-500 rounded hover:bg-red-50"
        title="Delete Quiz"
      >
        <span className="material-symbols-outlined text-[18px]">delete</span>
      </button>
    </div>
  );
}

"use client";

import { AdminLesson } from "@/types";
import { Spinner } from "@/components/ui/spinner";
import { formatLessonDuration } from "../utils";

interface LessonItemProps {
  lesson: AdminLesson;
  onEdit: () => void;
  onDelete: () => void;
  actionLoading: string | null;
}

export function LessonItem({
  lesson,
  onEdit,
  onDelete,
  actionLoading,
}: LessonItemProps) {
  return (
    <div className="flex items-center justify-between bg-white p-3 rounded-md border border-slate-200 shadow-sm hover:border-[#3A7BD5]/30 transition-colors group/lesson">
      <div className="flex items-center gap-3 overflow-hidden">
        <span className="material-symbols-outlined text-slate-300 cursor-grab hover:text-[#6B7280]">
          drag_indicator
        </span>
        <LessonIcon hasVideo={!!lesson.videoUrl} />
        <LessonInfo lesson={lesson} />
      </div>
      <LessonActions
        lessonId={lesson.id}
        onEdit={onEdit}
        onDelete={onDelete}
        actionLoading={actionLoading}
      />
    </div>
  );
}

function LessonIcon({ hasVideo }: { hasVideo: boolean }) {
  return (
    <div
      className={`h-8 w-8 rounded flex items-center justify-center shrink-0 ${
        hasVideo ? "bg-blue-50 text-[#3A7BD5]" : "bg-slate-100 text-slate-400"
      }`}
    >
      <span className="material-symbols-outlined text-[18px]">
        {hasVideo ? "play_circle" : "videocam_off"}
      </span>
    </div>
  );
}

function LessonInfo({ lesson }: { lesson: AdminLesson }) {
  return (
    <div className="flex flex-col min-w-0">
      <span className="text-sm font-medium text-[#1F2933] truncate">
        {lesson.title || "Untitled Lesson"}
      </span>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-[#6B7280] uppercase tracking-wider font-semibold">
          Video • {formatLessonDuration(lesson.durationSeconds)}
        </span>
        {lesson.isFreePreview && (
          <span className="text-[10px] bg-[#F4A261]/20 text-[#F4A261] px-1.5 py-0.5 rounded font-semibold">
            FREE PREVIEW
          </span>
        )}
      </div>
    </div>
  );
}

interface LessonActionsProps {
  lessonId: number;
  onEdit: () => void;
  onDelete: () => void;
  actionLoading: string | null;
}

function LessonActions({
  lessonId,
  onEdit,
  onDelete,
  actionLoading,
}: LessonActionsProps) {
  return (
    <div className="flex items-center gap-1 opacity-0 group-hover/lesson:opacity-100 transition-opacity">
      <button
        onClick={onEdit}
        className="p-1.5 text-[#6B7280] hover:text-[#3A7BD5] rounded hover:bg-slate-50"
      >
        <span className="material-symbols-outlined text-[18px]">edit</span>
      </button>
      {actionLoading === `lesson-${lessonId}` ? (
        <Spinner size="sm" />
      ) : (
        <button
          onClick={onDelete}
          className="p-1.5 text-[#6B7280] hover:text-red-500 rounded hover:bg-red-50"
        >
          <span className="material-symbols-outlined text-[18px]">delete</span>
        </button>
      )}
    </div>
  );
}

"use client";

interface PageHeaderProps {
  onCreateCourse: () => void;
}

export function PageHeader({ onCreateCourse }: PageHeaderProps) {
  return (
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
        onClick={onCreateCourse}
        className="inline-flex items-center justify-center gap-2 bg-[#3A7BD5] hover:bg-[#2c62b0] text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all active:scale-95"
      >
        <span className="material-symbols-outlined text-[20px]">
          add_circle
        </span>
        <span>Create New Course</span>
      </button>
    </div>
  );
}

interface EmptyCoursesStateProps {
  onCreateCourse: () => void;
}

export function EmptyCoursesState({ onCreateCourse }: EmptyCoursesStateProps) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center">
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="bg-slate-100 p-3 rounded-full">
          <span className="material-symbols-outlined text-slate-400 text-3xl">
            school
          </span>
        </div>
        <p className="text-[#6B7280] mt-2">No courses yet.</p>
        <button
          onClick={onCreateCourse}
          className="text-sm text-[#3A7BD5] font-medium hover:underline mt-2"
        >
          Create your first course
        </button>
      </div>
    </div>
  );
}

interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
      {message}
    </div>
  );
}

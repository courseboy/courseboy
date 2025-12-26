interface Course {
  id: number;
  name: string;
}

interface Quiz {
  id: number;
  name: string;
}

interface AnalyticsFiltersProps {
  courses: Course[];
  quizzes: Quiz[];
  selectedCourseId: number | undefined;
  selectedQuizId: number | undefined;
  onCourseChange: (courseId: number | undefined) => void;
  onQuizChange: (quizId: number | undefined) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const SELECT_BASE_STYLES =
  "rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

function parseFilterValue(value: string): number | undefined {
  return value ? parseInt(value, 10) : undefined;
}

export function AnalyticsFilters({
  courses,
  quizzes,
  selectedCourseId,
  selectedQuizId,
  onCourseChange,
  onQuizChange,
  onClearFilters,
  hasActiveFilters,
}: AnalyticsFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Course Filter */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">Course:</label>
        <select
          value={selectedCourseId || ""}
          onChange={(e) => onCourseChange(parseFilterValue(e.target.value))}
          className={SELECT_BASE_STYLES}
        >
          <option value="">All Courses</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>
      </div>

      {/* Quiz Filter */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">Quiz:</label>
        <select
          value={selectedQuizId || ""}
          onChange={(e) => onQuizChange(parseFilterValue(e.target.value))}
          className={SELECT_BASE_STYLES}
        >
          <option value="">All Quizzes</option>
          {quizzes.map((quiz) => (
            <option key={quiz.id} value={quiz.id}>
              {quiz.name}
            </option>
          ))}
        </select>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="flex items-center gap-1 rounded-lg bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
        >
          <span className="material-symbols-outlined text-sm">close</span>
          Clear Filters
        </button>
      )}
    </div>
  );
}

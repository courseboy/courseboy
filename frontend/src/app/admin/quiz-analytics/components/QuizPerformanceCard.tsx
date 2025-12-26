import { QuizPerformance } from "@/types";
import { getPassRateStyle } from "../utils";

interface QuizPerformanceRowProps {
  quiz: QuizPerformance;
}

function QuizPerformanceRow({ quiz }: QuizPerformanceRowProps) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{quiz.name}</p>
        <p className="text-xs text-gray-500">{quiz.attempts} attempts</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900">
            {quiz.avgScore}%
          </p>
          <p className="text-xs text-gray-500">avg score</p>
        </div>
        <div
          className={`rounded-full px-3 py-1 text-sm font-semibold ${getPassRateStyle(
            quiz.passRate
          )}`}
        >
          {quiz.passRate}% pass
        </div>
      </div>
    </div>
  );
}

interface QuizPerformanceCardProps {
  quizzes: QuizPerformance[];
  maxDisplayCount?: number;
}

export function QuizPerformanceCard({
  quizzes,
  maxDisplayCount = 5,
}: QuizPerformanceCardProps) {
  const displayedQuizzes = quizzes.slice(0, maxDisplayCount);

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Quiz Performance
      </h2>
      {quizzes.length === 0 ? (
        <p className="py-4 text-center text-gray-500">No quiz data yet</p>
      ) : (
        <div className="space-y-3">
          {displayedQuizzes.map((quiz) => (
            <QuizPerformanceRow key={quiz.id} quiz={quiz} />
          ))}
        </div>
      )}
    </div>
  );
}

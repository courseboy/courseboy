"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { quizApi, courseApi } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";
import { QuizResults } from "@/types";
import Link from "next/link";

export default function QuizResultsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const courseId = parseInt(params.id as string);
  const quizId = parseInt(searchParams.get("quiz") || "0");

  // Fetch quiz results
  const {
    data: results,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["quiz-results", quizId],
    queryFn: async () => {
      const response = await quizApi.getResults(quizId);
      return response.data.data as QuizResults;
    },
    enabled: !!quizId,
  });

  // Fetch course for navigation
  const { data: courseData } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const response = await courseApi.getById(courseId);
      return response.data.data;
    },
    enabled: !!courseId,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-gray-300 mb-4">
            error
          </span>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Results Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            You need to complete the quiz first to view results.
          </p>
          <Link
            href={`/courses/${courseId}/learn`}
            className="text-[#3A7BD5] hover:underline"
          >
            ← Back to Course
          </Link>
        </div>
      </div>
    );
  }

  const correctCount = results.questions.filter((q) => q.isCorrect).length;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href={`/courses/${courseId}/learn`}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                {results.quiz.name} - Results
              </h1>
              {courseData && (
                <p className="text-sm text-gray-500">{courseData.name}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Score Summary */}
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div
          className={`rounded-xl p-8 shadow-sm mb-8 ${
            results.submission.passed
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full ${
                  results.submission.passed ? "bg-green-100" : "bg-red-100"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-3xl ${
                    results.submission.passed
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {results.submission.passed ? "check_circle" : "cancel"}
                </span>
              </div>
              <div>
                <h2
                  className={`text-2xl font-bold ${
                    results.submission.passed
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  {results.submission.passed
                    ? "Quiz Passed!"
                    : "Quiz Not Passed"}
                </h2>
                <p className="text-gray-600">
                  Passing score: {results.quiz.passingScore}%
                </p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <div
                className={`text-5xl font-bold ${
                  results.submission.passed ? "text-green-600" : "text-red-600"
                }`}
              >
                {results.submission.percentage}%
              </div>
              <div className="text-gray-600">
                {correctCount} of {results.questions.length} correct
              </div>
              <div className="text-sm text-gray-500">
                Score: {results.submission.score} /{" "}
                {results.submission.maxScore} pts
              </div>
            </div>
          </div>
        </div>

        {/* Questions Review */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b">
            <h3 className="text-lg font-bold text-gray-900">Question Review</h3>
            <p className="text-sm text-gray-500">Review your answers</p>
          </div>
          <div className="divide-y">
            {results.questions.map((question, index) => (
              <div key={question.id} className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                      question.isCorrect ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-lg ${
                        question.isCorrect ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {question.isCorrect ? "check" : "close"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-gray-500">
                        Question {index + 1}
                      </span>
                      <span className="text-xs text-gray-400">
                        {question.points} {question.points === 1 ? "pt" : "pts"}
                      </span>
                    </div>
                    <p className="text-gray-900 font-medium mb-4">
                      {question.questionText}
                    </p>

                    <div className="space-y-2">
                      {question.options.map((option, optIndex) => {
                        const isUserAnswer = question.userAnswer === optIndex;
                        const isCorrectAnswer =
                          question.correctAnswer === optIndex;

                        let bgClass = "bg-gray-50";
                        let borderClass = "border-gray-200";
                        let textClass = "text-gray-600";

                        if (isCorrectAnswer) {
                          bgClass = "bg-green-50";
                          borderClass = "border-green-300";
                          textClass = "text-green-800";
                        } else if (isUserAnswer && !isCorrectAnswer) {
                          bgClass = "bg-red-50";
                          borderClass = "border-red-300";
                          textClass = "text-red-800";
                        }

                        return (
                          <div
                            key={optIndex}
                            className={`flex items-center gap-3 p-3 rounded-lg border ${bgClass} ${borderClass}`}
                          >
                            <div
                              className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold ${
                                isCorrectAnswer
                                  ? "border-green-500 bg-green-500 text-white"
                                  : isUserAnswer
                                  ? "border-red-500 bg-red-500 text-white"
                                  : "border-gray-300 text-gray-500"
                              }`}
                            >
                              {String.fromCharCode(65 + optIndex)}
                            </div>
                            <span className={`text-sm ${textClass}`}>
                              {option}
                            </span>
                            {isCorrectAnswer && (
                              <span className="ml-auto text-xs font-semibold text-green-600 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">
                                  check
                                </span>
                                Correct
                              </span>
                            )}
                            {isUserAnswer && !isCorrectAnswer && (
                              <span className="ml-auto text-xs font-semibold text-red-600 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">
                                  close
                                </span>
                                Your answer
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href={`/courses/${courseId}/learn`}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <span className="material-symbols-outlined text-lg">
              arrow_back
            </span>
            Back to Course
          </Link>
          {!results.submission.passed && (
            <Link
              href={`/courses/${courseId}/quiz?quiz=${quizId}`}
              className="inline-flex items-center gap-2 rounded-lg bg-[#3A7BD5] px-6 py-3 text-sm font-semibold text-white hover:bg-[#2E6BC4]"
            >
              <span className="material-symbols-outlined text-lg">refresh</span>
              Retake Quiz
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

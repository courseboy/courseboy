"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { quizApi, courseApi } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";
import { QuizQuestion, QuizSubmitResult } from "@/types";
import Link from "next/link";

export default function QuizPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const courseId = parseInt(params.id as string);
  const quizId = parseInt(searchParams.get("quiz") || "0");

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [startTime] = useState(Date.now());
  const [showResults, setShowResults] = useState(false);
  const [submitResult, setSubmitResult] = useState<QuizSubmitResult | null>(
    null
  );

  // Fetch quiz data
  const {
    data: quizData,
    isLoading: quizLoading,
    error: quizError,
  } = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: async () => {
      const response = await quizApi.getById(quizId);
      return response.data.data;
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

  // Timer effect
  useEffect(() => {
    if (quizData?.timeLimit && !showResults) {
      setTimeRemaining(quizData.timeLimit * 60);

      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 0) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizData?.timeLimit, showResults]);

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      const timeTaken = Math.round((Date.now() - startTime) / 1000);
      const response = await quizApi.submit(quizId, answers, timeTaken);
      return response.data.data as QuizSubmitResult;
    },
    onSuccess: (data) => {
      setSubmitResult(data);
      setShowResults(true);
      // Invalidate course cache so learn page shows updated quiz results
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
    },
  });

  const handleSubmit = () => {
    submitMutation.mutate();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (quizLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <Spinner size="lg" />
      </div>
    );
  }

  if (quizError || !quizData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-gray-300 mb-4">
            error
          </span>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Quiz Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The quiz you&apos;re looking for doesn&apos;t exist.
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

  // Already completed - show results
  if (quizData.isCompleted && !showResults) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="mx-auto max-w-2xl px-4">
          <div className="rounded-xl bg-white p-8 shadow-sm text-center">
            <div
              className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                quizData.hasPassed ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <span
                className={`material-symbols-outlined text-3xl ${
                  quizData.hasPassed ? "text-green-600" : "text-red-600"
                }`}
              >
                {quizData.hasPassed ? "check_circle" : "cancel"}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {quizData.hasPassed ? "Quiz Passed!" : "Quiz Not Passed"}
            </h2>
            <p className="text-gray-600 mb-6">
              You&apos;ve already completed this quiz.
            </p>
            {quizData.userSubmission && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {quizData.userSubmission.percentage}%
                </div>
                <div className="text-gray-600">
                  Score: {quizData.userSubmission.score} /{" "}
                  {quizData.userSubmission.maxScore}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Passing: {quizData.passingScore}%
                </div>
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <Link
                href={`/courses/${courseId}/learn`}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <span className="material-symbols-outlined text-lg">
                  arrow_back
                </span>
                Back to Course
              </Link>
              <Link
                href={`/courses/${courseId}/quiz/results?quiz=${quizId}`}
                className="inline-flex items-center gap-2 rounded-lg bg-[#3A7BD5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2E6BC4]"
              >
                <span className="material-symbols-outlined text-lg">
                  visibility
                </span>
                View Results
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show results after submission
  if (showResults && submitResult) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="mx-auto max-w-2xl px-4">
          <div className="rounded-xl bg-white p-8 shadow-sm text-center">
            <div
              className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                submitResult.submission.passed ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <span
                className={`material-symbols-outlined text-3xl ${
                  submitResult.submission.passed
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {submitResult.submission.passed ? "check_circle" : "cancel"}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {submitResult.submission.passed
                ? "Quiz Passed!"
                : "Quiz Not Passed"}
            </h2>
            <p className="text-gray-600 mb-6">
              {submitResult.isNewRecord
                ? "Your answers have been recorded."
                : "Your previous score was higher."}
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {submitResult.submission.percentage}%
              </div>
              <div className="text-gray-600">
                {submitResult.questionsCorrect} / {submitResult.questionsTotal}{" "}
                correct
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Score: {submitResult.submission.score} /{" "}
                {submitResult.submission.maxScore} pts
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <Link
                href={`/courses/${courseId}/learn`}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <span className="material-symbols-outlined text-lg">
                  arrow_back
                </span>
                Back to Course
              </Link>
              <Link
                href={`/courses/${courseId}/quiz/results?quiz=${quizId}`}
                className="inline-flex items-center gap-2 rounded-lg bg-[#3A7BD5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2E6BC4]"
              >
                <span className="material-symbols-outlined text-lg">
                  visibility
                </span>
                View Detailed Results
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const questions: QuizQuestion[] = quizData.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;

  if (questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-gray-300 mb-4">
            quiz
          </span>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Questions</h2>
          <p className="text-gray-600 mb-4">
            This quiz doesn&apos;t have any questions yet.
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/courses/${courseId}/learn`}
                className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
              >
                <span className="material-symbols-outlined">arrow_back</span>
                <span className="hidden sm:inline">Exit Quiz</span>
              </Link>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  {quizData.name}
                </h1>
                {courseData && (
                  <p className="text-sm text-gray-500">{courseData.name}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {timeRemaining !== null && (
                <div
                  className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                    timeRemaining < 60
                      ? "bg-red-100 text-red-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">
                    timer
                  </span>
                  <span className="font-mono font-semibold">
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              )}
              <div className="text-sm text-gray-600">
                {answeredCount} / {questions.length} answered
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Question Navigation (Sidebar) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-4 shadow-sm sticky top-20">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Questions
              </h3>
              <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                {questions.map((q, index) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`h-9 w-9 rounded-lg text-sm font-semibold transition-colors ${
                      currentQuestionIndex === index
                        ? "bg-[#3A7BD5] text-white"
                        : answers[q.id] !== undefined
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <button
                  onClick={handleSubmit}
                  disabled={submitMutation.isPending || !allAnswered}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitMutation.isPending ? (
                    <Spinner size="sm" />
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">
                        send
                      </span>
                      Submit Quiz
                    </>
                  )}
                </button>
                {!allAnswered && (
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Answer all questions to submit
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              {/* Question Header */}
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span className="text-sm text-gray-500">
                  {currentQuestion.points}{" "}
                  {currentQuestion.points === 1 ? "point" : "points"}
                </span>
              </div>

              {/* Question Text */}
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {currentQuestion.questionText}
              </h2>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      setAnswers((prev) => ({
                        ...prev,
                        [currentQuestion.id]: index,
                      }))
                    }
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      answers[currentQuestion.id] === index
                        ? "border-[#3A7BD5] bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold ${
                          answers[currentQuestion.id] === index
                            ? "border-[#3A7BD5] bg-[#3A7BD5] text-white"
                            : "border-gray-300 text-gray-500"
                        }`}
                      >
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span
                        className={`text-base ${
                          answers[currentQuestion.id] === index
                            ? "text-gray-900 font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        {option}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <button
                  onClick={() =>
                    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
                  }
                  disabled={currentQuestionIndex === 0}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-lg">
                    chevron_left
                  </span>
                  Previous
                </button>
                {currentQuestionIndex < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-[#3A7BD5] text-sm font-semibold text-white hover:bg-[#2E6BC4]"
                  >
                    Next
                    <span className="material-symbols-outlined text-lg">
                      chevron_right
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitMutation.isPending || !allAnswered}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-green-500 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-50"
                  >
                    {submitMutation.isPending ? (
                      <Spinner size="sm" />
                    ) : (
                      <>
                        Submit Quiz
                        <span className="material-symbols-outlined text-lg">
                          send
                        </span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

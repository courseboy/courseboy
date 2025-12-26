"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminCourseApi, courseApi } from "@/lib/api";
import { LoadingScreen } from "@/components/ui/spinner";
import {
  QuizAnalyticsOverview,
  RecentSubmission,
  StrugglingUser,
  QuizPerformance,
} from "@/types";

function formatTime(seconds: number | null): string {
  if (!seconds) return "-";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function QuizAnalyticsPage() {
  const [selectedCourseId, setSelectedCourseId] = useState<number | undefined>(
    undefined
  );
  const [selectedQuizId, setSelectedQuizId] = useState<number | undefined>(
    undefined
  );

  // Fetch courses for filter
  const { data: coursesData } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const response = await courseApi.getAll();
      return response.data.data;
    },
  });

  // Fetch all quizzes (without quiz filter) to populate quiz dropdown
  const { data: allQuizzesData } = useQuery<QuizAnalyticsOverview>({
    queryKey: ["quiz-analytics-quizzes", selectedCourseId],
    queryFn: async () => {
      const response = await adminCourseApi.getAnalyticsOverview(
        selectedCourseId,
        undefined // Don't filter by quiz here - we need all quizzes for the dropdown
      );
      return response.data.data;
    },
  });

  // Fetch filtered analytics (with quiz filter applied)
  const {
    data: analytics,
    isLoading,
    error,
  } = useQuery<QuizAnalyticsOverview>({
    queryKey: ["quiz-analytics", selectedCourseId, selectedQuizId],
    queryFn: async () => {
      const response = await adminCourseApi.getAnalyticsOverview(
        selectedCourseId,
        selectedQuizId
      );
      return response.data.data;
    },
  });

  // Get quizzes from unfiltered data for the quiz dropdown
  const availableQuizzes = allQuizzesData?.quizPerformance || [];

  // Reset quiz filter when course changes
  const handleCourseChange = (courseId: number | undefined) => {
    setSelectedCourseId(courseId);
    setSelectedQuizId(undefined); // Reset quiz selection when course changes
  };

  if (isLoading) return <LoadingScreen />;

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          Failed to load analytics. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quiz Analytics</h1>
          <p className="text-sm text-gray-500">
            Monitor quiz performance and identify areas for improvement
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Course Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Course:</label>
            <select
              value={selectedCourseId || ""}
              onChange={(e) =>
                handleCourseChange(
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Courses</option>
              {coursesData?.map((course: { id: number; name: string }) => (
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
              onChange={(e) =>
                setSelectedQuizId(
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Quizzes</option>
              {availableQuizzes.map((quiz: { id: number; name: string }) => (
                <option key={quiz.id} value={quiz.id}>
                  {quiz.name}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {(selectedCourseId || selectedQuizId) && (
            <button
              onClick={() => {
                setSelectedCourseId(undefined);
                setSelectedQuizId(undefined);
              }}
              className="flex items-center gap-1 rounded-lg bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
            >
              <span className="material-symbols-outlined text-sm">close</span>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Attempts"
          value={analytics?.stats.totalAttempts || 0}
          icon="assignment"
          color="blue"
        />
        <StatCard
          title="Pass Rate"
          value={`${analytics?.stats.passRate || 0}%`}
          subtitle={`${analytics?.stats.passedCount || 0} passed, ${
            analytics?.stats.failedCount || 0
          } failed`}
          icon="check_circle"
          color="green"
        />
        <StatCard
          title="Avg Score"
          value={`${analytics?.stats.avgScore || 0}%`}
          icon="trending_up"
          color="purple"
        />
        <StatCard
          title="Avg Time"
          value={formatTime(analytics?.stats.avgTimeTaken || 0)}
          icon="timer"
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Score Distribution */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Score Distribution
          </h2>
          <div className="space-y-3">
            {analytics?.scoreDistribution.map((item) => {
              const maxCount = Math.max(
                ...analytics.scoreDistribution.map((d) => d.count),
                1
              );
              const width = (item.count / maxCount) * 100;
              return (
                <div key={item.range} className="flex items-center gap-3">
                  <span className="w-16 text-sm font-medium text-gray-600">
                    {item.range}%
                  </span>
                  <div className="flex-1">
                    <div className="h-8 overflow-hidden rounded-lg bg-gray-100">
                      <div
                        className={`h-full transition-all ${
                          item.range === "81-100"
                            ? "bg-green-500"
                            : item.range === "61-80"
                            ? "bg-blue-500"
                            : item.range === "41-60"
                            ? "bg-yellow-500"
                            : item.range === "21-40"
                            ? "bg-orange-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-12 text-right text-sm font-semibold text-gray-800">
                    {item.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quiz Performance */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Quiz Performance
          </h2>
          {analytics?.quizPerformance.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No quiz data yet</p>
          ) : (
            <div className="space-y-3">
              {analytics?.quizPerformance.slice(0, 5).map((quiz) => (
                <QuizPerformanceRow key={quiz.id} quiz={quiz} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Submissions */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Recent Submissions
          </h2>
          {analytics?.recentSubmissions.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No submissions yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      User
                    </th>
                    <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Quiz
                    </th>
                    <th className="pb-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Score
                    </th>
                    <th className="pb-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {analytics?.recentSubmissions.map((submission) => (
                    <SubmissionRow
                      key={submission.id}
                      submission={submission}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Struggling Users */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
            <span className="material-symbols-outlined text-orange-500">
              warning
            </span>
            Users Needing Attention
          </h2>
          {analytics?.strugglingUsers.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              No struggling users - great job! 🎉
            </p>
          ) : (
            <div className="space-y-3">
              {analytics?.strugglingUsers.map((user) => (
                <StrugglingUserRow key={user.user.id} data={user} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color: "blue" | "green" | "purple" | "orange";
}) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className={`rounded-full p-3 ${colorClasses[color]}`}>
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );
}

// Quiz Performance Row
function QuizPerformanceRow({ quiz }: { quiz: QuizPerformance }) {
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
          className={`rounded-full px-3 py-1 text-sm font-semibold ${
            quiz.passRate >= 70
              ? "bg-green-100 text-green-700"
              : quiz.passRate >= 50
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {quiz.passRate}% pass
        </div>
      </div>
    </div>
  );
}

// Submission Row
function SubmissionRow({ submission }: { submission: RecentSubmission }) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="py-3">
        <div>
          <p className="font-medium text-gray-900">
            {submission.user.username || submission.user.email.split("@")[0]}
          </p>
          <p className="text-xs text-gray-500">{submission.user.email}</p>
        </div>
      </td>
      <td className="py-3">
        <div>
          <p className="font-medium text-gray-900">{submission.quiz.name}</p>
          <p className="text-xs text-gray-500">{submission.course.name}</p>
        </div>
      </td>
      <td className="py-3 text-center">
        <span className="font-semibold text-gray-900">
          {submission.percentage}%
        </span>
        <span className="ml-1 text-xs text-gray-500">
          ({submission.score}/{submission.maxScore})
        </span>
      </td>
      <td className="py-3 text-center">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            submission.passed
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {submission.passed ? "✓ Passed" : "✗ Failed"}
        </span>
      </td>
      <td className="py-3 text-right text-sm text-gray-500">
        {formatDate(submission.submittedAt)}
      </td>
    </tr>
  );
}

// Struggling User Row
function StrugglingUserRow({ data }: { data: StrugglingUser }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-200">
          <span className="material-symbols-outlined text-orange-700">
            person
          </span>
        </div>
        <div>
          <p className="font-medium text-gray-900">
            {data.user.username || data.user.email.split("@")[0]}
          </p>
          <p className="text-xs text-gray-500">{data.user.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-semibold text-red-600">
            {data.failedQuizzes} failed
          </p>
          <p className="text-xs text-gray-500">
            of {data.totalAttempts} attempts
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900">
            {data.avgScore}%
          </p>
          <p className="text-xs text-gray-500">avg score</p>
        </div>
      </div>
    </div>
  );
}

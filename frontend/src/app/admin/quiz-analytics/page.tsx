"use client";

import { LoadingScreen } from "@/components/ui/spinner";
import {
  useAnalyticsFilters,
  useCourses,
  useAvailableQuizzes,
  useQuizAnalytics,
} from "./hooks";
import { formatDuration } from "./utils";
import {
  AnalyticsFilters,
  QuizPerformanceCard,
  RecentSubmissionsCard,
  ScoreDistributionCard,
  StatCard,
  StrugglingUsersCard,
} from "./components";

export default function QuizAnalyticsPage() {
  const filters = useAnalyticsFilters();

  const { data: courses = [] } = useCourses();
  const { availableQuizzes } = useAvailableQuizzes(filters.selectedCourseId);
  const { data: analytics, isLoading, error } = useQuizAnalytics(
    filters.selectedCourseId,
    filters.selectedQuizId
  );

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          Failed to load analytics. Please try again.
        </div>
      </div>
    );
  }

  const stats = analytics?.stats;

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

        <AnalyticsFilters
          courses={courses}
          quizzes={availableQuizzes}
          selectedCourseId={filters.selectedCourseId}
          selectedQuizId={filters.selectedQuizId}
          onCourseChange={filters.handleCourseChange}
          onQuizChange={filters.handleQuizChange}
          onClearFilters={filters.clearFilters}
          hasActiveFilters={filters.hasActiveFilters}
        />
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Attempts"
          value={stats?.totalAttempts || 0}
          icon="assignment"
          color="blue"
        />
        <StatCard
          title="Pass Rate"
          value={`${stats?.passRate || 0}%`}
          subtitle={`${stats?.passedCount || 0} passed, ${stats?.failedCount || 0} failed`}
          icon="check_circle"
          color="green"
        />
        <StatCard
          title="Avg Score"
          value={`${stats?.avgScore || 0}%`}
          icon="trending_up"
          color="purple"
        />
        <StatCard
          title="Avg Time"
          value={formatDuration(stats?.avgTimeTaken || 0)}
          icon="timer"
          color="orange"
        />
      </div>

      {/* Performance Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ScoreDistributionCard distribution={analytics?.scoreDistribution || []} />
        <QuizPerformanceCard quizzes={analytics?.quizPerformance || []} />
      </div>

      {/* Details Row */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentSubmissionsCard submissions={analytics?.recentSubmissions || []} />
        <StrugglingUsersCard users={analytics?.strugglingUsers || []} />
      </div>
    </div>
  );
}

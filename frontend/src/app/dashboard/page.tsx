"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store/auth";
import { userApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/spinner";
import { BookOpen, Clock, Award, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const { data: progressData, isLoading } = useQuery({
    queryKey: ["userProgress"],
    queryFn: async () => {
      const response = await userApi.getProgress();
      return response.data.data;
    },
    enabled: isAuthenticated,
  });

  if (!isAuthenticated || isLoading) {
    return <LoadingScreen />;
  }

  const progress = progressData || [];

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.username || "Learner"}!
        </h1>
        <p className="mt-2 text-secondary-600">
          Track your learning progress and continue where you left off.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<BookOpen className="h-6 w-6" />}
          title="Courses in Progress"
          value={progress.length.toString()}
          color="primary"
        />
        <StatCard
          icon={<Clock className="h-6 w-6" />}
          title="Total Watch Time"
          value={formatWatchTime(
            progress.reduce(
              (sum: number, p: any) => sum + p.totalWatchedSeconds,
              0
            )
          )}
          color="blue"
        />
        <StatCard
          icon={<TrendingUp className="h-6 w-6" />}
          title="Lessons Completed"
          value={progress
            .reduce((sum: number, p: any) => sum + p.completedLessons, 0)
            .toString()}
          color="green"
        />
        <StatCard
          icon={<Award className="h-6 w-6" />}
          title="Certificates Earned"
          value="0"
          color="yellow"
        />
      </div>

      {/* Continue Learning */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Continue Learning</h2>
          <Link href="/courses">
            <Button variant="outline">Browse All Courses</Button>
          </Link>
        </div>

        {progress.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-secondary-400" />
              <h3 className="mt-4 text-lg font-semibold">No courses yet</h3>
              <p className="mt-2 text-secondary-600">
                Start learning by enrolling in a course
              </p>
              <Link href="/courses">
                <Button className="mt-4">Browse Courses</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {progress.map((course: any) => (
              <Card key={course.courseId}>
                <CardHeader>
                  <CardTitle className="text-lg">{course.courseName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary-600">Progress</span>
                      <span className="font-medium">
                        {course.completedLessons} lessons completed
                      </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary-200">
                      <div
                        className="h-full bg-primary-600 transition-all"
                        style={{ width: "30%" }}
                      />
                    </div>
                  </div>
                  <Link href={`/courses/${course.courseId}`}>
                    <Button className="w-full" variant="outline">
                      Continue
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: "primary" | "blue" | "green" | "yellow";
}) {
  const colorClasses = {
    primary: "bg-primary-100 text-primary-600",
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
  };

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className={`rounded-lg p-3 ${colorClasses[color]}`}>{icon}</div>
        <div>
          <p className="text-sm text-secondary-600">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function formatWatchTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

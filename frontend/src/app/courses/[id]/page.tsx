"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { courseApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingScreen } from "@/components/ui/spinner";
import { formatDuration } from "@/lib/utils";
import {
  Star,
  Clock,
  BookOpen,
  Play,
  Lock,
  CheckCircle,
  Award,
} from "lucide-react";

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = parseInt(params.id as string);

  const { data, isLoading, error } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const response = await courseApi.getById(courseId);
      return response.data.data;
    },
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !data) {
    return (
      <div className="container py-12 text-center">
        <p className="text-red-600">Course not found or failed to load.</p>
        <Link href="/courses">
          <Button className="mt-4">Back to Courses</Button>
        </Link>
      </div>
    );
  }

  const course = data;

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Hero Section */}
      <div className="bg-secondary-900 text-white">
        <div className="container py-12">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h1 className="text-3xl font-bold lg:text-4xl">{course.name}</h1>
              <p className="mt-4 text-lg text-secondary-300">
                {course.description}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
                {course.averageRating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">
                      {course.averageRating.toFixed(1)}
                    </span>
                    <span className="text-secondary-400">
                      ({course.feedbacksCount} reviews)
                    </span>
                  </span>
                )}
                <span className="flex items-center gap-1 text-secondary-300">
                  <BookOpen className="h-5 w-5" />
                  {course.categories?.reduce(
                    (sum: number, cat: any) => sum + cat.lessons.length,
                    0
                  )}{" "}
                  lessons
                </span>
              </div>

              {course.userProgress && (
                <div className="mt-6">
                  <div className="flex items-center justify-between text-sm">
                    <span>Your Progress</span>
                    <span>{course.userProgress.percentage}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary-700">
                    <div
                      className="h-full bg-primary-500 transition-all"
                      style={{ width: `${course.userProgress.percentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="relative aspect-video overflow-hidden rounded-lg lg:aspect-[4/3]">
              {course.coverImg ? (
                <Image
                  src={course.coverImg}
                  alt={course.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-secondary-800">
                  <BookOpen className="h-16 w-16 text-secondary-600" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Course Content */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold">Course Content</h2>
            <div className="mt-6 space-y-4">
              {course.categories?.map((category: any) => (
                <Card key={category.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-2">
                      {category.lessons.map((lesson: any) => (
                        <li
                          key={lesson.id}
                          className="flex items-center justify-between rounded-lg p-3 hover:bg-secondary-50"
                        >
                          <div className="flex items-center gap-3">
                            {lesson.isFreePreview || course.hasAccess ? (
                              <Play className="h-5 w-5 text-primary-600" />
                            ) : (
                              <Lock className="h-5 w-5 text-secondary-400" />
                            )}
                            <span className="text-sm">{lesson.title}</span>
                            {lesson.isFreePreview && (
                              <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">
                                Free
                              </span>
                            )}
                          </div>
                          {lesson.durationSeconds && (
                            <span className="text-sm text-secondary-500">
                              {formatDuration(lesson.durationSeconds)}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>

                    {category.quizzes?.length > 0 && (
                      <div className="mt-4 border-t pt-4">
                        <h4 className="mb-2 text-sm font-medium text-secondary-600">
                          Quizzes
                        </h4>
                        {category.quizzes.map((quiz: any) => (
                          <div
                            key={quiz.id}
                            className="flex items-center justify-between py-2"
                          >
                            <span className="text-sm">{quiz.name}</span>
                            <span className="text-xs text-secondary-500">
                              Max: {quiz.maxScore} pts
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                {!course.hasAccess ? (
                  <>
                    <p className="mb-4 text-center text-secondary-600">
                      {course.requiredRole
                        ? `Requires ${course.requiredRole} membership`
                        : "Enroll to access all lessons"}
                    </p>
                    <Link href="/pricing">
                      <Button className="w-full">Get Access</Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="mb-4 flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">You have access</span>
                    </div>
                    <Button className="w-full">Continue Learning</Button>
                  </>
                )}
              </CardContent>
            </Card>

            {course.certificateTemplateUrl && (
              <Card>
                <CardContent className="p-6 text-center">
                  <Award className="mx-auto h-12 w-12 text-primary-600" />
                  <h3 className="mt-4 font-semibold">Earn a Certificate</h3>
                  <p className="mt-2 text-sm text-secondary-600">
                    Complete this course to receive a certificate of completion
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

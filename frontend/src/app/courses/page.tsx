"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { courseApi } from "@/lib/api";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/spinner";
import { Star, Clock, BookOpen } from "lucide-react";

interface Course {
  id: number;
  name: string;
  description: string;
  coverImg: string;
  requiredRole: string;
  lessonsCount: number;
  averageRating: number;
  feedbacksCount: number;
}

export default function CoursesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const response = await courseApi.getAll(1, 20);
      return response.data;
    },
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="container py-12 text-center">
        <p className="text-red-600">
          Failed to load courses. Please try again.
        </p>
      </div>
    );
  }

  const courses: Course[] = data?.data || [];

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">All Courses</h1>
        <p className="mt-2 text-secondary-600">
          Explore our collection of courses and start learning today
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-lg border bg-secondary-50 p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-secondary-400" />
          <h3 className="mt-4 text-lg font-semibold">No courses available</h3>
          <p className="mt-2 text-secondary-600">
            Check back later for new courses
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}

function CourseCard({ course }: { course: Course }) {
  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="relative aspect-video bg-secondary-100">
        {course.coverImg ? (
          <Image
            src={course.coverImg}
            alt={course.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="h-12 w-12 text-secondary-300" />
          </div>
        )}
        {course.requiredRole && course.requiredRole !== "Member" && (
          <span className="absolute right-2 top-2 rounded-full bg-primary-600 px-2 py-1 text-xs font-medium text-white">
            {course.requiredRole}
          </span>
        )}
      </div>
      <CardHeader className="flex-1">
        <CardTitle className="line-clamp-2 text-lg">{course.name}</CardTitle>
        <p className="line-clamp-2 text-sm text-secondary-600">
          {course.description}
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-4 text-sm text-secondary-600">
          <span className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            {course.lessonsCount} lessons
          </span>
          {course.averageRating > 0 && (
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              {course.averageRating.toFixed(1)}
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/courses/${course.id}`} className="w-full">
          <Button className="w-full">View Course</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

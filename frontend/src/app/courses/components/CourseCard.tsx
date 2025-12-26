import Link from "next/link";
import Image from "next/image";
import { getCategoryStyle, getDifficultyColor } from "../constants";

interface Course {
  id: number;
  name: string;
  description: string;
  coverImg: string;
  requiredRole: string;
  lessonsCount: number;
  averageRating: number;
  feedbacksCount: number;
  category?: string;
  duration?: string;
  difficulty?: string;
}

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const categoryStyle = getCategoryStyle(course.category);
  const difficultyColor = getDifficultyColor(course.difficulty);
  const duration = course.duration || `${course.lessonsCount * 15} mins`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-xl">
      <CourseImage
        coverImg={course.coverImg}
        name={course.name}
        difficulty={course.difficulty}
        difficultyColor={difficultyColor}
      />
      <CourseContent
        course={course}
        categoryStyle={categoryStyle}
        duration={duration}
      />
    </article>
  );
}

interface CourseImageProps {
  coverImg: string;
  name: string;
  difficulty?: string;
  difficultyColor: string;
}

function CourseImage({
  coverImg,
  name,
  difficulty,
  difficultyColor,
}: CourseImageProps) {
  return (
    <div className="relative h-56 overflow-hidden">
      {/* Difficulty Badge */}
      <div className="absolute left-4 top-4 z-10">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold text-white shadow-sm ${difficultyColor}`}
        >
          {difficulty || "Beginner"}
        </span>
      </div>

      {coverImg ? (
        <Image
          src={coverImg}
          alt={name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div
          className="h-full w-full bg-gray-200"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAy8B4rcipD3cyhNP_LyPibeKalOd8PU4CqSpkbKMQbHPFt-qXJ0McmfG-EAsIsZv6Dabrd5pm48xxImZ9eqKQffW7bVW5y09aLhDaRVlvAPrLqqJKjrzM9Yd5GYnzPqiGSEBYTsz7Ll0n62i8slpZp2tlhKjggc0gKhZ1Mt2XAV_wvJyj2_2V5YSBaga1v1D6EpiXB4ByPSgPbljBH2q8tXI8SDPu2saZqTLbMM57xcB2EiObnXMGYnxDxzag4zLh1H4Gllr_B87Uh')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}
    </div>
  );
}

interface CourseContentProps {
  course: Course;
  categoryStyle: { text: string; icon: string };
  duration: string;
}

function CourseContent({
  course,
  categoryStyle,
  duration,
}: CourseContentProps) {
  return (
    <div className="flex flex-1 flex-col p-6">
      {/* Category */}
      <div
        className={`mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider ${categoryStyle.text}`}
      >
        <span className="material-symbols-outlined text-lg">
          {categoryStyle.icon}
        </span>
        {course.category || "Technology"}
      </div>

      {/* Title */}
      <h3 className="mb-3 text-2xl font-bold leading-snug text-text-main transition-colors group-hover:text-primary">
        {course.name}
      </h3>

      {/* Description */}
      <p className="mb-6 flex-grow text-lg leading-relaxed text-text-secondary line-clamp-2">
        {course.description}
      </p>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
        <span className="flex items-center gap-1 text-sm font-medium text-text-secondary">
          <span className="material-symbols-outlined text-lg">schedule</span>
          {duration}
        </span>
        <Link
          href={`/courses/${course.id}`}
          className="rounded-lg bg-primary px-6 py-2.5 font-bold text-white transition-colors hover:bg-blue-600"
        >
          Start Learning
        </Link>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  message?: string;
}

export function EmptyState({
  message = "No courses available yet",
}: EmptyStateProps) {
  return (
    <div className="rounded-2xl bg-white p-12 text-center shadow-md">
      <span className="material-symbols-outlined text-6xl text-text-secondary">
        school
      </span>
      <h3 className="mt-4 text-2xl font-bold text-text-main">{message}</h3>
      <p className="mt-2 text-lg text-text-secondary">
        Check back later for new courses
      </p>
    </div>
  );
}

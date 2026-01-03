import Link from "next/link";
import Image from "next/image";

interface Course {
  id: number;
  name: string;
  description: string;
  coverImg: string;
  requiredRole: string;
  requiredPrivilege?: string;
  lessonsCount: number;
  averageRating: number;
  feedbacksCount: number;
  category?: string;
  duration?: string;
  difficulty?: string;
  totalDurationSeconds?: number;
  userProgress?: {
    completedLessons: number;
    totalLessons: number;
    percentage: number;
  };
}

/**
 * Formats duration in seconds to human-readable format (e.g., "1h 30m" or "45m")
 */
function formatDuration(seconds: number | undefined): string {
  if (!seconds || seconds === 0) return "0m";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  return `${minutes}m`;
}

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const duration = formatDuration(course.totalDurationSeconds);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-xl">
      <CourseImage
        coverImg={course.coverImg}
        name={course.name}
        requiredPrivilege={course.requiredPrivilege}
      />
      <CourseContent course={course} duration={duration} />
    </article>
  );
}

interface CourseImageProps {
  coverImg: string;
  name: string;
  requiredPrivilege?: string;
}

function CourseImage({ coverImg, name, requiredPrivilege }: CourseImageProps) {
  return (
    <div className="relative h-56 overflow-hidden">
      {/* Required Privilege Badge */}
      {requiredPrivilege && (
        <div className="absolute left-4 top-4 z-10">
          <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-sm font-bold text-white shadow-sm">
            {requiredPrivilege}
          </span>
        </div>
      )}

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
  duration: string;
}

function CourseContent({ course, duration }: CourseContentProps) {
  return (
    <div className="flex flex-1 flex-col p-6">
      {/* Title */}
      <h3 className="mb-3 text-2xl font-bold leading-snug text-text-main transition-colors group-hover:text-primary">
        {course.name}
      </h3>

      {/* Description */}
      <p className="mb-6 flex-grow text-lg leading-relaxed text-text-secondary line-clamp-2">
        {course.description}
      </p>

      {/* Progress Bar (if user has started the course) */}
      {course.userProgress && course.userProgress.percentage > 0 && (
        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">Your Progress</span>
            <span className="font-bold text-blue-600">
              {course.userProgress.percentage}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${course.userProgress.percentage}%` }}
            />
          </div>
        </div>
      )}

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
          {course.userProgress && course.userProgress.percentage > 0
            ? "Continue"
            : "View Course"}
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

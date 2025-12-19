import Link from "next/link";
import { BookOpen, Play, Award, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 py-20 text-white">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Learn Skills That Matter
            </h1>
            <p className="mb-8 text-lg text-primary-100 sm:text-xl">
              Access high-quality courses taught by industry experts. Start your
              learning journey today and unlock your potential.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/courses">
                <Button size="lg" variant="secondary">
                  Browse Courses
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Why Choose CourseBoy?
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<BookOpen className="h-8 w-8" />}
              title="Expert Content"
              description="Courses created by industry professionals with real-world experience"
            />
            <FeatureCard
              icon={<Play className="h-8 w-8" />}
              title="Learn at Your Pace"
              description="Watch lessons anytime, anywhere, and track your progress"
            />
            <FeatureCard
              icon={<Award className="h-8 w-8" />}
              title="Earn Certificates"
              description="Get certified upon completion and showcase your skills"
            />
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Community Support"
              description="Join a community of learners and get help when you need it"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-secondary-100 py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold">
              Ready to Start Learning?
            </h2>
            <p className="mb-8 text-secondary-600">
              Join thousands of students who are already learning on CourseBoy.
              Start your journey today!
            </p>
            <Link href="/register">
              <Button size="lg">Create Free Account</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 text-primary-600">{icon}</div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-secondary-600">{description}</p>
    </div>
  );
}

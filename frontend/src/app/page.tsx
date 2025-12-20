import Link from "next/link";

// Sample course data - in real app, this would come from API
const featuredCourses = [
  {
    id: 1,
    title: "Smartphone Basics",
    description:
      "Master your device easily. Learn to send messages, take photos, and video call family.",
    category: "Technology",
    categoryColor: "blue",
    rating: 4.9,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAy7GWjmUFbahvSXZDHKAkYJh8SHIIbHC9GnYqRVPJSxNv0UofJwXBU_oUJuqsF4OOofEfMX_uNbCelRXFpTPR_Ej1D_42WFZT3qwv2xmBgdWR7vH4sZSRX1g2p9Rc5giuJFUHKGS_zaGoJXKLGbhPCUTPwN95M_mMcUtuxVOZ3XDIaUQjrzsgqmYlFxgxpYptl2EiYPabO6M3SyvsHCV5Y0w9FsYGeojkCQpJJH0Dw08bbpy4u9rvVqRp6fBezb_YC8qgruNZVv807",
  },
  {
    id: 2,
    title: "Healthy Cooking",
    description:
      "Delicious & nutritious meals prepared simply. Focus on heart health and energy.",
    category: "Health",
    categoryColor: "green",
    rating: 4.8,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBlpAUPQYAQay9Z4cM3YIVXsngbz_kSQsZxEmE5EslPbmk0NGmIo5ckrEgXm2MZfZpfwbxdMDdvBJl6kZzdnPvc6jNB4wLdwG-RZYujpIHQDaT7ArGk08rmnID9Qw5xmHUoMhIv8aEBCpR0cSzlp3l5GOyJ0QKC782dQd9Z6LATNwBoL3inycK7I97v4eFMzNAazd0y-wCl912akY1zqOVKr6l9SfPOdR79lqKufj0cYmD9ouifo1JRD3zd5R01-dCTFnNhFn4QzUFY",
  },
  {
    id: 3,
    title: "Intro to Line App",
    description:
      "Connect with children and grandchildren. Learn stickers, calls, and group chats.",
    category: "Communication",
    categoryColor: "purple",
    rating: 5.0,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBCBIPf1jKXeVY75wREiX-dq20srDz7ffdlaVMD5qCFe-mseTPrK5s90W8zfKYKXXEajDnnwouhCe75at973NBpAxAlGrdWE-FvvMFj_V77PyvsW-CVCWGw6lk3SGgiQVMwT7kUtFtP1Su55oCA_CJYr-JdE5XUcaldLAPMFcBr-AiEOZ9qnZlvNqmbYYqhLSN6yFyErLGrGMe40vaw2B8jqPycof3GvAI1wd8stKRaEtrkvvj1tbskFgf7SaBrcwZfViyF_zIJTBCr",
  },
];

const categoryColors: Record<string, string> = {
  blue: "bg-blue-100 text-blue-700",
  green: "bg-green-100 text-green-700",
  purple: "bg-purple-100 text-purple-700",
};

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <header className="w-full bg-background-light py-12 lg:py-20">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="order-2 flex flex-col gap-8 lg:order-1">
              <div className="flex flex-col gap-4">
                <span className="w-fit rounded-full bg-secondary/20 px-4 py-2 text-base font-bold text-teal-700">
                  Welcome to SeniorLearn
                </span>
                <h1 className="text-4xl font-extrabold leading-[1.15] tracking-tight text-text-main sm:text-5xl lg:text-6xl">
                  Learn something new today, at your own pace.
                </h1>
                <p className="max-w-xl text-xl leading-relaxed text-text-secondary">
                  Simple video lessons designed just for you. Start your journey
                  with easy-to-follow courses on technology, hobbies, and
                  health.
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/courses"
                  className="flex h-14 min-w-[180px] items-center justify-center rounded-xl bg-primary px-8 text-xl font-bold text-white shadow-lg transition-transform hover:-translate-y-1 hover:bg-primary-hover"
                >
                  Start Learning
                </Link>
                <Link
                  href="/courses"
                  className="flex h-14 min-w-[180px] items-center justify-center rounded-xl border-2 border-primary/20 bg-white px-8 text-xl font-bold text-primary transition-colors hover:bg-primary/5"
                >
                  Browse Library
                </Link>
              </div>
            </div>
            <div className="relative order-1 lg:order-2">
              <div className="absolute -inset-4 rounded-[2rem] bg-accent/10 blur-2xl"></div>
              <div
                className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] bg-gray-200 shadow-xl"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBWKrBWI2LOYZacrjeECc0vy9u6zs6-H3HhvaKOc7ahlaWiXsWiKlGLK2QIxVjaK_KLbSP2JA3tDjl-kubD9Wp8MF1wEY9c94YllQ36TV2pOdZinp4iLhwLBYPbJiPMzX93A8rCN_cc-eh_tourpfeosJiO4IzbkRpfFv82oV8gMTe3SDrVnt06snmV7_0XPvbh8x4rXZmUgrP0SXYoHT-yGIq1p3imVAd_bgYoD1041HcxghjZlVBLR9ouq93ifyIRXCMwxq7BVkQJ')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              ></div>
            </div>
          </div>
        </div>
      </header>

      {/* Recommended Courses Section */}
      <section className="w-full bg-background-section py-16 lg:py-24">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-10 px-6 lg:px-10">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-text-main sm:text-4xl">
                Recommended for You
              </h2>
              <p className="mt-2 text-xl text-text-secondary">
                Popular courses selected by our community.
              </p>
            </div>
            <Link
              href="/courses"
              className="hidden items-center gap-1 text-lg font-bold text-primary hover:text-primary-hover md:flex"
            >
              View all courses{" "}
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          <div className="mt-4 flex justify-center md:hidden">
            <Link
              href="/courses"
              className="flex h-12 w-full items-center justify-center rounded-xl border border-gray-300 bg-white px-6 text-lg font-bold text-text-main shadow-sm"
            >
              View All Courses
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-[960px] px-6 text-center">
          <div className="flex flex-col items-center gap-6 rounded-[2.5rem] bg-gradient-to-br from-primary/10 to-transparent p-10 lg:p-16">
            <span className="material-symbols-outlined text-6xl text-primary">
              auto_stories
            </span>
            <h2 className="max-w-[720px] text-3xl font-extrabold leading-tight text-text-main sm:text-4xl lg:text-5xl">
              Browse our complete library
            </h2>
            <p className="max-w-[600px] text-xl text-text-secondary">
              Find the perfect topic to explore next. We have over 50 courses
              designed specifically for seniors.
            </p>
            <div className="mt-4">
              <Link
                href="/courses"
                className="flex h-16 min-w-[240px] items-center justify-center rounded-xl bg-accent px-8 text-xl font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-accent/90"
              >
                See All Courses
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function CourseCard({
  course,
}: {
  course: {
    id: number;
    title: string;
    description: string;
    category: string;
    categoryColor: string;
    rating: number;
    image: string;
  };
}) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-all hover:-translate-y-1 hover:shadow-xl">
      <div
        className="aspect-video w-full bg-gray-200"
        style={{
          backgroundImage: `url('${course.image}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      ></div>
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-sm font-bold ${
              categoryColors[course.categoryColor]
            }`}
          >
            {course.category}
          </span>
          <div className="flex items-center gap-1 text-yellow-500">
            <span className="material-symbols-outlined text-lg">star</span>
            <span className="text-sm font-bold text-text-main">
              {course.rating}
            </span>
          </div>
        </div>
        <h3 className="mb-2 text-2xl font-bold text-text-main transition-colors group-hover:text-primary">
          {course.title}
        </h3>
        <p className="mb-6 flex-1 text-lg leading-normal text-text-secondary">
          {course.description}
        </p>
        <Link
          href={`/courses/${course.id}`}
          className="w-full rounded-xl border-2 border-primary/10 bg-primary/5 py-3 text-center text-lg font-bold text-primary transition-colors hover:bg-primary hover:text-white"
        >
          View Course
        </Link>
      </div>
    </article>
  );
}

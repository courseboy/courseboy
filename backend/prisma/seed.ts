import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Create privileges
  const memberPrivilege = await prisma.privilege.upsert({
    where: { name: "Member" },
    update: {},
    create: {
      name: "Member",
      description: "Basic member access",
      price: 0,
    },
  });

  const vipPrivilege = await prisma.privilege.upsert({
    where: { name: "VIP" },
    update: {},
    create: {
      name: "VIP",
      description: "VIP member access with premium courses",
      price: 990,
    },
  });

  const superVipPrivilege = await prisma.privilege.upsert({
    where: { name: "SuperVIP" },
    update: {},
    create: {
      name: "SuperVIP",
      description: "Super VIP access with all courses",
      price: 1990,
    },
  });

  const adminPrivilege = await prisma.privilege.upsert({
    where: { name: "Admin" },
    update: {},
    create: {
      name: "Admin",
      description: "Administrator access",
      price: 0,
    },
  });

  console.log("✅ Privileges created");

  // Create admin user
  const passwordHash = await bcrypt.hash("admin123", 12);

  const adminUser = await prisma.appUser.upsert({
    where: { email: "admin@courseboy.com" },
    update: {},
    create: {
      username: "admin",
      email: "admin@courseboy.com",
      isActive: true,
    },
  });

  // Create user secret for admin
  await prisma.userSecret.upsert({
    where: { userId: adminUser.id },
    update: { passwordHash },
    create: {
      userId: adminUser.id,
      passwordHash,
    },
  });

  // Assign admin privilege
  await prisma.userPrivilege.upsert({
    where: {
      userId_privilegeId: {
        userId: adminUser.id,
        privilegeId: adminPrivilege.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      privilegeId: adminPrivilege.id,
    },
  });

  console.log("✅ Admin user created");

  // Create sample course
  const course = await prisma.course.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Getting Started with TypeScript",
      description: "Learn TypeScript from scratch with hands-on examples",
      coverImg: "/images/courses/typescript-cover.jpg",
      isPublished: true,
      requiredPrivilegeId: memberPrivilege.id,
    },
  });

  // Create course category
  const category = await prisma.courseCategory.upsert({
    where: { id: 1 },
    update: {},
    create: {
      courseId: course.id,
      name: "Introduction",
      orderIndex: 1,
    },
  });

  // Create lessons
  await prisma.lesson.createMany({
    skipDuplicates: true,
    data: [
      {
        courseId: course.id,
        courseCategoryId: category.id,
        title: "What is TypeScript?",
        videoUrl: "https://example.com/video1",
        durationSeconds: 600,
        orderIndex: 1,
        isFreePreview: true,
      },
      {
        courseId: course.id,
        courseCategoryId: category.id,
        title: "Setting up your environment",
        videoUrl: "https://example.com/video2",
        durationSeconds: 900,
        orderIndex: 2,
        isFreePreview: false,
      },
    ],
  });

  console.log("✅ Sample course created");
  console.log("🎉 Seed completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

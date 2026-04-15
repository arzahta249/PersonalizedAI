import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type LatestModuleItem = {
  id: string;
  courseId: string;
  title: string;
  course: {
    id: string;
    title: string;
  } | null;
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const [totalMateri, totalQuizSelesai, averageScore, latestModules, activeAssignments, pendingQuizzes] = await Promise.all([
      prisma.module.count({ where: { isPublished: true } }),
      userId ? prisma.quizResult.count({ where: { userId } }) : 0,
      userId
        ? prisma.quizResult.aggregate({
            where: { userId },
            _avg: { score: true },
          })
        : { _avg: { score: 0 } },
      prisma.module.findMany({
        take: 3,
        where: { isPublished: true },
        orderBy: { order: "desc" },
        include: {
          course: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
      userId
        ? prisma.assignment.count({
            where: {
              dueDate: { gte: new Date() },
              submissions: { none: { userId } },
            },
          })
        : 0,
      userId
        ? prisma.quiz.count({
            where: {
              status: "APPROVED",
              quizResults: { none: { userId } },
              module: { isPublished: true },
            },
          })
        : 0,
    ]);

    const formattedModules = (latestModules as LatestModuleItem[]).map((moduleItem: LatestModuleItem) => ({
      id: moduleItem.id,
      courseId: moduleItem.course?.id || moduleItem.courseId,
      title: moduleItem.title,
      courseTitle: moduleItem.course?.title || "Mata Kuliah",
      initials: (moduleItem.course?.title || "MK")
        .split(" ")
        .map((word: string) => word[0])
        .join("")
        .toUpperCase()
        .substring(0, 2),
    }));

    return NextResponse.json({
      totalMateri,
      totalQuizSelesai,
      avgScore: averageScore._avg.score || 0,
      activeAssignments,
      pendingQuizzes,
      latestModules: formattedModules,
    });
  } catch (error) {
    console.error("MAHASISWA STAT ERROR:", error);
    return NextResponse.json({ message: "Gagal memuat data dashboard" }, { status: 500 });
  }
}

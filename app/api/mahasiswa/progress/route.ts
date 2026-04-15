import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ProgressRowItem = {
  courseId: string;
  progress: number;
  status: string;
  course: {
    title: string;
    modules: Array<{
      quizzes: Array<unknown>;
    }>;
  };
};

type QuizResultItem = {
  quiz: {
    module: {
      course: {
        id: string;
      };
    };
  };
};

type AssignmentSubmissionItem = {
  assignment: {
    courseId: string;
  };
};

type CourseCard = {
  id: string;
  courseTitle: string;
  progress: number;
  status: string;
  totalModules: number;
  totalQuizzes: number;
  completedQuizzes: number;
  submittedAssignments: number;
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ message: "User ID diperlukan" }, { status: 400 });
    }

    const [progressRows, quizzes, assignments] = await Promise.all([
      prisma.progress.findMany({
        where: { userId },
        include: {
          course: {
            include: {
              modules: {
                where: { isPublished: true },
                include: { quizzes: true },
                orderBy: { order: "asc" },
              },
            },
          },
        },
        orderBy: { progress: "desc" },
      }),
      prisma.quizResult.findMany({
        where: { userId },
        include: {
          quiz: {
            include: {
              module: {
                include: { course: true },
              },
            },
          },
        },
      }),
      prisma.assignmentSubmission.findMany({
        where: { userId },
        include: {
          assignment: {
            include: {
              course: true,
            },
          },
        },
      }),
    ]);

    const courseCards = (progressRows as ProgressRowItem[]).map((item: ProgressRowItem) => {
      const totalModules = item.course.modules.length;
      const totalQuizzes = item.course.modules.reduce(
        (acc: number, moduleItem: ProgressRowItem["course"]["modules"][number]) => acc + moduleItem.quizzes.length,
        0
      );
      const completedQuizzes = (quizzes as QuizResultItem[]).filter(
        (quiz: QuizResultItem) => quiz.quiz.module.course.id === item.courseId
      ).length;
      const submittedAssignments = (assignments as AssignmentSubmissionItem[]).filter(
        (submission: AssignmentSubmissionItem) => submission.assignment.courseId === item.courseId
      ).length;

      return {
        id: item.courseId,
        courseTitle: item.course.title,
        progress: item.progress,
        status: item.status,
        totalModules,
        totalQuizzes,
        completedQuizzes,
        submittedAssignments,
      };
    });

    const averageProgress =
      courseCards.length > 0
        ? Math.round(courseCards.reduce((acc: number, item: CourseCard) => acc + item.progress, 0) / courseCards.length)
        : 0;

    const bestCourse =
      courseCards.sort((a: CourseCard, b: CourseCard) => b.progress - a.progress)[0]?.courseTitle || "Belum ada progres";

    return NextResponse.json({
      summary: {
        activeCourses: courseCards.length,
        averageProgress,
        completedQuizzes: quizzes.length,
        submittedAssignments: assignments.length,
        bestCourse,
      },
      courses: courseCards,
    });
  } catch (error) {
    console.error("GET PROGRESS ERROR:", error);
    return NextResponse.json({ message: "Gagal mengambil progres belajar" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = typeof body.userId === "string" ? body.userId : "";
    const moduleId = typeof body.moduleId === "string" ? body.moduleId : "";

    if (!userId || !moduleId) {
      return NextResponse.json({ message: "User ID dan module ID wajib diisi" }, { status: 400 });
    }

    const moduleItem = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        course: {
          include: {
            modules: {
              where: { isPublished: true },
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    if (!moduleItem) {
      return NextResponse.json({ message: "Materi tidak ditemukan" }, { status: 404 });
    }

    const totalModules = Math.max(moduleItem.course.modules.length, 1);
    const completedModules = moduleItem.course.modules.filter(
      (courseModule) => courseModule.order <= moduleItem.order
    ).length;
    const progressValue = Math.min(100, Math.round((completedModules / totalModules) * 100));
    const status = progressValue >= 100 ? "SELESAI" : progressValue > 0 ? "BERJALAN" : "BARU";

    const existingProgress = await prisma.progress.findFirst({
      where: { userId, courseId: moduleItem.courseId },
    });

    const result = existingProgress
      ? await prisma.progress.update({
          where: { id: existingProgress.id },
          data: {
            progress: Math.max(existingProgress.progress, progressValue),
            status,
          },
        })
      : await prisma.progress.create({
          data: {
            userId,
            courseId: moduleItem.courseId,
            progress: progressValue,
            status,
          },
        });

    return NextResponse.json({
      message: "Progres belajar berhasil diperbarui",
      progress: result,
    });
  } catch (error) {
    console.error("POST PROGRESS ERROR:", error);
    return NextResponse.json({ message: "Gagal memperbarui progres belajar" }, { status: 500 });
  }
}

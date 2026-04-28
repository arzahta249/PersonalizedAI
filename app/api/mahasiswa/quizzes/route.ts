import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ message: "User ID diperlukan" }, { status: 400 });
    }

    // Ambil semua quiz yang berada di dalam modul yang sudah di-publish
    const quizzes = await prisma.quiz.findMany({
      where: {
        module: {
          isPublished: true,
        },
      },
      include: {
        module: {
          include: {
            course: true, // Ambil nama mata kuliahnya
          },
        },
        quizResults: {
          where: {
            userId: userId, // Cari tahu apakah user ini sudah mengerjakan
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        id: "desc", // Urutkan dari yang terbaru
      },
    });

    // Format datanya agar mudah dibaca oleh frontend
    const formattedQuizzes = quizzes.map((q: any) => {
      const result = q.quizResults[0]; // Cek hasil kuis (jika ada)
      return {
        id: q.id,
        title: q.title,
        moduleTitle: q.module?.title || "Modul",
        courseTitle: q.module?.course?.title || "Mata Kuliah",
        status: result ? "SELESAI" : "BELUM",
        score: result ? result.score : null,
        submittedAt: result ? result.createdAt : null,
      };
    });

    return NextResponse.json(formattedQuizzes);
  } catch (error) {
    console.error("API GET QUIZZES ERROR:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

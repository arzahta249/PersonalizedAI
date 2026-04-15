import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const quizzes = await prisma.quiz.findMany({
      include: {
        module: {
          select: {
            title: true,
            course: { select: { title: true } },
          },
        },
        // Opsional: Jika kamu punya relasi ke Dosen pembuat
        // author: { select: { name: true } } 
      },
      orderBy: {
        id: "desc", // Urutkan dari yang paling baru dibuat
      },
    });

    // Format data agar mudah dirender frontend
    const formattedQuizzes = quizzes.map((q: any) => ({
      id: q.id,
      title: q.title,
      moduleTitle: q.module?.title || "-",
      courseTitle: q.module?.course?.title || "-",
      status: q.status || "PENDING", // Default jika kosong
    }));

    return NextResponse.json(formattedQuizzes);
  } catch (error) {
    console.error("ADMIN GET QUIZZES ERROR:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
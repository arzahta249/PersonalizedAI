import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  // 1. Definisikan tipe params sebagai Promise
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    // 2. Wajib gunakan 'await' untuk membuka Promise-nya
    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!id || id === "undefined") {
      return NextResponse.json(null, { status: 400 });
    }

    const course = await prisma.course.findUnique({
      where: { id: id },
      include: {
        modules: {
          orderBy: { order: "asc" },
          include: {
            quizzes: true, 
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(null, { status: 404 });
    }

    const allQuizzes = course.modules.flatMap((m: any) => m.quizzes || []);

    return NextResponse.json({
      ...course,
      quizzes: allQuizzes,
    });
  } catch (error) {
    console.error("API GET COURSE ERROR:", error);
    return NextResponse.json(null, { status: 500 });
  }
}
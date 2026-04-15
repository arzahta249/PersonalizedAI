import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const courses = await db.course.findMany({
      include: {
        modules: {
          include: {
            quizzes: true,
          },
        },
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("GET COURSES ERROR:", error);

    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data course" },
      { status: 500 }
    );
  }
}
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 🔥 GET DETAIL
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        modules: {
          include: {
            quizzes: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { message: "Course tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(course);

  } catch {
    return NextResponse.json(
      { message: "Error ambil course" },
      { status: 500 }
    );
  }
}

// 🔥 DELETE COURSE
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await prisma.module.deleteMany({
      where: { courseId: id },
    });

    await prisma.course.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Course berhasil dihapus",
    });

  } catch {
    return NextResponse.json(
      { message: "Gagal hapus course" },
      { status: 500 }
    );
  }
}

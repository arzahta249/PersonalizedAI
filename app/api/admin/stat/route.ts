import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const totalUsers = await prisma.user.count();

    const mahasiswa = await prisma.user.count({
      where: { role: "MAHASISWA" },
    });

    const dosen = await prisma.user.count({
      where: { role: "DOSEN" },
    });

    const pendingDosen = await prisma.user.count({
      where: { role: "DOSEN", approvalStatus: "PENDING" },
    });

    const totalQuiz = await prisma.quiz.count();

    const pendingQuiz = await prisma.quiz.count({
      where: { status: "PENDING" },
    });

    const totalCourses = await prisma.course.count();
    const activeUsers = await prisma.progress.count();

    return NextResponse.json({
      totalUsers,
      mahasiswa,
      dosen,
      pendingDosen,
      totalQuiz,
      pendingQuiz,
      totalCourses,
      activeUsers,
    });
  } catch (error) {
    console.error("STAT ERROR:", error);

    return NextResponse.json(
      { message: "Gagal ambil statistik" },
      { status: 500 }
    );
  }
}

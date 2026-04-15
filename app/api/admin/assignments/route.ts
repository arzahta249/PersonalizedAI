import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Ambil semua tugas beserta nama mata kuliah dan jumlah pengumpulan
    const assignments = await prisma.assignment.findMany({
      include: {
        course: {
          select: { title: true }
        },
        _count: { 
          select: { submissions: true } 
        },
      },
      orderBy: { createdAt: "desc" }
    });

    const now = new Date();

    // Format data agar mudah dibaca oleh frontend
    const formattedData = assignments.map((a: any) => ({
      id: a.id,
      title: a.title,
      courseTitle: a.course?.title || "Tanpa Mata Kuliah",
      dosenName: "Dosen Pengampu", // Jika ada tabel relasi user (Dosen) bisa diganti
      dueDate: a.dueDate,
      submissionsCount: a._count.submissions,
      totalStudents: 40,
      status: new Date(a.dueDate) < now ? "PASSED" : "ACTIVE"
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("ADMIN GET ASSIGNMENTS ERROR:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
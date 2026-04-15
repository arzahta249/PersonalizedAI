import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    // Ambil semua tugas beserta info apakah mahasiswa (userId) ini sudah mengumpulkan
    const assignments = await prisma.assignment.findMany({
      include: {
        course: { select: { title: true } },
        // Cek submission KHUSUS untuk user yang sedang login
        submissions: {
          where: { userId: userId || "" },
          select: { id: true, score: true, submittedAt: true }
        }
      },
      orderBy: { dueDate: "asc" } // Urutkan dari deadline terdekat
    });

    const now = new Date();

    // Format data agar lebih gampang dirender frontend
    const formattedData = assignments.map((a: any) => {
      const isSubmitted = a.submissions && a.submissions.length > 0;
      const isPastDue = new Date(a.dueDate) < now;
      
      let status = "ACTIVE";
      if (isSubmitted) status = "SUBMITTED";
      else if (isPastDue) status = "MISSED";

      return {
        id: a.id,
        title: a.title,
        courseTitle: a.course?.title || "Mata Kuliah Umum",
        dueDate: a.dueDate,
        isSubmitted: isSubmitted,
        isPastDue: isPastDue,
        status: status,
        score: isSubmitted ? a.submissions[0].score : null,
      };
    });

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("MAHASISWA GET ASSIGNMENTS ERROR:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
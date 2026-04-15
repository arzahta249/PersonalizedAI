import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    // Ambil userId dari query URL (misal: ?userId=123)
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!id || id === "undefined") {
      return NextResponse.json({ message: "ID Tugas tidak valid" }, { status: 400 });
    }

    // Cari tugas beserta info mata kuliah
    const assignment = await prisma.assignment.findUnique({
      where: { id: id },
      include: {
        course: { select: { title: true } },
      },
    });

    if (!assignment) {
      return NextResponse.json({ message: "Tugas tidak ditemukan" }, { status: 404 });
    }

    // Jika userId dikirim, cek apakah mahasiswa ini sudah mengumpulkan
    let submission = null;
    if (userId) {
      submission = await prisma.assignmentSubmission.findUnique({
        where: {
          assignmentId_userId: {
            assignmentId: id,
            userId: userId,
          },
        },
      });
    }

    // Gabungkan data tugas dan status pengumpulan mahasiswa
    return NextResponse.json({
      ...assignment,
      courseTitle: assignment.course?.title || "Mata Kuliah",
      submission: submission, // Akan berisi data jika sudah kumpul, null jika belum
    });
  } catch (error) {
    console.error("GET ASSIGNMENT DETAIL ERROR:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
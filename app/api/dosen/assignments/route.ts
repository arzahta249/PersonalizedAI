import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Mengambil daftar tugas
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId"); // ID Dosen

    // Ambil tugas beserta relasi ke mata kuliah dan hitung jumlah pengumpulan
    const assignments = await prisma.assignment.findMany({
      // Jika relasi dosen ada di tabel Course, bisa tambahkan filter: where: { course: { userId: userId } }
      include: {
        course: { select: { title: true } },
        _count: { select: { submissions: true } }, // Hitung mahasiswa yang sudah kumpul
      },
      orderBy: { createdAt: "desc" }
    });

    // Format data untuk frontend
    const formattedData = assignments.map((a: any) => ({
      id: a.id,
      title: a.title,
      courseTitle: a.course?.title || "Tanpa Mata Kuliah",
      dueDate: a.dueDate,
      submissionsCount: a._count.submissions,
      totalStudents: 40, // Asumsi dummy total mahasiswa, nanti bisa dihubungkan ke data kelas sesungguhnya
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("GET ASSIGNMENTS ERROR:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// Membuat tugas baru
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, dueDate, courseId } = body;

    if (!title || !description || !dueDate || !courseId) {
      return NextResponse.json({ message: "Semua kolom wajib diisi!" }, { status: 400 });
    }

    const newAssignment = await prisma.assignment.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate), // Konversi string dari input type="datetime-local" ke Date Prisma
        courseId,
      },
    });

    return NextResponse.json({ message: "Tugas berhasil dibuat", assignment: newAssignment });
  } catch (error) {
    console.error("CREATE ASSIGNMENT ERROR:", error);
    return NextResponse.json({ message: "Gagal membuat tugas" }, { status: 500 });
  }
}
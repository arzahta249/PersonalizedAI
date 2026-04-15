import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ message: "User ID required" }, { status: 400 });
    }

    // 1. TARIK DATA DOSEN (Termasuk NIP/NPM dari form pendaftaran)
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ message: "Dosen tidak ditemukan" }, { status: 404 });
    }

    // 2. HITUNG DATA DINAMIS DARI DATABASE

    // A. Menghitung total MATA KULIAH asli di database
    const totalMataKuliah = await prisma.course.count().catch(() => 0); 

    // B. Menghitung total TUGAS asli di database
    const assignments = await prisma.assignment.findMany({
      orderBy: { createdAt: 'desc' },
      select: { title: true, dueDate: true, createdAt: true }
    }).catch(() => []);
    const totalTugas = assignments.length;

    // 🔥 C. HITUNG TOTAL MAHASISWA ASLI (Menghitung jumlah akun Mahasiswa) 🔥
    const totalMahasiswa = await prisma.user.count({
      where: { role: "MAHASISWA" }
    }).catch(() => 0);


    // Format Aktivitas Terbaru
    const recentAssignments = assignments.slice(0, 4);
    const formattedActivity = recentAssignments.map((task: any) => {
      const isPastDue = new Date(task.dueDate) < new Date();
      return {
        title: task.title,
        type: "Penugasan",
        status: isPastDue ? "Selesai" : "Aktif"
      };
    });

    // 3. SUSUN PROFIL 100% DINAMIS
    const profileData = {
      name: user.name,
      email: user.email,
      // Mengambil NIDN/NIP langsung dari input pendaftaran
      nip: user.npm || "Belum diatur", 
      // Mengambil Fakultas dari posisi
      fakultas: user.position || "Fakultas Teknik dan Ilmu Komputer", 
      universitas: "Universitas Pancasakti Tegal",
      role: user.role,
      stats: {
        totalMataKuliah: totalMataKuliah,
        tugasDiberikan: totalTugas,
        // Angka ini sekarang bergerak dinamis setiap ada mahasiswa baru yang daftar!
        totalMahasiswa: totalMahasiswa 
      },
      recentActivity: formattedActivity 
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error("API PROFIL DOSEN ERROR:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
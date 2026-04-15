import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) return NextResponse.json({ message: "User ID required" }, { status: 400 });

    // 1. Ambil Data User Utama
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    // 2. Hitung statistik aman (Pakai .catch agar tidak error kalau tabel masih kosong)
    const totalTugas = await prisma.assignment.count().catch(() => 0);

    // 3. Format data khusus Dosen
    const profileData = {
      name: user.name,
      email: user.email,
      nip: "198504122010121003", // NIP Dosen (Bisa disesuaikan dari DB nanti)
      fakultas: "Fakultas Teknik dan Ilmu Komputer",
      universitas: "Universitas Pancasakti Tegal",
      role: user.role,
      stats: {
        totalMataKuliah: 4, // Data dummy aman
        tugasDiberikan: totalTugas > 0 ? totalTugas : 12,
        totalMahasiswa: 120 // Perkiraan jumlah mahasiswa yang diajar
      },
      recentActivity: [
        { title: "Tugas 4: Digital Marketing Plan", type: "Penugasan", status: "Aktif" },
        { title: "Materi: Sistem Bilangan & Floating Point", type: "Materi", status: "Selesai" },
        { title: "Kuis Tengah Semester", type: "Kuis", status: "Selesai" }
      ]
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error("DOSEN PROFILE ERROR:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
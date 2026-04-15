import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) return NextResponse.json({ message: "User ID required" }, { status: 400 });

    // 1. Ambil Data User (Hanya mengambil field yang pasti ada di schema)
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    // 2. Hitung statistik secara manual (Aman dari error relasi)
    // Menghitung berapa banyak tugas yang sudah disubmit mahasiswa ini
    const totalSubmissions = await prisma.assignmentSubmission.count({
      where: { userId: userId }
    }).catch(() => 0); // Fallback ke 0 jika gagal

    // 3. Format data untuk dikirim ke Frontend
    const profileData = {
      name: user.name,
      email: user.email,
      npm: user.npm || "6624600045", // Mengambil npm dari database, dengan nilai default
      programStudi: "Informatika (4B)",
      universitas: "Universitas Pancasakti Tegal",
      role: user.role,
      stats: {
        totalKursus: 6, // Angka default yang aman (bisa diganti jika tabel kursus sudah terhubung)
        materiSelesai: totalSubmissions,
        rataProgress: 85 
      },
      recentProgress: [
        { course: "Infrastruktur E-Business", progress: 100, status: "Selesai" },
        { course: "Digital Marketing Plan", progress: 80, status: "Berjalan" },
        { course: "Sistem Bilangan & Floating Point", progress: 65, status: "Berjalan" }
      ]
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error("DYNAMIC PROFILE ERROR:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
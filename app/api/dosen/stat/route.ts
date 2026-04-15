import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type LatestQuizResultItem = {
  user: {
    name: string;
  };
  quiz: {
    title: string;
  };
};

export async function GET() {
  try {
    // Menggunakan Promise.all agar fetch data lebih cepat (paralel)
    const [totalQuiz, approvedQuiz, pendingQuiz, totalCourses, latestModules, latestResults] = await Promise.all([
      prisma.quiz.count(),
      prisma.quiz.count({ where: { status: "APPROVED" } }),
      prisma.quiz.count({ where: { status: "PENDING" } }),
      prisma.course.count(),
      
      // 🔥 AMBIL 5 MATERI TERBARU (Ini yang buat 'Materi Terkini' muncul)
      prisma.module.findMany({
        take: 5,
        orderBy: { order: 'desc' }, // Atau pakai createdAt jika sudah kamu tambahkan di schema
        select: {
          title: true,
          type: true,
          // Kita bisa ambil info kapan dibuatnya
        }
      }),

      // 🔥 AMBIL AKTIVITAS TERBARU (Mahasiswa yang kerjain kuis)
      prisma.quizResult.findMany({
        take: 4,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true } },
          quiz: { select: { title: true } }
        }
      })
    ]);

    // Format data aktivitas agar rapi di tampilkan di UI
    const formattedActivities = (latestResults as LatestQuizResultItem[]).map((res: LatestQuizResultItem) => ({
      title: `${res.user.name} menyelesaikan ${res.quiz.title}`,
      time: "Baru saja"
    }));

    // Kirim semua data ke Frontend
    return NextResponse.json({
      totalQuiz,
      approvedQuiz,
      pendingQuiz,
      totalCourses,
      totalStudents: 0, // Opsional: prisma.user.count({ where: { role: 'MAHASISWA' } })
      latestMateri: latestModules, // <--- INI KUNCI AGAR MATERI MUNCUL
      activities: formattedActivities // <--- INI KUNCI AGAR AKTIVITAS MUNCUL
    });

  } catch (error) {
    console.error("DOSEN STAT ERROR:", error);
    return NextResponse.json(
      { message: "Gagal ambil statistik dosen" },
      { status: 500 }
    );
  }
}

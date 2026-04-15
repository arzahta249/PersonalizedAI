import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Mengambil semua modul (materi) beserta nama kursusnya
    const modules = await prisma.module.findMany({
      include: {
        course: {
          select: { title: true },
        },
      },
      orderBy: {
        id: "desc", // Urutkan dari yang terbaru ditambahkan
      },
    });

    // Format data untuk mempermudah frontend
    const formattedModules = modules.map((m: any) => ({
      id: m.id,
      title: m.title,
      courseTitle: m.course?.title || "Tanpa Mata Kuliah",
      type: m.type, // "VIDEO" atau "TEXT"
      isPublished: m.isPublished,
    }));

    return NextResponse.json(formattedModules);
  } catch (error) {
    console.error("ADMIN GET MATERI ERROR:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
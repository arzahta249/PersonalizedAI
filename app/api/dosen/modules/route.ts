import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    // Ambil data dari FormData
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const type = (formData.get("type") as string) || "TEXT";
    const courseId = formData.get("courseId") as string;
    const difficulty = (formData.get("difficulty") as string) || "BEGINNER";
    const videoUrl = formData.get("videoUrl") as string || null;
    const order = parseInt(formData.get("order") as string) || 0;
    
    // Handle File Upload
    const file = formData.get("file") as File | null;
    let finalFileUrl = formData.get("fileUrl") as string || null;

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Pastikan folder public/uploads ada
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filename = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
      const filePath = path.join(uploadDir, filename);
      
      await writeFile(filePath, buffer);
      finalFileUrl = `/uploads/${filename}`;
    }

    // Simpan ke Prisma
    const newModule = await prisma.module.create({
      data: {
        title,
        content: content || "",
        type,
        courseId,
        difficulty,
        order,
        videoUrl,
        fileUrl: finalFileUrl,
        isPublished: true,
      },
    });

    return NextResponse.json({
      message: "Module berhasil dibuat",
      data: newModule,
    });

  } catch (error: any) {
    console.error("API ERROR:", error);
    return NextResponse.json(
      { message: "Gagal membuat modul", error: error.message },
      { status: 500 }
    );
  }
}

// Tambahkan GET juga supaya list materi muncul
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");

  if (!courseId) return NextResponse.json([], { status: 400 });

  const modules = await prisma.module.findMany({
    where: { courseId },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(modules);
}
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    const moduleId = formData.get("moduleId") as string;
    const title = formData.get("title") as string;
    const type = formData.get("type") as string; // TEXT | VIDEO | CODE
    const content = formData.get("content") as string || "";
    const videoUrl = formData.get("videoUrl") as string || null;
    
    // Handle File Fisik (Sama seperti di Module)
    const file = formData.get("file") as File | null;
    let finalFileUrl = formData.get("fileUrl") as string || null;

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-lesson-${file.name.replace(/\s+/g, "_")}`;
      const filePath = path.join(process.cwd(), "public/uploads", filename);
      await writeFile(filePath, buffer);
      finalFileUrl = `/uploads/${filename}`;
    }

    // Ambil order terakhir otomatis agar dosen tidak perlu input manual
    const lastLesson = await prisma.lesson.findFirst({
      where: { moduleId },
      orderBy: { order: 'desc' }
    });
    const newOrder = lastLesson ? lastLesson.order + 1 : 1;

    const newLesson = await prisma.lesson.create({
      data: {
        moduleId,
        title,
        type,
        content,
        fileUrl: finalFileUrl,
        videoUrl,
        order: newOrder,
      },
    });

    return NextResponse.json(newLesson);
  } catch (error: any) {
    console.error("LESSON ERROR:", error);
    return NextResponse.json({ message: "Gagal simpan materi: " + error.message }, { status: 500 });
  }
}
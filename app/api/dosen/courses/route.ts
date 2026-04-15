import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 🔥 GET ALL COURSES
export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        modules: true,
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    return NextResponse.json(
      { message: "Gagal ambil courses" },
      { status: 500 }
    );
  }
}

// 🔥 CREATE COURSE
export async function POST(req: Request) {
  try {
    const { title, description, level, category } = await req.json();

    if (!title || !description || !level || !category) {
      return NextResponse.json(
        { message: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        level,
        category,
      },
    });

    return NextResponse.json(course);

  } catch (error) {
    return NextResponse.json(
      { message: "Gagal tambah course" },
      { status: 500 }
    );
  }
}
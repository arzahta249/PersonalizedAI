import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const moduleItem = await prisma.module.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!moduleItem) {
      return NextResponse.json({ message: "Materi tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(moduleItem);
  } catch (error) {
    console.error("MODULE DETAIL ERROR:", error);
    return NextResponse.json({ message: "Gagal mengambil materi" }, { status: 500 });
  }
}

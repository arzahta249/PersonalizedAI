import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await prisma.lesson.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Lesson berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ message: "Gagal menghapus lesson" }, { status: 500 });
  }
}

// Tambahkan PATCH jika ingin fitur edit di masa depan
export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
  ) {
    const body = await req.json();
    const updated = await prisma.lesson.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json(updated);
  }
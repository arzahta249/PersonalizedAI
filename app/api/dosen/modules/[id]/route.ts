import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Pastikan hapus relasi jika perlu, tapi Prisma biasanya handle via Schema
    await prisma.module.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Modul berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ message: "Gagal menghapus modul" }, { status: 500 });
  }
}
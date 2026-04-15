import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    // Ambil status baru dari body request ("APPROVED" atau "REJECTED")
    const body = await req.json();
    const { status } = body;

    if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) {
      return NextResponse.json({ message: "Status tidak valid" }, { status: 400 });
    }

    // Update status di database
    const updatedQuiz = await prisma.quiz.update({
      where: { id: id },
      data: { status: status },
    });

    return NextResponse.json({ 
      message: "Status kuis berhasil diperbarui", 
      quiz: updatedQuiz 
    });
  } catch (error) {
    console.error("UPDATE STATUS ERROR:", error);
    return NextResponse.json({ message: "Gagal memperbarui status" }, { status: 500 });
  }
}
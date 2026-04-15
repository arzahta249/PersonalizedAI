import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await req.json();
    const { submissionId, score, feedback } = body;

    if (!submissionId || score === undefined) {
      return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
    }

    // Update data pengumpulan (submission) dengan nilai dan komentar
    const updatedSubmission = await prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        score: parseFloat(score),
        feedback: feedback || null,
      },
    });

    return NextResponse.json({ message: "Nilai berhasil disimpan!", submission: updatedSubmission });
  } catch (error) {
    console.error("GRADING ERROR:", error);
    return NextResponse.json({ message: "Gagal menyimpan nilai" }, { status: 500 });
  }
}
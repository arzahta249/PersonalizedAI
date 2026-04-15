import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) return NextResponse.json({ message: "ID diperlukan" }, { status: 400 });

    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        course: { select: { title: true } },
        submissions: {
          include: {
            user: { select: { name: true, email: true } }
          },
          orderBy: { submittedAt: 'desc' }
        }
      }
    });

    if (!assignment) return NextResponse.json({ message: "Tidak ditemukan" }, { status: 404 });

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("DOSEN GET ASSIGNMENT ERROR:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
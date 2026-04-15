import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const quiz = await db.quiz.findUnique({
    where: { id },
    include: {
      questions: true,
    },
  });

  return NextResponse.json(quiz);
}

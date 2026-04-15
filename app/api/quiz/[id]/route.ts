import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const quiz = await db.quiz.findUnique({
    where: { id: params.id },
    include: {
      questions: true,
    },
  });

  return NextResponse.json(quiz);
}
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, quizId, answers } = body;

    if (!userId || !quizId || !answers) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });

    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }

    let correct = 0;
    let wrong = 0;

    quiz.questions.forEach((q: any) => {
      const userAnswer = answers?.[q.id];

      if (!userAnswer) return;

      if (userAnswer === q.answer) {
        correct++;
      } else {
        wrong++;
      }
    });

    const score = correct;

    const result = await db.quizResult.create({
      data: {
        userId,
        quizId,
        score,
        correct,
        wrong,
        answers,

        // 🔥 RELATION FIX (WAJIB)
        user: {
          connect: { id: userId },
        },
        quiz: {
          connect: { id: quizId },
        },
      },
    });

    return NextResponse.json({
      message: "Quiz submitted",
      score,
      correct,
      wrong,
      result,
    });

  } catch (error) {
    console.error("QUIZ ERROR:", error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
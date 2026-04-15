import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID_DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;

function normalizeDifficulty(value: unknown): (typeof VALID_DIFFICULTIES)[number] {
  if (typeof value !== "string") {
    return "MEDIUM";
  }

  const normalized = value.trim().toUpperCase();
  return VALID_DIFFICULTIES.includes(normalized as (typeof VALID_DIFFICULTIES)[number])
    ? (normalized as (typeof VALID_DIFFICULTIES)[number])
    : "MEDIUM";
}

export async function GET() {
  try {
    const quizzes = await prisma.quiz.findMany({
      include: {
        module: {
          include: {
            course: true,
          },
        },
        questions: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    return NextResponse.json(
      quizzes.map((quiz) => ({
        id: quiz.id,
        title: quiz.title,
        status: quiz.status,
        moduleTitle: quiz.module?.title || "Modul",
        courseTitle: quiz.module?.course?.title || "Mata Kuliah",
        totalQuestions: quiz.questions.length,
      }))
    );
  } catch (error) {
    console.error("DOSEN QUIZ GET ERROR:", error);
    return NextResponse.json({ message: "Gagal mengambil daftar quiz" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const moduleId = typeof body.moduleId === "string" ? body.moduleId : "";
    const questions = Array.isArray(body.questions) ? body.questions : [];

    if (!title || !moduleId || questions.length === 0) {
      return NextResponse.json({ message: "Judul, modul, dan pertanyaan wajib diisi." }, { status: 400 });
    }

    const quiz = await prisma.quiz.create({
      data: {
        title,
        moduleId,
        status: "PENDING",
        questions: {
          create: questions.map((question) => ({
            question: question.question,
            type: question.type,
            options: Array.isArray(question.options) ? question.options : null,
            answer: typeof question.answer === "string" ? question.answer : "",
            difficulty: normalizeDifficulty(question.difficulty),
          })),
        },
      },
      include: {
        questions: true,
      },
    });

    return NextResponse.json({
      message: "Quiz berhasil dibuat dan menunggu approval admin.",
      quiz,
    });
  } catch (error) {
    console.error("DOSEN QUIZ POST ERROR:", error);
    return NextResponse.json({ message: "Gagal membuat quiz" }, { status: 500 });
  }
}

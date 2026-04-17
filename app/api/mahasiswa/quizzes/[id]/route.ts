import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function normalizeAnswer(value: unknown) {
  if (typeof value !== "string") return "";

  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getMeaningfulTokens(value: string) {
  const stopwords = new Set([
    "yang", "dan", "di", "ke", "dari", "untuk", "dengan", "atau", "pada",
    "adalah", "ialah", "itu", "ini", "karena", "sebagai", "dalam", "oleh",
    "the", "a", "an", "of", "to", "in", "on", "for", "is", "are",
  ]);

  return value
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !stopwords.has(token));
}

function calculateEssaySimilarity(studentAnswer: string, referenceAnswer: string) {
  const normalizedStudent = normalizeAnswer(studentAnswer);
  const normalizedReference = normalizeAnswer(referenceAnswer);

  if (!normalizedStudent || !normalizedReference) return 0;
  if (normalizedStudent === normalizedReference) return 1;
  if (
    normalizedStudent.includes(normalizedReference) ||
    normalizedReference.includes(normalizedStudent)
  ) {
    return 0.92;
  }

  const studentTokens = getMeaningfulTokens(normalizedStudent);
  const referenceTokens = getMeaningfulTokens(normalizedReference);

  if (!studentTokens.length || !referenceTokens.length) return 0;

  const studentSet = new Set(studentTokens);

  const overlapCount = referenceTokens.filter((token) => studentSet.has(token)).length;
  const coverage = overlapCount / referenceTokens.length;
  const precision = overlapCount / studentTokens.length;
  const harmonicMean =
    coverage + precision > 0 ? (2 * coverage * precision) / (coverage + precision) : 0;

  return Math.max(coverage, harmonicMean);
}

function isEssayAnswerAccepted(studentAnswer: string, referenceAnswer: string) {
  const similarity = calculateEssaySimilarity(studentAnswer, referenceAnswer);
  return similarity >= 0.6;
}

function parseStoredAnswers(value: unknown): Record<string, string> {
  if (!value) return {};

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" ? (parsed as Record<string, string>) : {};
    } catch {
      return {};
    }
  }

  return typeof value === "object" ? (value as Record<string, string>) : {};
}

function buildResultDetail(quiz: {
  questions: Array<{
    id: string;
    question: string;
    type: string;
    options: unknown;
    answer: string | null;
  }>;
}, result: {
  id: string;
  score: number;
  correct: number;
  wrong: number;
  createdAt: Date;
  answers: unknown;
}) {
  const savedAnswers = parseStoredAnswers(result.answers);

  return {
    id: result.id,
    score: result.score,
    correct: result.correct,
    wrong: result.wrong,
    createdAt: result.createdAt,
    answers: savedAnswers,
    questions: quiz.questions.map((question) => {
      const studentAnswer = typeof savedAnswers[question.id] === "string" ? savedAnswers[question.id] : "";
      const referenceAnswer = question.answer || "";
      const isEssay = question.type === "ESSAY";
      const isCorrect = isEssay
        ? isEssayAnswerAccepted(studentAnswer, referenceAnswer)
        : studentAnswer === referenceAnswer;

      return {
        id: question.id,
        question: question.question,
        type: question.type,
        options: question.options,
        studentAnswer,
        referenceAnswer,
        isCorrect,
      };
    }),
  };
}

function sanitizeQuizForStudent<T extends {
  questions: Array<{
    id: string;
    question: string;
    type: string;
    options: unknown;
    difficulty?: string | null;
  }>;
}>(quiz: T) {
  return {
    ...quiz,
    questions: quiz.questions.map((question) => ({
      id: question.id,
      question: question.question,
      type: question.type,
      options: question.options,
      difficulty: question.difficulty || null,
    })),
  };
}

// ====================================================
// 1. GET: Mengambil Data Kuis & Soal untuk Mahasiswa
// ====================================================
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id || id === "undefined") {
      return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const quiz = await prisma.quiz.findUnique({
      where: { id: id },
      include: {
        questions: true, // Ambil semua pertanyaan
        module: {
          select: { 
            title: true, 
            course: { select: { title: true } } 
          },
        },
      },
    });

    if (!quiz) return NextResponse.json(null, { status: 404 });

    const sanitizedQuiz = sanitizeQuizForStudent(quiz);

    if (!userId) {
      return NextResponse.json(sanitizedQuiz);
    }

    const latestResult = await prisma.quizResult.findFirst({
      where: {
        quizId: id,
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      ...sanitizedQuiz,
      result: latestResult ? buildResultDetail(quiz, latestResult) : null,
    });
  } catch (error) {
    console.error("GET QUIZ ERROR:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// ====================================================
// 2. POST: Memproses Jawaban & Menyimpan Nilai ke Database
// ====================================================
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await req.json();
    
    // answers berisi daftar jawaban dari mahasiswa { "id_soal": "opsi_jawaban" }
    const { userId, answers } = body; 

    if (!userId) {
      return NextResponse.json({ message: "User ID diperlukan" }, { status: 400 });
    }

    // 1. Ambil kuis beserta kunci jawabannya dari database
    const quiz = await prisma.quiz.findUnique({
      where: { id: id },
      include: { questions: true },
    });

    if (!quiz) {
      return NextResponse.json({ message: "Kuis tidak ditemukan" }, { status: 404 });
    }

    // 2. Hitung jumlah jawaban benar dan salah
    let correctCount = 0;
    const totalQuestions = quiz.questions.length;

    quiz.questions.forEach((q) => {
      // Cek field kunci jawaban (bisa 'correctAnswer' atau 'answer' tergantung schema)
      const kunciJawaban = q.correctAnswer || q.answer || "";
      const jawabanMahasiswa = typeof answers?.[q.id] === "string" ? answers[q.id] : "";
      
      // Jika opsi yang dipilih sama dengan kunci jawaban, maka benar
      const isCorrect =
        q.type === "ESSAY"
          ? isEssayAnswerAccepted(jawabanMahasiswa, kunciJawaban)
          : jawabanMahasiswa === kunciJawaban;

      if (isCorrect) {
        correctCount++;
      }
    });

    const wrongCount = totalQuestions - correctCount;

    // 3. Kalkulasi Skor (Skala 100)
    const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    // 4. Simpan hasil ke tabel QuizResult beserta detail benar/salah
    const existingResult = await prisma.quizResult.findFirst({
      where: {
        userId,
        quizId: id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const resultData = {
      userId,
      quizId: id,
      score,
      correct: correctCount,
      wrong: wrongCount,
      answers,
    };

    const result = existingResult
      ? await prisma.quizResult.update({
          where: { id: existingResult.id },
          data: resultData,
        })
      : await prisma.quizResult.create({
          data: resultData,
        });

    return NextResponse.json({
      score,
      result: buildResultDetail(quiz, result),
    });
  } catch (error) {
    console.error("SUBMIT QUIZ ERROR:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    return NextResponse.json(quiz);
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

    quiz.questions.forEach((q: any) => {
      // Cek field kunci jawaban (bisa 'correctAnswer' atau 'answer' tergantung schema)
      const kunciJawaban = q.correctAnswer || q.answer; 
      
      // Jika opsi yang dipilih sama dengan kunci jawaban, maka benar
      if (answers[q.id] === kunciJawaban) {
        correctCount++;
      }
    });

    const wrongCount = totalQuestions - correctCount;

    // 3. Kalkulasi Skor (Skala 100)
    const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    // 4. Simpan hasil ke tabel QuizResult beserta detail benar/salah
    const result = await prisma.quizResult.create({
      data: {
        userId: userId,
        quizId: id,
        score: score,
        correct: correctCount, // Wajib ada untuk memenuhi Schema
        wrong: wrongCount,     // Wajib ada untuk memenuhi Schema
        answers: JSON.stringify(answers), // Menyimpan riwayat jawaban mahasiswa
      },
    });

    return NextResponse.json({ score: score, result });
  } catch (error) {
    console.error("SUBMIT QUIZ ERROR:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
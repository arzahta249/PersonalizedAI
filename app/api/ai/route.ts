import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const OPENROUTER_API_KEY =
  process.env.OPENROUTER_API_KEY ||
  "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";
const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL || "nvidia/nemotron-3-super-120b-a12b:free";
const REQUEST_TIMEOUT_MS = 25000;

const WEBSITE_CONTEXT = `
Nama aplikasi: Personalized AI / e-learning AI training path.

Informasi pembuat website:
- Nama pembuat: Mochamad Alifi Arzahta
- Institusi: Universitas Pancasakti Tegal

Role dan kemampuan utama:
- ADMIN: memantau dashboard admin, melihat statistik pengguna, mengelola user, materi, approval quiz, dan penugasan.
- DOSEN: mengelola kursus, materi, kuis, penugasan, melihat statistik dosen, dan memantau aktivitas mahasiswa.
- MAHASISWA: membuka dashboard belajar, melihat materi kuliah, penugasan, ujian atau quiz, profil, serta progres belajar.

Modul inti website:
- Autentikasi login dan register.
- Dashboard berbasis role.
- Course dan module pembelajaran.
- Lesson teks, video, file.
- Quiz dan hasil quiz.
- Assignment dan submission.
- Profil pengguna.

Aturan jawaban:
- Jelaskan website berdasarkan fitur yang benar-benar ada di aplikasi ini.
- Jika user bertanya cara menggunakan halaman tertentu, jawab sesuai role dan halaman aktifnya.
- Jika ada fitur yang belum jelas atau belum tersedia dari konteks aplikasi, katakan dengan jujur.
- Jawab dalam Bahasa Indonesia yang natural, ramah, dan mudah dipahami.
- Tulis jawaban dalam teks biasa yang rapi, tanpa markdown seperti ##, **, bullet markdown, atau code block.
- Fokus menjadi asisten produk untuk website ini, bukan chatbot umum.
`;

function getSectionLabel(currentPath?: string) {
  if (!currentPath || currentPath === "/") return "landing page";
  if (currentPath.includes("/dashboard/admin")) return "dashboard admin";
  if (currentPath.includes("/dashboard/dosen")) return "dashboard dosen";
  if (currentPath.includes("/dashboard/mahasiswa")) return "dashboard mahasiswa";
  if (currentPath.includes("/courses")) return "halaman kursus";
  if (currentPath.includes("/quiz")) return "halaman quiz";
  if (currentPath.includes("/assignments")) return "halaman penugasan";
  if (currentPath.includes("/profile")) return "halaman profil";
  return currentPath;
}

function buildLocalFallbackReply(input: string, currentPath?: string) {
  const normalized = input.toLowerCase();

  if (
    normalized.includes("fitur") ||
    normalized.includes("apa saja") ||
    normalized.includes("website ini") ||
    normalized.includes("platform ini")
  ) {
    return "Website ini adalah platform e-learning dengan tiga role utama: mahasiswa, dosen, dan admin. Fitur utamanya mencakup login/register, kursus dan modul pembelajaran, lesson teks/video/file, quiz, penugasan, progres belajar, profil pengguna, serta dashboard yang berbeda untuk tiap role.";
  }

  if (normalized.includes("mahasiswa")) {
    return "Untuk mahasiswa, sistem ini dipakai untuk membuka materi kuliah, mengerjakan quiz, melihat penugasan, memantau progres belajar, dan mengelola profil. Alurnya biasanya mulai dari membuka course, mempelajari modul, lalu lanjut ke quiz atau tugas.";
  }

  if (normalized.includes("dosen")) {
    return "Untuk dosen, fitur utamanya adalah mengelola kursus, membuat materi, menyusun quiz, menambahkan penugasan, serta melihat aktivitas pembelajaran. Dosen juga bisa memanfaatkan AI untuk membantu membuat draft materi, quiz, atau tugas.";
  }

  if (normalized.includes("admin")) {
    return "Untuk admin, dashboard dipakai untuk memantau statistik sistem, mengelola user, meninjau materi, approval quiz, dan penugasan. Role admin membantu menjaga data dan alur pembelajaran tetap tertata.";
  }

  if (
    normalized.includes("quiz") ||
    normalized.includes("kuis") ||
    normalized.includes("ujian")
  ) {
    return "Fitur quiz dipakai untuk evaluasi pembelajaran. Dosen membuat quiz, admin dapat melakukan approval, lalu mahasiswa mengerjakannya dari dashboard mereka dan sistem menyimpan hasil pengerjaan.";
  }

  if (
    normalized.includes("materi") ||
    normalized.includes("course") ||
    normalized.includes("kursus") ||
    normalized.includes("modul")
  ) {
    return "Materi di website ini dikelola dalam bentuk course dan module. Dosen membuat course, menambahkan modul atau lesson, lalu mahasiswa mengakses materi itu sebagai jalur belajar yang terstruktur.";
  }

  if (
    normalized.includes("tugas") ||
    normalized.includes("assignment") ||
    normalized.includes("penugasan")
  ) {
    return "Fitur penugasan memungkinkan dosen membuat tugas dengan deadline, mahasiswa mengumpulkan jawaban, lalu dosen atau admin memberi penilaian sesuai alur yang tersedia di dashboard.";
  }

  if (currentPath === "/") {
    return "Landing page ini menampilkan gambaran umum Personalized AI, mulai dari manfaat platform, fitur utama, alur role, sampai demo asisten AI. Pengunjung bisa lanjut ke login, register, atau memahami alur penggunaan platform langsung dari section yang tersedia.";
  }

  return "Saya bisa membantu menjelaskan fitur website ini, perbedaan role, alur penggunaan materi, quiz, penugasan, atau fungsi halaman yang sedang Anda buka. Coba tanya lebih spesifik, misalnya 'apa fungsi dashboard dosen?' atau 'bagaimana alur mahasiswa belajar di sistem ini?'.";
}

async function getLiveContext() {
  try {
    const [totalUsers, totalCourses, totalModules, totalQuiz, totalAssignments] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.module.count(),
      prisma.quiz.count(),
      prisma.assignment.count(),
    ]);

    return `Statistik sistem saat ini: ${totalUsers} user, ${totalCourses} kursus, ${totalModules} modul, ${totalQuiz} quiz, ${totalAssignments} penugasan.`;
  } catch {
    return "Statistik sistem real-time sedang tidak tersedia, jadi jawaban harus tetap mengacu pada struktur fitur aplikasi.";
  }
}

export async function POST(req: Request) {
  let fallbackPrompt = "";
  let fallbackPath = "";

  try {
    const body = await req.json();
    const messages = Array.isArray(body.messages) ? (body.messages as ChatMessage[]) : [];
    const userRole = typeof body.role === "string" ? body.role : "GUEST";
    const currentPath = typeof body.currentPath === "string" ? body.currentPath : "";
    const userName = typeof body.userName === "string" ? body.userName : "Pengguna";

    if (!messages.length) {
      return NextResponse.json({ message: "Pesan tidak boleh kosong." }, { status: 400 });
    }

    const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");
    fallbackPrompt = lastUserMessage?.content || "";
    fallbackPath = currentPath;

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json({
        reply: buildLocalFallbackReply(fallbackPrompt, fallbackPath),
        source: "local_fallback",
      });
    }

    const liveContext = await getLiveContext();
    const sectionLabel = getSectionLabel(currentPath);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const systemMessage: ChatMessage = {
      role: "system",
      content: `${WEBSITE_CONTEXT}

Konteks sesi:
- Role aktif: ${userRole}
- Nama pengguna: ${userName}
- Halaman aktif: ${sectionLabel}
- Path aktif: ${currentPath || "tidak diketahui"}
- ${liveContext}

Tugasmu:
- Bantu user memahami website ini, alur tiap role, dan fungsi menu yang sedang dibuka.
- Jika user meminta penjelasan tentang website, jelaskan fitur-fitur penting, perbedaan role, dan manfaat halaman aktif.
- Kalau user bertanya sesuatu di luar konteks website, arahkan jawaban agar tetap relevan ke aplikasi ini selama memungkinkan.`,
    };

    const trimmedMessages = messages.slice(-10);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Personalized AI Assistant",
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [systemMessage, ...trimmedMessages],
        temperature: 0.4,
        max_tokens: 500,
        reasoning: {
          enabled: false,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const data = await response.json();

    if (!response.ok) {
      const errorMessage =
        data?.error?.message || data?.message || "Gagal terhubung ke layanan AI.";
      return NextResponse.json(
        {
          reply: buildLocalFallbackReply(fallbackPrompt, fallbackPath),
          source: "local_fallback",
          message: errorMessage,
        },
        { status: 200 }
      );
    }

    const reply =
      data?.choices?.[0]?.message?.content ||
      "Maaf, saya belum bisa memberikan jawaban saat ini.";

    return NextResponse.json({ reply });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        {
          message:
            "Respons AI terlalu lama. Coba kirim pertanyaan yang lebih singkat atau ulangi beberapa saat lagi.",
        },
        { status: 504 }
      );
    }

    if (error instanceof TypeError) {
      return NextResponse.json(
        {
          reply: buildLocalFallbackReply(fallbackPrompt, fallbackPath),
          source: "local_fallback",
        },
        { status: 200 }
      );
    }

    console.error("AI CHAT ERROR:", error);
    return NextResponse.json(
      {
        reply: buildLocalFallbackReply(fallbackPrompt, fallbackPath),
        source: "local_fallback",
      },
      { status: 200 }
    );
  }
}

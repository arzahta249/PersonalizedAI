import { NextResponse } from "next/server";

type GeneratorType = "MATERI" | "QUIZ" | "ASSIGNMENT";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL || "nvidia/nemotron-3-super-120b-a12b:free";
const REQUEST_TIMEOUT_MS = 20000;

function buildFallbackDraft(type: GeneratorType, prompt: string, courseTitle: string, moduleTitle?: string) {
  const topic = prompt.trim() || courseTitle || "Topik pembelajaran";

  if (type === "MATERI") {
    return {
      title: `Materi AI: ${topic}`,
      type: "TEXT",
      difficulty: "INTERMEDIATE",
      content: [
        `Pendahuluan ${topic}`,
        `Materi ini dirancang untuk membantu mahasiswa memahami konsep inti ${topic} secara bertahap.`,
        "",
        "Pokok bahasan:",
        "1. Definisi dan ruang lingkup",
        "2. Konsep utama dan contoh penerapan",
        "3. Studi kasus singkat",
        "4. Ringkasan dan latihan refleksi",
        "",
        "Penutup:",
        "Mahasiswa diharapkan mampu menjelaskan konsep inti, membandingkan pendekatan, dan menerapkannya pada kasus sederhana.",
      ].join("\n"),
    };
  }

  if (type === "QUIZ") {
    return {
      title: `Quiz AI: ${moduleTitle || topic}`,
      description: `Kuis otomatis untuk mengevaluasi pemahaman mahasiswa pada topik ${moduleTitle || topic}.`,
      questions: [
        {
          question: `Apa tujuan utama mempelajari ${moduleTitle || topic}?`,
          type: "ESSAY",
          difficulty: "EASY",
          answer: "Menjelaskan tujuan pembelajaran, manfaat, dan konteks penerapan topik.",
          options: null,
        },
        {
          question: `Manakah pernyataan yang paling tepat mengenai ${moduleTitle || topic}?`,
          type: "MCQ",
          difficulty: "MEDIUM",
          options: [
            "Topik ini tidak memiliki penerapan nyata",
            "Topik ini hanya relevan di teori",
            "Topik ini dapat diterapkan pada proses kerja dan analisis kasus",
            "Topik ini tidak perlu dievaluasi",
          ],
          answer: "Topik ini dapat diterapkan pada proses kerja dan analisis kasus",
        },
      ],
    };
  }

  return {
    title: `Penugasan AI: ${topic}`,
    dueInDays: 7,
    description: [
      `Buatlah analisis singkat terkait topik ${topic}.`,
      "",
      "Ketentuan:",
      "1. Jelaskan konsep utama dengan bahasa sendiri.",
      "2. Sertakan satu studi kasus atau contoh nyata.",
      "3. Tuliskan kesimpulan pribadi dan rekomendasi.",
      "",
      "Format pengumpulan: PDF atau DOCX, 2-4 halaman.",
    ].join("\n"),
  };
}

function sanitizeJsonText(raw: string) {
  return raw.replace(/```json|```/g, "").trim();
}

export async function POST(req: Request) {
  let requestedType: GeneratorType = "MATERI";
  let requestedPrompt = "";
  let requestedCourseTitle = "Mata Kuliah";
  let requestedModuleTitle = "";

  try {
    const body = await req.json();
    const type = typeof body.type === "string" ? body.type.toUpperCase() as GeneratorType : null;
    const prompt = typeof body.prompt === "string" ? body.prompt : "";
    const courseTitle = typeof body.courseTitle === "string" ? body.courseTitle : "Mata Kuliah";
    const moduleTitle = typeof body.moduleTitle === "string" ? body.moduleTitle : "";

    requestedPrompt = prompt;
    requestedCourseTitle = courseTitle;
    requestedModuleTitle = moduleTitle;

    if (!type || !["MATERI", "QUIZ", "ASSIGNMENT"].includes(type)) {
      return NextResponse.json({ message: "Tipe generator tidak valid." }, { status: 400 });
    }

    requestedType = type;

    if (!prompt.trim()) {
      return NextResponse.json({ message: "Prompt AI wajib diisi." }, { status: 400 });
    }

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json({
        draft: buildFallbackDraft(type, prompt, courseTitle, moduleTitle),
        source: "fallback",
      });
    }

    const instructions = {
      MATERI:
        "Kembalikan JSON valid dengan shape { title, type, difficulty, content }. Field type harus salah satu TEXT, VIDEO, FILE. Field content berupa materi siap pakai dalam Bahasa Indonesia.",
      QUIZ:
        "Kembalikan JSON valid dengan shape { title, description, questions }. questions adalah array 4-8 item, tiap item berisi { question, type, difficulty, options, answer }. Untuk ESSAY set options=null. Untuk MCQ isi 4 opsi string dan answer harus persis salah satu opsi.",
      ASSIGNMENT:
        "Kembalikan JSON valid dengan shape { title, dueInDays, description }. dueInDays integer 3-14. description adalah instruksi tugas yang siap dipublikasikan.",
    } as const;

    const fallbackDraft = buildFallbackDraft(type, prompt, courseTitle, moduleTitle);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Personalized AI Content Studio",
        },
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          temperature: 0.5,
          max_tokens: 1200,
          messages: [
            {
              role: "system",
              content:
                "Anda adalah AI instructional designer untuk platform e-learning kampus. Jawab hanya JSON valid tanpa penjelasan tambahan.",
            },
            {
              role: "user",
              content: [
                `Jenis konten: ${type}`,
                `Mata kuliah: ${courseTitle}`,
                moduleTitle ? `Modul: ${moduleTitle}` : "",
                `Instruksi output: ${instructions[type]}`,
                `Perintah dosen: ${prompt}`,
              ]
                .filter(Boolean)
                .join("\n"),
            },
          ],
        }),
        signal: controller.signal,
      });
    } catch (error) {
      clearTimeout(timeout);

      if (error instanceof Error) {
        console.error("AI GENERATOR NETWORK ERROR:", error);
      }

      return NextResponse.json({
        draft: fallbackDraft,
        source: "fallback",
        reason: "network_error",
      });
    }

    clearTimeout(timeout);

    const data = await response.json();
    const rawReply = data?.choices?.[0]?.message?.content;

    if (!response.ok || !rawReply) {
      return NextResponse.json({
        draft: fallbackDraft,
        source: "fallback",
        reason: "invalid_ai_response",
      });
    }

    try {
      const draft = JSON.parse(sanitizeJsonText(rawReply));
      return NextResponse.json({ draft, source: "openrouter" });
    } catch {
      return NextResponse.json({
        draft: fallbackDraft,
        source: "fallback",
        reason: "invalid_json",
      });
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json({
        draft: buildFallbackDraft(requestedType, requestedPrompt, requestedCourseTitle, requestedModuleTitle),
        source: "fallback",
        reason: "timeout",
      });
    }

    console.error("AI GENERATOR ERROR:", error);
    return NextResponse.json({
      draft: buildFallbackDraft(requestedType, requestedPrompt, requestedCourseTitle, requestedModuleTitle),
      source: "fallback",
      reason: "unexpected_error",
    });
  }
}

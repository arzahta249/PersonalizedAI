"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import DosenAiStudio from "@/components/DosenAiStudio";

type CourseRow = {
  id: string;
  title: string;
  modules?: ModuleRow[];
};

type ModuleRow = {
  id: string;
  title: string;
  courseId?: string;
};

type QuizQuestion = {
  question: string;
  type: "MCQ" | "ESSAY";
  options: string[] | null;
  answer: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
};

export default function CreateQuizPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/dosen/courses")
      .then((res) => res.json())
      .then((data) => {
        const normalized = Array.isArray(data) ? data : [];
        setCourses(normalized);
        if (normalized[0]?.id) {
          setSelectedCourseId(normalized[0].id);
        }
      });
  }, []);

  const modules = useMemo(
    () => courses.find((course) => course.id === selectedCourseId)?.modules || [],
    [courses, selectedCourseId]
  );

  useEffect(() => {
    if (modules[0]?.id && !modules.some((moduleItem) => moduleItem.id === moduleId)) {
      setModuleId(modules[0].id);
    }
  }, [moduleId, modules]);

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        question: "",
        type: "MCQ",
        options: ["", "", "", ""],
        answer: "",
        difficulty: "MEDIUM",
      },
    ]);
  };

  const updateQuestion = (index: number, payload: Partial<QuizQuestion>) => {
    setQuestions((prev) =>
      prev.map((question, currentIndex) =>
        currentIndex === index ? { ...question, ...payload } : question
      )
    );
  };

  const applyAiDraft = (draft: { title?: string; questions?: QuizQuestion[] }) => {
    if (draft.title) setTitle(draft.title);
    if (Array.isArray(draft.questions)) setQuestions(draft.questions);
  };

  const handleSubmit = async () => {
    if (!title || !moduleId || questions.length === 0) {
      toast.error("Judul, modul, dan minimal satu pertanyaan wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/dosen/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, moduleId, questions }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Gagal menyimpan quiz.");
        return;
      }

      toast.success(data.message || "Quiz berhasil dibuat.");
      router.push("/dashboard/dosen/quiz");
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan saat membuat quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 p-4 md:p-8">
      <DosenAiStudio
        type="QUIZ"
        courses={courses.map((course) => ({ id: course.id, title: course.title }))}
        modules={modules.map((moduleItem) => ({ id: moduleItem.id, title: moduleItem.title }))}
        onApply={applyAiDraft}
      />

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.25em] text-slate-500">Judul Quiz</label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Contoh: Post Test Algoritma Pencarian"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold outline-none transition focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.25em] text-slate-500">Mata Kuliah</label>
              <select
                value={selectedCourseId}
                onChange={(event) => setSelectedCourseId(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold outline-none"
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.25em] text-slate-500">Modul</label>
              <select
                value={moduleId}
                onChange={(event) => setModuleId(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold outline-none"
              >
                {modules.map((moduleItem) => (
                  <option key={moduleItem.id} value={moduleItem.id}>
                    {moduleItem.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        {questions.map((question, index) => (
          <article key={index} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-3">
                <select
                  value={question.type}
                  onChange={(event) =>
                    updateQuestion(index, {
                      type: event.target.value as "MCQ" | "ESSAY",
                      options: event.target.value === "ESSAY" ? null : ["", "", "", ""],
                      answer: "",
                    })
                  }
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-black uppercase tracking-[0.2em]"
                >
                  <option value="MCQ">Pilihan Ganda</option>
                  <option value="ESSAY">Essay</option>
                </select>
                <select
                  value={question.difficulty}
                  onChange={(event) =>
                    updateQuestion(index, { difficulty: event.target.value as QuizQuestion["difficulty"] })
                  }
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-black uppercase tracking-[0.2em]"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => setQuestions((prev) => prev.filter((_, currentIndex) => currentIndex !== index))}
                className="rounded-xl border border-rose-200 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-rose-600 transition hover:bg-rose-50"
              >
                Hapus
              </button>
            </div>

            <textarea
              rows={3}
              value={question.question}
              onChange={(event) => updateQuestion(index, { question: event.target.value })}
              placeholder="Tulis pertanyaan di sini..."
              className="mt-5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold outline-none transition focus:border-blue-500 focus:bg-white"
            />

            {question.type === "MCQ" ? (
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {(question.options || []).map((option, optionIndex) => (
                  <div key={optionIndex} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                      Opsi {String.fromCharCode(65 + optionIndex)}
                    </label>
                    <input
                      value={option}
                      onChange={(event) => {
                        const nextOptions = [...(question.options || [])];
                        nextOptions[optionIndex] = event.target.value;
                        updateQuestion(index, { options: nextOptions });
                      }}
                      className="w-full bg-transparent text-sm font-semibold outline-none"
                    />
                  </div>
                ))}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                    Jawaban Benar
                  </label>
                  <select
                    value={question.answer}
                    onChange={(event) => updateQuestion(index, { answer: event.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold outline-none"
                  >
                    <option value="">Pilih jawaban yang benar</option>
                    {(question.options || []).map((option, optionIndex) => (
                      <option key={optionIndex} value={option}>
                        {option || `Opsi ${String.fromCharCode(65 + optionIndex)}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="mt-5">
                <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Panduan Jawaban
                </label>
                <textarea
                  rows={4}
                  value={question.answer}
                  onChange={(event) => updateQuestion(index, { answer: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold outline-none transition focus:border-blue-500 focus:bg-white"
                />
              </div>
            )}
          </article>
        ))}

        <button
          type="button"
          onClick={addQuestion}
          className="w-full rounded-[1.5rem] border-2 border-dashed border-slate-300 bg-white px-5 py-5 text-sm font-black uppercase tracking-[0.25em] text-slate-500 transition hover:border-blue-400 hover:text-blue-600"
        >
          Tambah Pertanyaan
        </button>
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={submitting}
          onClick={handleSubmit}
          className={`inline-flex items-center gap-3 rounded-2xl bg-slate-950 px-6 py-4 text-sm font-black uppercase tracking-[0.25em] text-white transition hover:bg-blue-600 disabled:opacity-60 ${
            submitting ? "btn-loading" : ""
          }`}
        >
          {submitting && <span className="loading-orb text-white" />}
          <span className={submitting ? "loading-dots" : ""}>{submitting ? "Menyimpan" : "Simpan Quiz"}</span>
        </button>
      </div>
    </div>
  );
}

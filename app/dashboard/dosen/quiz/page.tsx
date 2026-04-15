"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2, Plus, Sparkles, FileQuestion, ChevronRight } from "lucide-react";

type QuizRow = {
  id: string;
  title: string;
  status: string;
  moduleTitle: string;
  courseTitle: string;
  totalQuestions: number;
};

export default function DosenQuizPage() {
  const [quizzes, setQuizzes] = useState<QuizRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dosen/quiz")
      .then((res) => res.json())
      .then((data) => setQuizzes(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Memuat Ruang Quiz...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-8">
      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm md:p-9">
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-600">Quiz Lab</p>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
            Buat quiz modern, cepat, dan siap approval.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            Dosen bisa membuat quiz manual atau dibantu AI. Semua quiz yang dibuat akan masuk ke alur approval admin
            sebelum tampil ke mahasiswa.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard/dosen/quiz/create"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-blue-600"
            >
              <Plus className="h-4 w-4" />
              Buat Quiz Baru
            </Link>
            <Link
              href="/dashboard/dosen/quiz/create"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-black text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
            >
              <Sparkles className="h-4 w-4" />
              Gunakan AI Builder
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] bg-[linear-gradient(135deg,#0f172a,#1e3a8a)] p-7 text-white shadow-[0_30px_80px_-35px_rgba(15,23,42,0.85)] md:p-9">
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-200">Ringkasan</p>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100">Total Quiz</p>
              <p className="mt-3 text-3xl font-black">{quizzes.length}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100">Pending</p>
              <p className="mt-3 text-3xl font-black">{quizzes.filter((quiz) => quiz.status === "PENDING").length}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div>
            <h2 className="text-xl font-black text-slate-900">Daftar Quiz Dosen</h2>
            <p className="mt-1 text-sm text-slate-500">Pantau status publikasi, modul terkait, dan jumlah soal.</p>
          </div>
        </div>

        <div className="p-6">
          {quizzes.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 text-center">
              <FileQuestion className="h-12 w-12 text-slate-300" />
              <h3 className="mt-4 text-xl font-bold text-slate-800">Belum ada quiz</h3>
              <p className="mt-2 max-w-md text-sm text-slate-500">
                Gunakan AI builder untuk membuat draft soal otomatis, lalu review dan publikasikan dengan lebih cepat.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {quizzes.map((quiz) => (
                <Link
                  key={quiz.id}
                  href="/dashboard/dosen/quiz/create"
                  className="group rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:border-blue-300 hover:bg-white hover:shadow-xl"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="rounded-2xl bg-blue-100 p-3 text-blue-600">
                      <FileQuestion className="h-5 w-5" />
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${
                        quiz.status === "APPROVED"
                          ? "bg-emerald-100 text-emerald-700"
                          : quiz.status === "REJECTED"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {quiz.status}
                    </span>
                  </div>
                  <p className="mt-5 text-[11px] font-black uppercase tracking-[0.25em] text-blue-600">{quiz.courseTitle}</p>
                  <h3 className="mt-2 text-xl font-black leading-tight text-slate-900">{quiz.title}</h3>
                  <p className="mt-2 text-sm text-slate-500">Modul: {quiz.moduleTitle}</p>
                  <div className="mt-5 flex items-center justify-between text-sm font-bold text-slate-500">
                    <span>{quiz.totalQuestions} soal</span>
                    <span className="inline-flex items-center gap-2 text-blue-600">
                      Edit lagi
                      <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

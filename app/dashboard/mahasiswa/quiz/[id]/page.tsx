"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, CheckCircle2, Send, FileText, CircleCheck, CircleX } from "lucide-react";
import Link from "next/link";
import { useAppDialog } from "@/components/AppDialogProvider";

type QuizQuestion = {
  id: string;
  question?: string;
  text?: string;
  type: "MCQ" | "ESSAY";
  options?: string[] | string | null;
};

type QuizResultQuestion = {
  id: string;
  question: string;
  type: "MCQ" | "ESSAY";
  options?: string[] | string | null;
  studentAnswer: string;
  referenceAnswer: string;
  isCorrect: boolean;
};

type QuizResultDetail = {
  id: string;
  score: number;
  correct: number;
  wrong: number;
  createdAt: string;
  questions: QuizResultQuestion[];
};

type QuizDetail = {
  id: string;
  title: string;
  module?: {
    title?: string;
    course?: {
      title?: string;
    };
  };
  questions: QuizQuestion[];
  result?: QuizResultDetail | null;
};

function normalizeOptions(options: QuizQuestion["options"]) {
  if (Array.isArray(options)) return options;
  if (typeof options === "string") {
    try {
      const parsed = JSON.parse(options);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

export default function KerjakanQuizPage() {
  const params = useParams();
  const dialog = useAppDialog();
  
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [resultDetail, setResultDetail] = useState<QuizResultDetail | null>(null);

  useEffect(() => {
    if (!params?.id) return;

    const userId = localStorage.getItem("userId");
    if (!userId) {
      setLoading(false);
      return;
    }

    fetch(`/api/mahasiswa/quizzes/${params.id}?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setQuiz(data);
        setResultDetail(data?.result || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params?.id]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const answeredCount = quiz?.questions.filter((question) => {
    const answer = answers[question.id];
    return typeof answer === "string" && answer.trim().length > 0;
  }).length || 0;

  const handleSubmit = async () => {
    if (!quiz) return;

    if (answeredCount < quiz.questions.length) {
      await dialog.alert({
        title: "Jawaban belum lengkap",
        message: "Harap jawab semua pertanyaan terlebih dahulu sebelum mengumpulkan ujian.",
        confirmLabel: "Siap",
        variant: "info",
      });
      return;
    }

    const confirmed = await dialog.confirm({
      title: "Kumpulkan ujian sekarang?",
      message: "Setelah dikirim, jawaban akan diproses dan nilai akan langsung dihitung oleh sistem.",
      confirmLabel: "Ya, kumpulkan",
      cancelLabel: "Periksa lagi",
      variant: "danger",
    });

    if (!confirmed) return;

    setSubmitting(true);
    const userId = localStorage.getItem("userId");

    try {
      const res = await fetch(`/api/mahasiswa/quizzes/${params.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, answers }),
      });

      if (!res.ok) throw new Error("Gagal mengirim jawaban");

      const data = await res.json();
      setResultDetail(data.result || null);
    } catch (error) {
      console.error(error);
      await dialog.alert({
        title: "Pengumpulan gagal",
        message: "Terjadi kesalahan saat mengumpulkan kuis. Silakan coba beberapa saat lagi.",
        confirmLabel: "Tutup",
        variant: "danger",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em]">Menyiapkan Kertas Ujian...</p>
      </div>
    );
  }

  if (!quiz) {
    return <div className="text-center p-20 text-red-500">Kuis tidak ditemukan.</div>;
  }

  if (resultDetail) {
    return (
      <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8 animate-in fade-in duration-700">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full inline-block">
                Riwayat Jawaban
              </span>
              <h1 className="mt-4 text-3xl font-black text-slate-900">{quiz.title}</h1>
              <p className="text-slate-500 text-sm font-medium mt-1">
                Bab: {quiz.module?.title} | {quiz.module?.course?.title || "Mata Kuliah"}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-slate-50 border border-slate-100 px-5 py-4 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nilai</p>
                <p className="mt-2 text-3xl font-black text-blue-600">{Math.round(resultDetail.score)}</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-5 py-4 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Benar</p>
                <p className="mt-2 text-3xl font-black text-emerald-600">{resultDetail.correct}</p>
              </div>
              <div className="rounded-2xl bg-rose-50 border border-rose-100 px-5 py-4 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-rose-600">Salah</p>
                <p className="mt-2 text-3xl font-black text-rose-600">{resultDetail.wrong}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {resultDetail.questions.map((question, index) => {
            const options = normalizeOptions(question.options);
            const hasStudentAnswer = question.studentAnswer.trim().length > 0;

            return (
              <div key={question.id} className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 shrink-0 bg-slate-900 text-white font-black rounded-xl flex items-center justify-center">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-800 leading-relaxed">{question.question}</h3>
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                          question.isCorrect
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        {question.isCorrect ? <CircleCheck size={14} /> : <CircleX size={14} />}
                        {question.isCorrect ? "Benar" : "Perlu Diperbaiki"}
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      {question.type === "ESSAY" ? "Essay" : "Pilihan Ganda"}
                    </p>
                  </div>
                </div>

                {question.type === "MCQ" ? (
                  <div className="space-y-3 md:pl-14">
                    {options.map((option, optionIndex) => {
                      const isStudentChoice = question.studentAnswer === option;
                      const isReferenceAnswer = question.referenceAnswer === option;

                      return (
                        <div
                          key={`${question.id}-${optionIndex}`}
                          className={`rounded-2xl border p-4 ${
                            isReferenceAnswer
                              ? "border-emerald-200 bg-emerald-50"
                              : isStudentChoice
                                ? "border-blue-200 bg-blue-50"
                                : "border-slate-100 bg-slate-50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <span className="text-sm font-semibold text-slate-700">{option}</span>
                            <div className="flex flex-wrap justify-end gap-2">
                              {isStudentChoice ? (
                                <span className="rounded-full bg-blue-600 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                                  Jawaban Kamu
                                </span>
                              ) : null}
                              {isReferenceAnswer ? (
                                <span className="rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                                  Kunci
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="md:pl-14 grid gap-4">
                    <div className="rounded-[2rem] border border-blue-100 bg-blue-50 p-5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Jawaban Kamu</p>
                      <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">
                        {hasStudentAnswer ? question.studentAnswer : "Belum ada jawaban yang tersimpan."}
                      </p>
                    </div>
                    <div className="rounded-[2rem] border border-emerald-100 bg-emerald-50 p-5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Panduan Jawaban</p>
                      <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">
                        {question.referenceAnswer || "Belum ada panduan jawaban dari dosen."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/dashboard/mahasiswa/quiz"
            className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm text-center hover:bg-slate-800 transition-colors"
          >
            Kembali ke Daftar Kuis
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8 animate-in fade-in duration-700">
      
      {/* HEADER KUIS */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-6 z-10">
        <div>
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-full mb-3 inline-block">
            {quiz.module?.course?.title || "Mata Kuliah"}
          </span>
          <h1 className="text-2xl font-black text-slate-900">{quiz.title}</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Bab: {quiz.module?.title}</p>
        </div>
        <div className="px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</p>
          <p className="font-bold text-slate-800">
            {answeredCount} / {quiz.questions.length} Dijawab
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {quiz.questions.map((q, index: number) => {
          const options = normalizeOptions(q.options);

          return (
            <div key={q.id} className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex gap-4 items-start mb-6">
                <div className="w-10 h-10 shrink-0 bg-blue-600 text-white font-black rounded-xl flex items-center justify-center">
                  {index + 1}
                </div>
                <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-800 leading-relaxed mt-1">
                  {q.question || q.text}
                </h3>
                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                  {q.type === "ESSAY" ? "Essay" : "Pilihan Ganda"}
                </p>
                </div>
              </div>

              {q.type === "ESSAY" ? (
                <div className="pl-0 md:pl-14">
                  <label className="mb-3 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                    <FileText size={14} />
                    Tulis Jawaban Essay
                  </label>
                  <textarea
                    rows={6}
                    value={answers[q.id] || ""}
                    onChange={(event) => handleAnswerChange(q.id, event.target.value)}
                    placeholder="Tulis jawabanmu dengan jelas di sini..."
                    className="w-full rounded-[2rem] border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium leading-7 text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white"
                  />
                </div>
              ) : (
                <div className="space-y-3 pl-0 md:pl-14">
                  {options.map((opt: string, i: number) => {
                    const isSelected = answers[q.id] === opt;
                    return (
                      <button
                        key={i}
                        onClick={() => handleAnswerChange(q.id, opt)}
                        className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 ${
                          isSelected 
                            ? "border-blue-600 bg-blue-50 text-blue-800" 
                            : "border-slate-100 hover:border-blue-300 hover:bg-slate-50 text-slate-600"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? "border-blue-600" : "border-slate-300"}`}>
                            {isSelected && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>}
                          </div>
                          <span className="font-medium text-sm md:text-base leading-relaxed">{opt}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* TOMBOL SUBMIT */}
      <div className="flex justify-end pt-6">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition-all disabled:opacity-50 hover:shadow-xl hover:-translate-y-1"
        >
          {submitting ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>Kumpulkan Ujian <Send size={18} /></>
          )}
        </button>
      </div>

    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle, ChevronLeft, Send } from "lucide-react";
import Link from "next/link";
import { useAppDialog } from "@/components/AppDialogProvider";

export default function KerjakanQuizPage() {
  const params = useParams();
  const router = useRouter();
  const dialog = useAppDialog();
  
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [scoreResult, setScoreResult] = useState<number | null>(null);

  useEffect(() => {
    if (!params?.id) return;

    fetch(`/api/mahasiswa/quizzes/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setQuiz(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params?.id]);

  // Fungsi saat opsi dipilih
  const handleSelectOption = (questionId: string, option: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  // Fungsi submit ujian
  const handleSubmit = async () => {
    // Validasi apakah semua soal sudah dijawab
    if (Object.keys(answers).length < quiz.questions.length) {
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
      setScoreResult(data.score); // Tampilkan nilai
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

  // JIKA SUDAH SELESAI MENGERJAKAN (Tampilkan Hasil)
  if (scoreResult !== null) {
    return (
      <div className="max-w-2xl mx-auto mt-20 p-10 bg-white border border-slate-100 rounded-[3rem] shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={50} />
        </div>
        <h2 className="text-3xl font-black text-slate-900">Ujian Selesai!</h2>
        <p className="text-slate-500 font-medium">Kamu telah berhasil menyelesaikan kuis ini.</p>
        
        <div className="py-8 bg-slate-50 rounded-[2rem] border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nilai Akhir Kamu</p>
          <h1 className="text-7xl font-black text-blue-600">{Math.round(scoreResult)}</h1>
        </div>

        <Link href="/dashboard/mahasiswa/quiz" className="block w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-colors">
          Kembali ke Daftar Kuis
        </Link>
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
            {Object.keys(answers).length} / {quiz.questions.length} Dijawab
          </p>
        </div>
      </div>

      {/* DAFTAR SOAL */}
      <div className="space-y-8">
        {quiz.questions.map((q: any, index: number) => {
          // Asumsi opsi disimpan dalam bentuk array string atau JSON
          const options = typeof q.options === "string" ? JSON.parse(q.options) : q.options;

          return (
            <div key={q.id} className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex gap-4 items-start mb-6">
                <div className="w-10 h-10 shrink-0 bg-blue-600 text-white font-black rounded-xl flex items-center justify-center">
                  {index + 1}
                </div>
                {/* Asumsi nama field soal adalah 'question' atau 'text' */}
                <h3 className="text-lg font-bold text-slate-800 leading-relaxed mt-1">
                  {q.question || q.text}
                </h3>
              </div>

              <div className="space-y-3 pl-0 md:pl-14">
                {options?.map((opt: string, i: number) => {
                  const isSelected = answers[q.id] === opt;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSelectOption(q.id, opt)}
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

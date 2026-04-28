"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  HelpCircle, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Loader2,
  Inbox,
  Trophy
} from "lucide-react";

export default function DaftarQuizPage() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"BELUM" | "SELESAI">("BELUM");

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    
    if (userId) {
      fetch(`/api/mahasiswa/quizzes?userId=${userId}`)
        .then(res => res.json())
        .then(data => {
          setQuizzes(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em]">Memuat Kuis...</p>
      </div>
    );
  }

  // Pisahkan kuis berdasarkan status
  const pendingQuizzes = quizzes.filter(q => q.status === "BELUM");
  const completedQuizzes = quizzes.filter(q => q.status === "SELESAI");

  // Data yang akan dirender berdasarkan tab yang aktif
  const displayedQuizzes = activeTab === "BELUM" ? pendingQuizzes : completedQuizzes;

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-10 animate-in fade-in zoom-in-95 duration-700">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Ujian & Kuis</h1>
          <p className="text-slate-500 mt-2 font-medium">Uji pemahamanmu dari materi yang telah dipelajari.</p>
        </div>

        {/* TABS Pilihan */}
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab("BELUM")}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === "BELUM" 
                ? "bg-white text-blue-600 shadow-sm" 
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Tugas Baru ({pendingQuizzes.length})
          </button>
          <button 
            onClick={() => setActiveTab("SELESAI")}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === "SELESAI" 
                ? "bg-white text-emerald-600 shadow-sm" 
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Riwayat ({completedQuizzes.length})
          </button>
        </div>
      </div>

      {/* LIST KUIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayedQuizzes.length > 0 ? (
          displayedQuizzes.map((quiz) => (
            <div key={quiz.id} className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl ${activeTab === "BELUM" ? "bg-orange-50 text-orange-600" : "bg-emerald-50 text-emerald-600"}`}>
                  {activeTab === "BELUM" ? <Clock size={24} /> : <Trophy size={24} />}
                </div>
                {activeTab === "SELESAI" && (
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nilai Akhir</p>
                    <p className="text-2xl font-black text-emerald-600">{Math.round(quiz.score)}</p>
                    {quiz.submittedAt ? (
                      <p className="mt-2 text-[11px] font-semibold text-slate-400">
                        {new Date(quiz.submittedAt).toLocaleDateString("id-ID")}
                      </p>
                    ) : null}
                  </div>
                )}
              </div>
              
              <div className="space-y-1 mb-8">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
                  {quiz.courseTitle}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-3">{quiz.title}</h3>
                <p className="text-xs text-slate-500 font-medium">Bab: {quiz.moduleTitle}</p>
              </div>

              {activeTab === "BELUM" ? (
                <Link 
                  href={`/dashboard/mahasiswa/quiz/${quiz.id}`}
                  className="flex items-center justify-between w-full p-4 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl transition-colors group-hover:shadow-lg group-hover:shadow-blue-600/20"
                >
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Mulai Kerjakan</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <Link
                  href={`/dashboard/mahasiswa/quiz/${quiz.id}`}
                  className="flex items-center justify-between w-full p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 transition-colors hover:bg-emerald-100"
                >
                  <span className="flex items-center text-[10px] font-black uppercase tracking-[0.2em]">
                    <CheckCircle2 size={18} className="mr-2" />
                    Lihat Riwayat Jawaban
                  </span>
                  <ArrowRight size={18} />
                </Link>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-1 md:col-span-2 p-12 border-2 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center text-slate-400 text-center">
            <Inbox size={48} className="mb-4 opacity-20" />
            <h3 className="text-lg font-bold text-slate-700">Kosong</h3>
            <p className="text-sm">
              {activeTab === "BELUM" 
                ? "Hebat! Kamu sudah menyelesaikan semua kuis yang tersedia." 
                : "Kamu belum menyelesaikan kuis apapun."}
            </p>
          </div>
        )}
      </div>

    </div>
  );
}

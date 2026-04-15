"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { 
  PlayCircle, 
  FileText, 
  HelpCircle, 
  ChevronRight, 
  Clock, 
  Loader2,
  Inbox
} from "lucide-react";
import Link from "next/link";

export default function CourseDetailPage() {
  const params = useParams();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Pastikan params.id sudah tersedia sebelum fetch
    if (!params?.id) return;

    const fetchCourseDetail = async () => {
      setLoading(true);
      setError(false);
      
      try {
        const res = await fetch(`/api/mahasiswa/courses/${params.id}`);
        
        if (!res.ok) {
          throw new Error("Course not found");
        }

        const data = await res.json();
        
        // Cek jika data null (hasil dari res.json() bisa null jika API kirim null)
        if (!data) {
          setError(true);
        } else {
          setCourse(data);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetail();
  }, [params?.id]);

  // 1. STATE LOADING
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em]">Menyusun Silabus...</p>
      </div>
    );
  }

  // 2. STATE ERROR / TIDAK DITEMUKAN
  if (error || !course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-10">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
          <Inbox size={40} />
        </div>
        <h2 className="text-xl font-black text-slate-900">Kursus Tidak Ditemukan</h2>
        <p className="text-slate-500 mt-2 max-w-xs">ID kursus tidak valid atau kursus ini belum dipublikasikan oleh dosen.</p>
        <Link href="/dashboard/mahasiswa/courses" className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm">
          Kembali ke Daftar Kursus
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-12 animate-in fade-in zoom-in-95 duration-700">
      
      {/* 📘 HEADER SECTION */}
      <div className="relative p-10 bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="relative z-10 space-y-4">
          <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
            Detail Mata Kuliah
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {course.title}
          </h1>
          <p className="text-slate-500 max-w-2xl leading-relaxed font-medium">
            {course.description}
          </p>
          
          <div className="flex flex-wrap items-center gap-8 pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Clock size={18} /></div>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-tighter">
                {course.modules?.length || 0} Materi Pembelajaran
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><HelpCircle size={18} /></div>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-tighter">
                {course.quizzes?.length || 0} Evaluasi Kuis
              </p>
            </div>
          </div>
        </div>
        {/* Dekorasi Background */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-50/50 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* 📚 DAFTAR MATERI (KIRI) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Kurikulum Materi</h2>
          </div>
          
          <div className="space-y-4">
            {course.modules?.length > 0 ? (
              course.modules.map((module: any, index: number) => (
                <Link 
                  key={module.id} 
                  href={`/dashboard/mahasiswa/learn/${module.id}`}
                  className="group flex items-center justify-between p-6 bg-white border border-slate-100 rounded-[2.5rem] hover:border-blue-600 hover:shadow-2xl hover:shadow-blue-600/5 transition-all duration-300"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-slate-50 group-hover:bg-blue-600 group-hover:text-white rounded-[1.5rem] flex items-center justify-center text-slate-400 transition-all duration-300">
                      {module.type === "VIDEO" ? <PlayCircle size={28} /> : <FileText size={28} />}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">Modul {index + 1}</p>
                      <h4 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{module.title}</h4>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-full text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:translate-x-2 transition-all">
                    <ChevronRight size={20} />
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-10 border-2 border-dashed border-slate-100 rounded-[3rem] text-center text-slate-400">
                Belum ada materi yang diunggah untuk kursus ini.
              </div>
            )}
          </div>
        </div>

        {/* 🏆 DAFTAR EVALUASI (KANAN) */}
        <div className="space-y-8">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Evaluasi</h2>
          <div className="space-y-6">
            {course.quizzes?.length > 0 ? (
              course.quizzes.map((quiz: any) => (
                <div key={quiz.id} className="p-8 bg-slate-900 rounded-[3rem] text-white relative overflow-hidden group hover:-translate-y-2 transition-all duration-500 shadow-xl shadow-slate-200">
                  <div className="relative z-10 space-y-6">
                    <div>
                      <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.3em]">Quiz Aktif</span>
                      <h4 className="text-xl font-bold mt-2 leading-snug">{quiz.title}</h4>
                    </div>
                    <Link 
                      href={`/dashboard/mahasiswa/quiz/${quiz.id}`}
                      className="flex items-center justify-center w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-lg shadow-blue-600/30 active:scale-95"
                    >
                      Mulai Kerjakan
                    </Link>
                  </div>
                  {/* Dekorasi Blur */}
                  <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl group-hover:bg-blue-600/40 transition-all"></div>
                </div>
              ))
            ) : (
              <div className="p-8 bg-slate-50 rounded-[3rem] border border-slate-100 text-center">
                <p className="text-sm font-bold text-slate-400">Tidak ada kuis tersedia.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
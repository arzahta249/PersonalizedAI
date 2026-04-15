"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, GraduationCap, Trophy, Clock, ArrowRight, AlertCircle, Loader2, Inbox } from "lucide-react";
import Link from "next/link";

type LatestModule = {
  id: string;
  courseId: string;
  title: string;
  courseTitle: string;
  initials: string;
};

type MahasiswaStats = {
  totalMateri: number;
  totalQuizSelesai: number;
  avgScore: number;
  activeAssignments: number;
  pendingQuizzes: number;
  latestModules: LatestModule[];
};

export default function MahasiswaDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<MahasiswaStats | null>(null);
  const [nama] = useState(() => {
    if (typeof window === "undefined") return "Mahasiswa";
    return localStorage.getItem("name") || "Mahasiswa";
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("userId");

    if (!token || role !== "MAHASISWA") {
      router.replace("/login");
      return;
    }

    fetch(`/api/mahasiswa/stat?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => setStats(data))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em]">Menyinkronkan Ruang Belajar...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-700 md:space-y-8">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-xl shadow-blue-100 sm:p-8 md:rounded-[2.5rem] md:p-10">
        <div className="relative z-10">
          <span className="rounded-full bg-white/20 px-4 py-1 text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
            Akademik Hub
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Selamat Datang, {nama}!</h1>
          <p className="mt-2 max-w-md text-sm font-medium leading-relaxed text-blue-100 sm:text-base">
            Semua materi, kuis, tugas, dan progres belajarmu sekarang bergerak dinamis dari aktivitas belajar nyata.
          </p>
        </div>
        <div className="absolute top-[-20%] right-[-10%] h-72 w-72 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-5%] h-48 w-48 rounded-full bg-indigo-400/20 blur-2xl"></div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 md:gap-6">
        {[
          { label: "Materi", value: stats?.totalMateri || 0, icon: <BookOpen size={26} />, accent: "bg-blue-50 text-blue-600" },
          { label: "Quiz Selesai", value: stats?.totalQuizSelesai || 0, icon: <Trophy size={26} />, accent: "bg-emerald-50 text-emerald-600" },
          { label: "Tugas Aktif", value: stats?.activeAssignments || 0, icon: <Clock size={26} />, accent: "bg-orange-50 text-orange-600" },
          { label: "Rata-rata Nilai", value: `${stats?.avgScore ? Math.round(stats.avgScore) : 0}%`, icon: <GraduationCap size={26} />, accent: "bg-indigo-50 text-indigo-600" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-4 rounded-[1.75rem] border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:p-8">
            <div className={`rounded-2xl p-4 ${item.accent}`}>{item.icon}</div>
            <div>
              <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
              <h3 className="text-3xl font-black tracking-tight text-slate-800">{item.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <div className="flex flex-col overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm md:rounded-[2.5rem]">
          <div className="flex items-center justify-between border-b border-slate-50 p-6 md:p-8">
            <h2 className="flex items-center gap-3 font-black text-slate-900">
              <Clock size={20} className="text-blue-600" /> Materi Terkini
            </h2>
            <Link href="/dashboard/mahasiswa/courses" className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline">
              Lihat Semua
            </Link>
          </div>

          <div className="flex-1 space-y-4 p-6 md:p-8">
            {stats?.latestModules && stats.latestModules.length > 0 ? (
              stats.latestModules.map((materi: LatestModule) => (
                <Link key={materi.id} href={`/dashboard/mahasiswa/courses/${materi.courseId}`}>
                  <div className="group mb-4 flex cursor-pointer items-center justify-between rounded-[1.25rem] bg-slate-50 p-4 transition-all duration-300 hover:bg-blue-600 last:mb-0 md:rounded-[1.5rem] md:p-5">
                    <div className="flex min-w-0 items-center gap-4 md:gap-5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-xs font-black text-blue-600 shadow-sm transition-colors group-hover:bg-blue-500 group-hover:text-white">
                        {materi.initials}
                      </div>
                      <div className="min-w-0">
                        <h4 className="truncate text-sm font-bold text-slate-800 transition-colors group-hover:text-white">{materi.title}</h4>
                        <p className="truncate text-[10px] font-bold uppercase tracking-tighter text-slate-400 transition-colors group-hover:text-blue-100">
                          {materi.courseTitle}
                        </p>
                      </div>
                    </div>
                    <ArrowRight size={18} className="text-slate-300 transition-all group-hover:translate-x-2 group-hover:text-white" />
                  </div>
                </Link>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-300">
                <Inbox size={48} className="mb-4 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest">Belum ada materi</p>
              </div>
            )}
          </div>
        </div>

        <div className="relative flex flex-col justify-between overflow-hidden rounded-[2rem] bg-slate-900 p-6 text-white shadow-2xl md:rounded-[2.5rem] md:p-10">
          <div className="relative z-10">
            <div className="mb-6 flex items-center gap-3">
              <AlertCircle size={20} className="text-orange-500" />
              <h2 className="text-xl font-black">Agenda Akademik</h2>
            </div>

            <div className="space-y-4">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-200">Quiz Menunggu</p>
                <h3 className="mt-3 text-3xl font-black">{stats?.pendingQuizzes || 0}</h3>
                <p className="mt-2 text-sm text-slate-400">Kuis yang belum dikerjakan akan otomatis muncul di ruang ujianmu.</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-200">Tugas Aktif</p>
                <h3 className="mt-3 text-3xl font-black">{stats?.activeAssignments || 0}</h3>
                <p className="mt-2 text-sm text-slate-400">Pantau tenggat waktu dan buka detail tugas sebelum deadline lewat.</p>
              </div>
            </div>
          </div>

          <Link href="/dashboard/mahasiswa/progress" className="relative z-10 mt-8 inline-flex items-center justify-center rounded-[1.5rem] border border-white/10 bg-white/10 px-5 py-4 text-[11px] font-black uppercase tracking-[0.25em] transition hover:bg-white/20">
            Buka Progress Belajar
          </Link>

          <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-blue-600/20 blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}

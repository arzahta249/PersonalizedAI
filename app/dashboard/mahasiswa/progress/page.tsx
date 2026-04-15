"use client";

import { useEffect, useState } from "react";
import { BarChart3, BookMarked, CheckCircle2, GraduationCap, Loader2, Trophy } from "lucide-react";

type ProgressSummary = {
  activeCourses: number;
  averageProgress: number;
  completedQuizzes: number;
  submittedAssignments: number;
  bestCourse: string;
};

type ProgressCourse = {
  id: string;
  courseTitle: string;
  progress: number;
  status: string;
  totalModules: number;
  totalQuizzes: number;
  completedQuizzes: number;
  submittedAssignments: number;
};

export default function ProgressBelajarPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [courses, setCourses] = useState<ProgressCourse[]>([]);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    fetch(`/api/mahasiswa/progress?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setSummary(data.summary || null);
        setCourses(Array.isArray(data.courses) ? data.courses : []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-sm font-semibold text-slate-500">Menghitung progres belajar...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-8">
      <section className="rounded-[2rem] bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.22),transparent_30%),linear-gradient(135deg,#ffffff,#eff6ff)] p-6 shadow-sm ring-1 ring-slate-100 md:p-8">
        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-600">Progress Belajar</p>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Semua progresmu tersusun rapi dalam satu ruang.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
          Progress akan bertambah otomatis saat kamu membuka materi dan menyelesaikan quiz. Halaman ini merangkum momentum belajarmu secara real-time.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Kursus Aktif", value: summary?.activeCourses || 0, icon: <BookMarked className="h-5 w-5" />, accent: "bg-blue-50 text-blue-600" },
          { label: "Rata-rata Progres", value: `${summary?.averageProgress || 0}%`, icon: <BarChart3 className="h-5 w-5" />, accent: "bg-indigo-50 text-indigo-600" },
          { label: "Quiz Selesai", value: summary?.completedQuizzes || 0, icon: <Trophy className="h-5 w-5" />, accent: "bg-emerald-50 text-emerald-600" },
          { label: "Tugas Terkirim", value: summary?.submittedAssignments || 0, icon: <CheckCircle2 className="h-5 w-5" />, accent: "bg-orange-50 text-orange-600" },
          { label: "Kursus Terbaik", value: summary?.bestCourse || "-", icon: <GraduationCap className="h-5 w-5" />, accent: "bg-slate-100 text-slate-700" },
        ].map((card) => (
          <div key={card.label} className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`inline-flex rounded-2xl p-3 ${card.accent}`}>{card.icon}</div>
            <p className="mt-4 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">{card.label}</p>
            <h3 className="mt-3 text-xl font-black leading-tight text-slate-900">{card.value}</h3>
          </div>
        ))}
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Per Kursus</h2>
            <p className="mt-1 text-sm text-slate-500">Lihat sejauh mana kamu bergerak di setiap mata kuliah.</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {courses.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
              Buka materi pertama untuk mulai membangun progress belajar.
            </div>
          ) : (
            courses.map((course) => (
              <article key={course.id} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 transition hover:bg-white hover:shadow-lg">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600">{course.status}</p>
                    <h3 className="mt-2 text-xl font-black text-slate-900">{course.courseTitle}</h3>
                    <p className="mt-2 text-sm text-slate-500">
                      {course.totalModules} modul, {course.totalQuizzes} quiz, {course.submittedAssignments} tugas terkirim.
                    </p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Progress</p>
                    <h4 className="mt-2 text-3xl font-black text-slate-900">{course.progress}%</h4>
                  </div>
                </div>

                <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600" style={{ width: `${course.progress}%` }}></div>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-slate-500 md:grid-cols-3">
                  <div className="rounded-2xl bg-white px-4 py-3">Quiz selesai: {course.completedQuizzes}/{course.totalQuizzes}</div>
                  <div className="rounded-2xl bg-white px-4 py-3">Tugas terkirim: {course.submittedAssignments}</div>
                  <div className="rounded-2xl bg-white px-4 py-3">Status belajar: {course.status}</div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

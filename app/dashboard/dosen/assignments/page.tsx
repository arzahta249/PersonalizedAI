"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  PlusCircle, 
  FileText, 
  Calendar, 
  Users, 
  ArrowRight,
  MoreVertical,
  Loader2
} from "lucide-react";

export default function DosenAssignmentPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Mengambil daftar tugas milik Dosen dari Database
  useEffect(() => {
    const userId = localStorage.getItem("userId") || ""; 
    
    fetch(`/api/dosen/assignments?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        setAssignments(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Gagal memuat daftar tugas:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em]">Memuat Daftar Penugasan...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8 animate-in fade-in duration-700">
      
      {/* HEADER & TOMBOL TAMBAH TUGAS (KHUSUS DOSEN) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Kelola Penugasan</h1>
          <p className="text-slate-500 mt-2">Buat tugas baru, pantau tenggat waktu, dan berikan nilai ke mahasiswa.</p>
        </div>
        
        {/* INI DIA TOMBOL CREATE-NYA! */}
        <Link 
          href="/dashboard/dosen/assignments/create"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/30 shrink-0"
        >
          <PlusCircle size={18} /> Buat Tugas Baru
        </Link>
      </div>

      {/* DAFTAR TUGAS */}
      {assignments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((assignment) => {
            const isPastDue = new Date(assignment.dueDate) < new Date();
            const progress = ((assignment.submissionsCount || 0) / (assignment.totalStudents || 40)) * 100;

            return (
              <div key={assignment.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                    <FileText size={24} />
                  </div>
                  <button className="text-slate-400 hover:text-slate-600 p-2">
                    <MoreVertical size={20} />
                  </button>
                </div>

                <div className="flex-1 space-y-2 mb-6">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-md inline-block">
                    {assignment.courseTitle || "Mata Kuliah"}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug line-clamp-2">{assignment.title}</h3>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-50">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-500 font-medium">
                      <Calendar size={16} className={isPastDue ? "text-red-500" : "text-orange-500"} />
                      <span className={isPastDue ? "text-red-500 font-bold" : ""}>
                        {new Date(assignment.dueDate).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 font-medium">
                      <Users size={16} className="text-emerald-500" />
                      <span>{assignment.submissionsCount || 0}/{assignment.totalStudents || 40} Mhs</span>
                    </div>
                  </div>

                  {/* Progress Bar Pengumpulan */}
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>

                  {/* Tombol Nilai */}
                  <Link 
                    href={`/dashboard/dosen/assignments/${assignment.id}`}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest transition-colors mt-4 group"
                  >
                    Buka & Nilai <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* JIKA DOSEN BELUM MEMBUAT TUGAS SAMA SEKALI */
        <div className="bg-white rounded-[2rem] border border-slate-100 p-16 text-center shadow-sm">
          <FileText size={48} className="mx-auto text-slate-200 mb-4" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">Belum Ada Tugas</h3>
          <p className="text-slate-500 mb-6">Anda belum membuat penugasan apapun untuk mahasiswa di kelas Anda.</p>
          <Link 
            href="/dashboard/dosen/assignments/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl font-bold transition-colors"
          >
            <PlusCircle size={18} /> Buat Tugas Pertama
          </Link>
        </div>
      )}

    </div>
  );
}
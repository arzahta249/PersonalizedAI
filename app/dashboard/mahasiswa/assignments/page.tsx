"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Loader2,
  ListTodo
} from "lucide-react";

export default function MahasiswaAssignmentPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "ACTIVE" | "SUBMITTED" | "MISSED">("ACTIVE");

  useEffect(() => {
    // Ambil userId dari localStorage saat komponen dimuat
    const userId = localStorage.getItem("userId") || "";

    fetch(`/api/mahasiswa/assignments?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        setAssignments(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Gagal memuat tugas mahasiswa:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em]">Mengecek Tugasmu...</p>
      </div>
    );
  }

  // Filter tugas berdasarkan tab yang dipilih
  const filteredAssignments = assignments.filter(a => {
    if (activeTab === "ALL") return true;
    return a.status === activeTab;
  });

  // Statistik Ringkas
  const countActive = assignments.filter(a => a.status === "ACTIVE").length;
  const countSubmitted = assignments.filter(a => a.status === "SUBMITTED").length;

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tugas Kuliah</h1>
          <p className="text-slate-500 mt-2 font-medium">Jangan sampai terlewat! Segera kerjakan tugas yang masih aktif.</p>
        </div>
      </div>

      {/* TABS & STATISTIK */}
      <div className="flex flex-col md:flex-row justify-between gap-6">
        
        {/* Navigasi Tab */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab("ACTIVE")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "ACTIVE" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
          >
            <ListTodo size={16} /> Harus Dikerjakan ({countActive})
          </button>
          <button 
            onClick={() => setActiveTab("SUBMITTED")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "SUBMITTED" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
          >
            <CheckCircle2 size={16} /> Selesai ({countSubmitted})
          </button>
          <button 
            onClick={() => setActiveTab("ALL")}
            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "ALL" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
          >
            Semua
          </button>
        </div>

      </div>

      {/* LIST TUGAS */}
      <div className="space-y-4">
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map((assignment) => (
            <div 
              key={assignment.id} 
              className={`p-6 md:p-8 rounded-[2rem] border transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:shadow-lg hover:-translate-y-1 ${
                assignment.status === "SUBMITTED" 
                  ? "bg-white border-emerald-100" 
                  : assignment.status === "MISSED"
                    ? "bg-red-50/50 border-red-100"
                    : "bg-white border-slate-100 shadow-sm"
              }`}
            >
              
              <div className="flex items-start gap-5">
                {/* ICON STATUS */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  assignment.status === "SUBMITTED" 
                    ? "bg-emerald-100 text-emerald-600" 
                    : assignment.status === "MISSED"
                      ? "bg-red-100 text-red-600"
                      : "bg-blue-50 text-blue-600"
                }`}>
                  {assignment.status === "SUBMITTED" ? <CheckCircle2 size={28} /> : assignment.status === "MISSED" ? <AlertCircle size={28} /> : <BookOpen size={28} />}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md">
                      {assignment.courseTitle}
                    </span>
                    {assignment.status === "MISSED" && (
                      <span className="text-[10px] font-black text-white bg-red-500 uppercase tracking-widest px-2 py-0.5 rounded-md">
                        Terlewat
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 leading-snug">{assignment.title}</h3>
                  
                  <div className="flex items-center gap-2 mt-3 text-sm font-medium">
                    <Clock size={16} className={assignment.status === "MISSED" ? "text-red-500" : assignment.status === "ACTIVE" ? "text-orange-500" : "text-slate-400"} />
                    <span className={assignment.status === "MISSED" ? "text-red-600 font-bold" : assignment.status === "ACTIVE" ? "text-orange-600 font-bold" : "text-slate-500"}>
                      Deadline: {new Date(assignment.dueDate).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTION AREA */}
              <div className="flex items-center gap-6 md:w-auto w-full pt-4 md:pt-0 border-t md:border-0 border-slate-100">
                
                {/* Info Nilai jika sudah dinilai */}
                {assignment.status === "SUBMITTED" && (
                  <div className="text-center md:text-right hidden sm:block px-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nilai</p>
                    {assignment.score !== null ? (
                      <p className="text-2xl font-black text-emerald-600">{assignment.score}</p>
                    ) : (
                      <p className="text-sm font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded mt-1">Diproses</p>
                    )}
                  </div>
                )}

                <Link 
                  href={`/dashboard/mahasiswa/assignments/${assignment.id}`}
                  className={`flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all w-full md:w-auto ${
                    assignment.status === "ACTIVE"
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                  }`}
                >
                  {assignment.status === "ACTIVE" ? "Kerjakan" : "Lihat Detail"} <ArrowRight size={18} />
                </Link>
              </div>

            </div>
          ))
        ) : (
          <div className="p-16 text-center bg-white rounded-[2rem] border border-slate-100">
            <CheckCircle2 size={48} className="mx-auto text-emerald-200 mb-4" />
            <h3 className="font-bold text-slate-600 text-lg">Hore! Tidak ada tugas</h3>
            <p className="text-sm text-slate-400 mt-1">Kamu sudah menyelesaikan semua tugas. Waktunya bersantai!</p>
          </div>
        )}
      </div>

    </div>
  );
}
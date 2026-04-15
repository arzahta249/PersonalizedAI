"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Search, 
  FileText, 
  Clock, 
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Loader2
} from "lucide-react";

export default function AdminAssignmentPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIVE" | "PASSED">("ALL");

  // Fetch Data Tugas Semua Dosen
  useEffect(() => {
    fetch("/api/admin/assignments")
      .then((res) => res.json())
      .then((data) => {
        setAssignments(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gagal memuat tugas:", err);
        setLoading(false);
      });
  }, []);

  // Logika Pencarian & Filter
  const filteredAssignments = assignments.filter((item) => {
    const matchSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        item.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.dosenName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === "ACTIVE") return matchSearch && item.status === "ACTIVE";
    if (filterStatus === "PASSED") return matchSearch && item.status === "PASSED";
    return matchSearch;
  });

  // Tampilan Loading
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em]">Memuat Monitoring Tugas...</p>
      </div>
    );
  }

  // Kalkulasi Statistik Global
  const totalTugas = assignments.length;
  const tugasBerjalan = assignments.filter(a => a.status === "ACTIVE").length;
  const rataRataPengumpulan = totalTugas > 0 
    ? Math.round(assignments.reduce((acc, curr) => acc + (curr.submissionsCount / curr.totalStudents), 0) / totalTugas * 100)
    : 0;

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8 animate-in fade-in duration-700">
      
      {/* HEADER & PENCARIAN (KHUSUS ADMIN - TANPA TOMBOL BUAT TUGAS) */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Monitoring Penugasan</h1>
          <p className="text-slate-500 mt-2">Pantau seluruh aktivitas pemberian tugas dari semua program studi dan dosen.</p>
        </div>

        <div className="relative w-full lg:w-80 shrink-0">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari tugas, matkul, atau dosen..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* STATISTIK GLOBAL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Tugas Diberikan</p>
            <h3 className="text-2xl font-black text-slate-800">{totalTugas}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="bg-orange-50 text-orange-600 p-4 rounded-2xl">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tugas Masih Berjalan</p>
            <h3 className="text-2xl font-black text-slate-800">{tugasBerjalan}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl">
            <BarChart3 size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rata-rata Pengumpulan</p>
            <h3 className="text-2xl font-black text-slate-800">{rataRataPengumpulan}%</h3>
          </div>
        </div>
      </div>

      {/* TABS FILTER */}
      <div className="flex flex-wrap items-center gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        <button 
          onClick={() => setFilterStatus("ALL")}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterStatus === "ALL" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
        >
          Semua Data
        </button>
        <button 
          onClick={() => setFilterStatus("ACTIVE")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterStatus === "ACTIVE" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
        >
          <Clock size={16} /> Sedang Berjalan
        </button>
        <button 
          onClick={() => setFilterStatus("PASSED")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterStatus === "PASSED" ? "bg-white text-slate-500 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
        >
          <CheckCircle2 size={16} /> Lewat Deadline
        </button>
      </div>

      {/* LIST ASSIGNMENTS UNTUK ADMIN */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        {filteredAssignments.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {filteredAssignments.map((assignment) => (
              <div key={assignment.id} className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50 transition-colors group">
                
                <div className="flex items-start gap-5">
                  <div className={`p-4 rounded-2xl shrink-0 transition-colors ${
                    assignment.status === "ACTIVE" ? "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                  }`}>
                    <FileText size={24} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                        {assignment.courseTitle}
                      </span>
                      <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                        Dosen: {assignment.dosenName}
                      </span>
                      {assignment.status === "PASSED" && (
                        <span className="text-[9px] font-black text-red-600 uppercase tracking-widest bg-red-50 border border-red-100 px-2 py-0.5 rounded-md">
                          Deadline Berakhir
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">{assignment.title}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-8 shrink-0">
                  {/* Info Progress Pengumpulan */}
                  <div className="hidden md:block w-32">
                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                      <span>Progress</span>
                      <span>{Math.round((assignment.submissionsCount / assignment.totalStudents) * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${assignment.submissionsCount === assignment.totalStudents ? "bg-emerald-500" : "bg-blue-500"}`}
                        style={{ width: `${(assignment.submissionsCount / assignment.totalStudents) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium mt-1 text-right">
                      {assignment.submissionsCount} dari {assignment.totalStudents} Mhs
                    </p>
                  </div>

                  {/* Tombol Detail Monitoring Admin */}
                  <Link 
                    href={`/dashboard/admin/assignments/${assignment.id}`}
                    className="flex items-center justify-center p-4 bg-white border-2 border-slate-100 text-slate-400 hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-all"
                    title="Buka Detail Tugas"
                  >
                    <ArrowRight size={20} />
                  </Link>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 flex flex-col items-center justify-center text-center text-slate-400">
            <FileText size={48} className="mb-4 opacity-20" />
            <p className="font-bold text-slate-600">Sistem Kosong</p>
            <p className="text-sm mt-1">Belum ada satupun dosen yang membuat penugasan.</p>
          </div>
        )}
      </div>

    </div>
  );
}
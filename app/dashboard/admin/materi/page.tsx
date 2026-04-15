"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  Video, 
  FileText, 
  Eye, 
  Loader2, 
  Search,
  CheckCircle2,
  Clock
} from "lucide-react";

export default function AdminMateriPage() {
  const [materi, setMateri] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");

  useEffect(() => {
    fetch("/api/admin/materi")
      .then((res) => res.json())
      .then((data) => {
        setMateri(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gagal memuat materi:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em]">Memuat Database Materi...</p>
      </div>
    );
  }

  // Logika Pencarian dan Filter
  const filteredMateri = materi.filter((item) => {
    const matchSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        item.courseTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === "PUBLISHED") return matchSearch && item.isPublished;
    if (filterType === "DRAFT") return matchSearch && !item.isPublished;
    return matchSearch;
  });

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8 animate-in fade-in duration-700">
      
      {/* HEADER & PENCARIAN */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Database Materi</h1>
          <p className="text-slate-500 mt-2">Pantau seluruh materi yang diunggah oleh Dosen ke dalam sistem.</p>
        </div>

        <div className="relative w-full lg:w-72 shrink-0">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari judul atau mata kuliah..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all"
          />
        </div>
      </div>

      {/* TABS FILTER */}
      <div className="flex flex-wrap items-center gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        <button 
          onClick={() => setFilterType("ALL")}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterType === "ALL" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
        >
          Semua ({materi.length})
        </button>
        <button 
          onClick={() => setFilterType("PUBLISHED")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterType === "PUBLISHED" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
        >
          <CheckCircle2 size={16} /> Dipublikasi
        </button>
        <button 
          onClick={() => setFilterType("DRAFT")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterType === "DRAFT" ? "bg-white text-orange-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
        >
          <Clock size={16} /> Draft Dosen
        </button>
      </div>

      {/* LIST MATERI */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        {filteredMateri.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {filteredMateri.map((item) => (
              <div key={item.id} className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50 transition-colors group">
                
                <div className="flex items-start gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                    item.type === "VIDEO" 
                      ? "bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white" 
                      : "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
                  }`}>
                    {item.type === "VIDEO" ? <Video size={24} /> : <FileText size={24} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                        {item.courseTitle}
                      </span>
                      {item.isPublished ? (
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md">Published</span>
                      ) : (
                        <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded-md">Draft</span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mt-2">{item.title}</h3>
                  </div>
                </div>

                {/* TOMBOL PREVIEW */}
                <div className="shrink-0">
                  <Link 
                    // Admin bisa ngintip materi menggunakan halaman learn milik mahasiswa
                    href={`/dashboard/mahasiswa/learn/${item.id}`}
                    target="_blank" // Buka di tab baru agar halaman admin tidak tertutup
                    className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-100 hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl text-xs font-black text-slate-400 uppercase tracking-widest transition-all"
                  >
                    <Eye size={16} /> Preview
                  </Link>
                </div>
                
              </div>
            ))}
          </div>
        ) : (
          <div className="p-20 flex flex-col items-center justify-center text-center text-slate-400">
            <BookOpen size={48} className="mb-4 opacity-20" />
            <p className="font-bold text-slate-600">Tidak ada materi ditemukan</p>
            <p className="text-sm mt-1">Coba sesuaikan kata kunci pencarian atau filter tab.</p>
          </div>
        )}
      </div>

    </div>
  );
}
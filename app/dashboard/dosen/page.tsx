"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiBook, FiLayers, FiAlertCircle, FiUsers, FiArrowUpRight, FiClock, FiInbox, FiActivity } from "react-icons/fi";

export default function DosenDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "DOSEN") {
      router.replace("/login");
      return;
    }

    fetch("/api/dosen/stat")
      .then((res) => res.json())
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-black text-slate-400 uppercase tracking-[0.3em] text-[10px]">Sinkronisasi Data...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-10 animate-in fade-in duration-700">
      
      {/* ✋ HEADER SECTION */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Dashboard <span className="text-blue-600">Dosen</span> 🎓
          </h1>
          <p className="text-slate-500 mt-2 font-medium text-sm">
            Selamat datang kembali. Pantau seluruh aktivitas akademik Anda dalam satu panel.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-3 px-5 py-3 bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sistem Aktif</span>
        </div>
      </header>

      {/* 📊 STATS GRID (Bento Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Kursus", value: data?.totalCourses || 0, icon: <FiBook />, color: "bg-blue-600" },
          { label: "Total Kuis", value: data?.totalQuiz || 0, icon: <FiLayers />, color: "bg-indigo-600" },
          { label: "Butuh Persetujuan", value: data?.pendingQuiz || 0, icon: <FiAlertCircle />, color: "bg-orange-500" },
          { label: "Mahasiswa Belajar", value: data?.totalStudents || 0, icon: <FiUsers />, color: "bg-emerald-600" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[35px] border border-white shadow-[0_20px_50px_-15px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] transition-all duration-500 group relative overflow-hidden">
            <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center text-white text-xl shadow-lg mb-6 group-hover:rotate-12 transition-transform`}>
              {stat.icon}
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-4xl font-black text-slate-900 tracking-tight leading-none">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* 🏗️ MAIN CONTENT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 📚 KIRI: LIST MATERI TERKINI */}
        <div className="lg:col-span-2 bg-white rounded-[45px] p-8 md:p-10 border border-white shadow-xl min-h-[450px] flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-slate-900">Materi Terkini</h3>
            <span className="text-[10px] bg-slate-100 px-3 py-1 rounded-full font-bold text-slate-500 uppercase tracking-tight">Update Otomatis</span>
          </div>

          {data?.latestMateri && data.latestMateri.length > 0 ? (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-separate border-spacing-y-4">
                <tbody>
                  {data.latestMateri.map((materi: any, idx: number) => (
                    <tr key={idx} className="group">
                      <td className="px-6 py-5 bg-slate-50 rounded-l-[25px] border-y border-l border-slate-100 group-hover:bg-blue-50 transition-colors">
                        <p className="text-sm font-bold text-slate-800">{materi.title}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">{materi.date || "Baru saja"}</p>
                      </td>
                      <td className="px-6 py-5 bg-slate-50 border-y border-slate-100 text-right rounded-r-[25px] group-hover:bg-blue-50 transition-colors">
                        <button className="p-2.5 bg-white rounded-xl shadow-sm hover:text-blue-600 transition-all hover:scale-110 active:scale-95">
                          <FiArrowUpRight />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* EMPTY STATE MATERI */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6 animate-pulse">
                <FiInbox size={48} />
              </div>
              <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em]">Belum Ada Data</p>
              <p className="text-slate-300 text-xs mt-2 max-w-[200px]">Silakan unggah materi pertama Anda di menu Kelola Materi.</p>
            </div>
          )}
        </div>

        {/* 🔔 KANAN: AKTIVITAS SISTEM */}
        <div className="bg-slate-900 rounded-[45px] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl flex flex-col min-h-[450px]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/20 blur-[80px] rounded-full -mr-20 -mt-20"></div>
          
          <h3 className="text-xl font-bold mb-10 flex items-center gap-3 relative z-10">
            <FiClock className="text-blue-400" /> Aktivitas
          </h3>

          <div className="space-y-6 relative z-10 flex-1">
            {data?.activities && data.activities.length > 0 ? (
              data.activities.map((act: any, i: number) => (
                <div key={i} className="group p-5 bg-white/5 border border-white/10 rounded-[30px] backdrop-blur-md hover:bg-white/10 transition-all cursor-default">
                  <h4 className="font-bold text-xs mb-1 group-hover:text-blue-400 transition-colors">{act.title}</h4>
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{act.time}</p>
                </div>
              ))
            ) : (
              /* EMPTY STATE AKTIVITAS */
              <div className="h-full flex flex-col items-center justify-center text-center py-10">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                  <FiActivity className="text-2xl text-blue-500/40" />
                </div>
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">Hening...</p>
                <p className="text-[10px] text-slate-600 mt-2">Tidak ada aktivitas baru hari ini.</p>
              </div>
            )}
          </div>

          <button className="w-full mt-10 py-5 bg-white/5 border border-white/10 text-white rounded-[25px] font-black text-[9px] uppercase tracking-[0.3em] hover:bg-white/10 transition-all relative z-10">
            Buka Log Riwayat
          </button>
        </div>

      </div>

      {/* 🏁 FOOTER SECTION */}
      <footer className="pt-10 flex flex-col md:flex-row items-center justify-between border-t border-slate-100 gap-4">
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">
          Personalized AI © 2026 — Karya Mochamad Alifi Arzahta, Universitas Pancasakti Tegal
        </p>
        <div className="flex gap-6 opacity-30">
           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">v2.4.0-Stable</span>
        </div>
      </footer>
    </div>
  );
}

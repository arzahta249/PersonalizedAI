"use client";

import { useState, useEffect } from "react";
import { 
  User, Mail, Shield, GraduationCap, 
  BookOpen, CheckCircle2, LineChart,
  Loader2, Building2, Hash, AlertCircle
} from "lucide-react";

export default function ProfilMahasiswaDinamis() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let isCancelled = false;

    const loadProfile = async () => {
      try {
        const userId = localStorage.getItem("userId");

        if (!userId) {
          if (!isCancelled) {
            setErrorMsg("ID Pengguna tidak ditemukan. Silakan Logout dan Login kembali.");
            setLoading(false);
          }
          return;
        }

        const res = await fetch(`/api/profile/mahasiswa?userId=${userId}`);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Gagal mengambil data server");
        }

        const data = await res.json();
        if (!isCancelled) {
          setProfile(data);
          setLoading(false);
        }
      } catch (err) {
        console.error("Gagal memuat profil:", err);
        if (!isCancelled) {
          setErrorMsg("Terjadi kesalahan saat memuat data dari server.");
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isCancelled = true;
    };
  }, []);

  // TAMPILAN JIKA LOADING
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] space-y-4">
        <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sinkronisasi Data Akademik...</p>
      </div>
    );
  }

  // TAMPILAN JIKA ADA ERROR (MISAL: BELUM LOGIN FULL)
  if (errorMsg || !profile) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] space-y-4 text-center">
        <AlertCircle className="text-red-500 w-16 h-16 mb-2" />
        <h2 className="text-xl font-bold text-slate-800">Ups, Gagal Memuat Profil</h2>
        <p className="text-sm text-slate-500 max-w-md">{errorMsg || "Profil tidak ditemukan."}</p>
        <button 
          onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700"
        >
          Login Ulang
        </button>
      </div>
    );
  }

  // TAMPILAN PROFIL SUKSES
  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER BANNER */}
      <div className="relative w-full h-48 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2rem] shadow-lg mb-16 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        
        {/* FOTO PROFIL */}
        <div className="absolute -bottom-12 left-8 md:left-12 w-28 h-28 bg-white p-2 rounded-[2rem] shadow-xl">
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 rounded-2xl flex items-center justify-center border-2 border-slate-100">
            <GraduationCap size={40} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* DATA IDENTITAS */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 mb-6">Informasi Mahasiswa</h2>
            
            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-1.5"><User size={14} /> Nama Lengkap</p>
                <p className="font-bold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100">{profile.name}</p>
              </div>
              
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-1.5"><Hash size={14} /> NPM / NIM</p>
                <p className="font-bold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100">{profile.npm}</p>
              </div>

              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-1.5"><Building2 size={14} /> Program Studi</p>
                <p className="font-bold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm">{profile.programStudi}</p>
              </div>

              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-1.5"><Mail size={14} /> Email Mahasiswa</p>
                <p className="font-bold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100 truncate text-sm">{profile.email}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest"><Shield size={14} className="inline mr-1" /> Status Akun</span>
                <span className="bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md">{profile.role}</span>
              </div>
            </div>
          </div>
        </div>

        {/* STATS & PROGRESS AREA */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <BookOpen className="text-blue-600 mb-4" size={24} />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kursus</p>
              <h3 className="text-2xl font-black text-slate-800">{profile.stats?.totalKursus || 0}</h3>
            </div>
            
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <CheckCircle2 className="text-emerald-600 mb-4" size={24} />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tugas Selesai</p>
              <h3 className="text-2xl font-black text-slate-800">{profile.stats?.materiSelesai || 0}</h3>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <LineChart className="text-orange-600 mb-4" size={24} />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rata-rata Progres</p>
              <h3 className="text-2xl font-black text-slate-800">{profile.stats?.rataProgress || 0}%</h3>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
              <BookOpen size={20} className="text-blue-600" /> Progres Pembelajaran Terakhir
            </h2>
            
            <div className="space-y-6">
              {profile.recentProgress && profile.recentProgress.length > 0 ? profile.recentProgress.map((item: any, idx: number) => (
                <div key={idx} className="group">
                  <div className="flex justify-between items-end mb-2">
                    <h3 className="font-bold text-slate-800">{item.course}</h3>
                    <span className="font-black text-blue-600">{item.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-700"
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-slate-400 text-center py-4 italic">Belum ada aktivitas kursus terdeteksi.</p>
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

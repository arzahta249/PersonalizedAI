"use client";

import { useState, useEffect } from "react";
import { 
  User, Mail, Shield, Briefcase, 
  BookOpen, Users, FileText,
  Loader2, Building2, Hash, AlertCircle,
  GraduationCap, Clock
} from "lucide-react";

export default function ProfilDosenDinamis() {
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
            setErrorMsg("Identitas pengguna tidak ditemukan. Silakan masuk kembali ke akun Anda.");
            setLoading(false);
          }
          return;
        }

        const res = await fetch(`/api/dosen/profile?userId=${userId}`);
        if (!res.ok) throw new Error("Gagal mengambil data dari server");

        const data = await res.json();
        if (!isCancelled) {
          setProfile(data);
          setLoading(false);
        }
      } catch (err) {
        console.error("Gagal memuat profil:", err);
        if (!isCancelled) {
          setErrorMsg("Terjadi gangguan koneksi atau data profil tidak ditemukan.");
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isCancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] space-y-6">
        <div className="relative w-20 h-20 md:w-24 md:h-24 perspective-1000">
          <div className="absolute inset-0 bg-blue-500 rounded-3xl blur-2xl opacity-40 animate-pulse"></div>
          <div className="relative bg-white w-full h-full rounded-3xl shadow-2xl flex items-center justify-center border border-white/50 animate-bounce">
            <Loader2 className="animate-spin text-blue-600 w-8 h-8 md:w-10 md:h-10" />
          </div>
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse text-center">
          Menyusun Ruang 3D...
        </p>
      </div>
    );
  }

  if (errorMsg || !profile) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] px-4 sm:px-6">
        <div className="bg-white/60 backdrop-blur-2xl p-6 sm:p-10 rounded-3xl md:rounded-[3rem] border border-white shadow-[0_40px_100px_-20px_rgba(220,38,38,0.15)] w-full max-w-md text-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner border border-red-100 transform rotate-3">
            <AlertCircle size={36} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">Profil Gagal Dimuat</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mb-8 leading-relaxed">{errorMsg}</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl"
          >
            Masuk Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-10 space-y-6 md:space-y-8 relative font-sans selection:bg-blue-200">
      
      {/* 🌌 AMBIENT BACKGROUND GLOW */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-slate-50/50">
        <div className="absolute top-[-10%] right-[-5%] w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-blue-400/10 blur-[80px] sm:blur-[120px] rounded-full mix-blend-multiply"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-indigo-400/10 blur-[100px] sm:blur-[140px] rounded-full mix-blend-multiply"></div>
      </div>

      {/* HEADER BANNER - DIKURANGI MARGIN BAWAHNYA AGAR KOTAK NAIK */}
      <div className="relative w-full h-36 sm:h-48 md:h-56 rounded-3xl md:rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(30,58,138,0.2)] mb-14 sm:mb-16 md:mb-20 perspective-1000">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl md:rounded-[3rem] overflow-hidden border border-slate-700/50">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05]"></div>
          <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-blue-500/20 blur-[80px] md:blur-[100px] rounded-full"></div>
        </div>
        
        {/* FOTO PROFIL (Lebih kecil di HP) */}
        <div className="absolute -bottom-10 sm:-bottom-12 md:-bottom-16 left-4 sm:left-8 md:left-16 z-20 group cursor-default">
          <div className="relative transform transition-transform duration-500 group-hover:-translate-y-2 md:group-hover:-translate-y-4 group-hover:scale-105">
            <div className="absolute inset-0 bg-indigo-900/40 blur-xl opacity-60 rounded-[2rem] md:rounded-[2.5rem] translate-y-4 md:translate-y-6 scale-90 transition-all duration-500 group-hover:translate-y-8 group-hover:opacity-40"></div>
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-white/90 backdrop-blur-2xl p-2 md:p-3 rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] shadow-2xl border border-white/80">
              <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 text-blue-600 rounded-xl sm:rounded-[1.5rem] md:rounded-[1.8rem] flex items-center justify-center border border-slate-200/50 shadow-inner">
                <GraduationCap className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 drop-shadow-md opacity-80" />
              </div>
            </div>
          </div>
        </div>

        {/* Nama & Gelar di Banner (Hanya muncul di layar lumayan besar agar tidak menabrak foto) */}
        <div className="absolute bottom-6 md:bottom-8 left-36 sm:left-48 md:left-64 text-white hidden sm:block pr-4">
          <h1 className="text-xl sm:text-2xl md:text-4xl font-black tracking-tight drop-shadow-xl truncate">{profile.name || "Mochamad Alifi Arzahta"}</h1>
          <p className="text-blue-300 font-bold text-[10px] md:text-xs mt-1 md:mt-2 uppercase tracking-[0.2em] flex items-center gap-2 drop-shadow-md">
            <Shield size={14} /> Terverifikasi
          </p>
        </div>
      </div>

      {/* GRID UTAMA - RESPONSIVE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 relative z-10">
        
        {/* KOLOM KIRI: IDENTITAS (Di HP akan di atas, di PC di kiri) */}
        <div className="lg:col-span-4 h-full">
          <div className="bg-white/70 backdrop-blur-3xl p-6 sm:p-8 rounded-3xl md:rounded-[3rem] border border-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] h-full flex flex-col hover:shadow-[0_30px_80px_-15px_rgba(37,99,235,0.1)] transition-shadow duration-500">
            <h2 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 md:mb-8 flex items-center gap-3">
              <div className="w-7 h-7 md:w-8 md:h-8 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center"><User size={14} /></div>
              Data Personal
            </h2>
            
            <div className="space-y-4 md:space-y-6 flex-1">
              {[
                { label: "Nama Lengkap", value: profile.name || "-", icon: <User size={16} /> },
                { label: "NIDN / NIP", value: profile.nip || "-", icon: <Hash size={16} /> },
                { label: "Email Resmi", value: profile.email || "-", icon: <Mail size={16} /> }
              ].map((item, idx) => (
                <div key={idx} className="group cursor-default">
                  <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 md:mb-2 flex items-center gap-2">
                    {item.label}
                  </p>
                  <div className="font-bold text-slate-800 bg-white/50 p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-100 group-hover:bg-white group-hover:border-blue-200 group-hover:shadow-md group-hover:-translate-y-0.5 transition-all duration-300 text-xs md:text-sm truncate flex items-center gap-3">
                    <span className="text-slate-300 group-hover:text-blue-500 transition-colors shrink-0">{item.icon}</span>
                    <span className="truncate">{item.value}</span>
                  </div>
                </div>
              ))}

              <div className="group cursor-default pt-2">
                <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 md:mb-2 flex items-center gap-2">Institusi</p>
                <div className="bg-white/50 p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-100 group-hover:bg-white group-hover:border-blue-200 group-hover:shadow-md group-hover:-translate-y-0.5 transition-all duration-300 flex items-start gap-3">
                  <span className="text-slate-300 group-hover:text-blue-500 transition-colors mt-0.5 shrink-0"><Building2 size={16} /></span>
                  <div className="overflow-hidden">
                    <p className="font-bold text-slate-800 text-xs md:text-sm leading-tight truncate">{profile.universitas || "-"}</p>
                    <p className="text-[9px] md:text-[10px] font-black text-blue-600 mt-1 uppercase tracking-widest truncate">{profile.fakultas || "-"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 md:mt-8 pt-5 md:pt-6 border-t border-slate-100 flex items-center justify-between text-[10px] md:text-xs font-black uppercase tracking-widest">
              <span className="text-slate-400">Hak Akses</span>
              <div className="relative">
                <span className="bg-slate-900 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl shadow-lg shadow-slate-900/20 border border-slate-700 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]"></span>
                  {profile.role || "DOSEN"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: STATISTIK & AKTIVITAS */}
        <div className="lg:col-span-8 flex flex-col gap-6 md:gap-8">
          
          {/* STATISTIK - RESPONSIVE GRID (1 Kolom HP, 3 Kolom PC) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            
            {/* Card 1 */}
            <div className="group perspective-1000">
              <div className="relative h-auto sm:h-48 bg-white/70 backdrop-blur-xl p-5 md:p-6 rounded-3xl md:rounded-[3rem] border border-white shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] flex sm:flex-col items-center sm:items-start justify-between sm:justify-between overflow-hidden transform transition-all duration-500 hover:-translate-y-1 sm:hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.15)]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100 rounded-full blur-3xl -translate-y-10 translate-x-10 group-hover:bg-blue-100 transition-colors duration-500 hidden sm:block"></div>
                
                <div className="flex items-center gap-4 sm:block">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 text-slate-600 rounded-xl md:rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm relative z-10 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500 sm:mb-0">
                    <BookOpen size={20} className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div className="sm:hidden">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mata Kuliah</p>
                  </div>
                </div>
                
                <div className="relative z-10 text-right sm:text-left">
                  <h3 className="text-3xl md:text-4xl font-black text-slate-900 mb-0.5 md:mb-1">{profile.stats?.totalMataKuliah || 0}</h3>
                  <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:block">Mata Kuliah</p>
                </div>
              </div>
            </div>
            
            {/* Card 2 */}
            <div className="group perspective-1000">
              <div className="relative h-auto sm:h-48 bg-white/70 backdrop-blur-xl p-5 md:p-6 rounded-3xl md:rounded-[3rem] border border-white shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] flex sm:flex-col items-center sm:items-start justify-between sm:justify-between overflow-hidden transform transition-all duration-500 hover:-translate-y-1 sm:hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.15)]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100 rounded-full blur-3xl -translate-y-10 translate-x-10 group-hover:bg-indigo-100 transition-colors duration-500 hidden sm:block"></div>
                
                <div className="flex items-center gap-4 sm:block">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 text-slate-600 rounded-xl md:rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm relative z-10 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500 sm:mb-0">
                    <Users size={20} className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div className="sm:hidden">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mhs. Aktif</p>
                  </div>
                </div>

                <div className="relative z-10 text-right sm:text-left">
                  <h3 className="text-3xl md:text-4xl font-black text-slate-900 mb-0.5 md:mb-1">{profile.stats?.totalMahasiswa || 0}</h3>
                  <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:block">Mhs. Aktif</p>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group perspective-1000">
              <div className="relative h-auto sm:h-48 bg-white/70 backdrop-blur-xl p-5 md:p-6 rounded-3xl md:rounded-[3rem] border border-white shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] flex sm:flex-col items-center sm:items-start justify-between sm:justify-between overflow-hidden transform transition-all duration-500 hover:-translate-y-1 sm:hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.15)]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100 rounded-full blur-3xl -translate-y-10 translate-x-10 group-hover:bg-teal-100 transition-colors duration-500 hidden sm:block"></div>
                
                <div className="flex items-center gap-4 sm:block">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 text-slate-600 rounded-xl md:rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm relative z-10 group-hover:bg-teal-500 group-hover:text-white transition-colors duration-500 sm:mb-0">
                    <FileText size={20} className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div className="sm:hidden">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tugas Dibuat</p>
                  </div>
                </div>

                <div className="relative z-10 text-right sm:text-left">
                  <h3 className="text-3xl md:text-4xl font-black text-slate-900 mb-0.5 md:mb-1">{profile.stats?.tugasDiberikan || 0}</h3>
                  <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:block">Tugas Dibuat</p>
                </div>
              </div>
            </div>

          </div>

          {/* KOTAK AKTIVITAS */}
          <div className="flex-1 bg-white/70 backdrop-blur-3xl p-6 sm:p-8 md:p-10 rounded-3xl md:rounded-[3rem] border border-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_80px_-15px_rgba(37,99,235,0.1)] transition-shadow duration-500 flex flex-col">
            <h2 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 md:mb-8 flex items-center gap-3">
              <div className="w-7 h-7 md:w-8 md:h-8 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center"><Clock size={14} /></div>
              Log Penugasan Terbaru
            </h2>
            
            <div className="space-y-3 md:space-y-4 flex-1">
              {profile.recentActivity && profile.recentActivity.length > 0 ? (
                profile.recentActivity.map((item: any, idx: number) => (
                  <div key={idx} className="flex flex-row items-center justify-between p-4 md:p-5 bg-white/60 rounded-2xl md:rounded-[2rem] border border-white shadow-sm hover:shadow-lg hover:bg-white transform hover:-translate-y-1 transition-all duration-300 group cursor-default gap-3 md:gap-4">
                    <div className="flex items-center gap-3 md:gap-5 overflow-hidden">
                      <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 bg-slate-50 text-slate-400 rounded-xl md:rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 group-hover:scale-110">
                        <FileText size={18} />
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="font-bold text-slate-800 text-xs md:text-sm group-hover:text-indigo-700 transition-colors truncate">{item.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                           <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest bg-slate-100/80 px-2 md:px-2.5 py-1 rounded-md md:rounded-lg truncate">Modul: {item.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`shrink-0 px-3 py-1.5 md:px-5 md:py-2.5 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border transition-all shadow-sm ${
                      item.status === "Aktif" 
                        ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200" 
                        : "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-emerald-200"
                    }`}>
                      {item.status}
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-10 md:py-16 text-center border-2 border-dashed border-slate-200/60 rounded-2xl md:rounded-[2rem] bg-slate-50/30 px-4">
                  <Briefcase className="w-8 h-8 md:w-10 md:h-10 text-slate-300 mb-3 md:mb-4" />
                  <p className="text-xs md:text-sm font-bold text-slate-500">Belum ada aktivitas.</p>
                  <p className="text-[10px] md:text-xs text-slate-400 mt-1">Dosen belum membuat penugasan.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

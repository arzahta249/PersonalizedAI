"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  // Ref untuk mata robot
  const leftEyeRef = useRef<HTMLDivElement>(null);
  const rightEyeRef = useRef<HTMLDivElement>(null);

  // Efek animasi mata mengikuti kursor
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const eyes = [leftEyeRef.current, rightEyeRef.current];
      eyes.forEach((eye) => {
        if (!eye) return;

        // Mendapatkan posisi tengah mata
        const rect = eye.getBoundingClientRect();
        const eyeX = rect.left + rect.width / 2;
        const eyeY = rect.top + rect.height / 2;

        // Mendapatkan sudut antara mata dan kursor
        const angle = Math.atan2(e.clientY - eyeY, e.clientX - eyeX);
        
        // Membatasi pergerakan pupil
        const distance = 8; // Jarak maksimum pupil bergerak
        const pupilX = Math.cos(angle) * distance;
        const pupilY = Math.sin(angle) * distance;

        // Menggerakkan pupil
        eye.style.transform = `translate(${pupilX}px, ${pupilY}px)`;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Mesin Login Kebal Peluru
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const text = await res.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        toast.error("API error (bukan JSON)");
        setLoading(false);
        return;
      }

      // 🚨 CCTV BROWSER: Lihat isi data dari backend (Bisa dicek di Inspect Element -> Console)
      console.log("DATA DARI SERVER:", data);

      if (!res.ok) {
        toast.error(data.message);
        setLoading(false);
        return;
      }

      // 🔥 JURUS PAMUNGKAS: Ekstrak ID dan Role dari mana saja posisinya
      const targetId = data.id || (data.user && data.user.id);
      let targetRole = data.role || (data.user && data.user.role);
      
      if (!targetId) {
        toast.error("Sistem gagal menarik ID Pengguna!");
        console.error("ID TIDAK DITEMUKAN. Data:", data);
        setLoading(false);
        return;
      }

      targetRole = targetRole.toUpperCase();

      // 🔥 BERSERSIHKAN CACHE LAMA & SIMPAN DATA BARU (TERMASUK ID!)
      localStorage.clear();
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", targetRole);
      localStorage.setItem("userId", targetId);

      toast.success("Login berhasil 🚀");

      // 🔥 Redirect sesuai role (Pakai window.location.href agar halaman dipaksa refresh)
      setTimeout(() => {
        if (targetRole === "MAHASISWA") {
          window.location.href = "/dashboard/mahasiswa";
        } else if (targetRole === "DOSEN") {
          window.location.href = "/dashboard/dosen";
        } else if (targetRole === "ADMIN") {
          window.location.href = "/dashboard/admin";
        } else {
          window.location.href = "/";
        }
      }, 500);

    } catch (error) {
      toast.error("Server error");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f0f9ff] p-3 font-sans selection:bg-blue-200 sm:p-4 md:p-6">
      
      {/* 🌌 LAYERED AMBIENT BACKGROUND */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-300/30 blur-[120px] rounded-full animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-indigo-300/30 blur-[140px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-1.5rem)] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-white bg-white/95 shadow-[0_40px_120px_-20px_rgba(30,58,138,0.1)] transition-shadow duration-1000 hover:shadow-[0_60px_150px_-30px_rgba(30,58,138,0.15)] sm:min-h-[calc(100vh-2rem)] md:min-h-0 md:flex-row md:rounded-[40px]">
        
        {/* 🤖 SISI KIRI: ANIMASI ROBOT MATA BERGERAK (Maksimal 3D) */}
        <div className="group relative flex w-full flex-col items-center justify-center overflow-hidden border-b border-slate-100/50 bg-white/70 px-6 py-10 sm:px-8 sm:py-12 md:w-1/2 md:border-b-0 md:border-r md:p-16">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')] opacity-[0.03]"></div>
          
          <div className="relative scale-[0.82] transform transition-transform duration-700 hover:-translate-y-1 hover:-rotate-1 sm:scale-90 md:scale-100">
            {/* Kepala Robot */}
            <div className="w-56 h-64 bg-slate-900 rounded-[60px] shadow-[0_25px_60px_-10px_rgba(0,0,0,0.3)] border border-slate-700/50 flex flex-col items-center pt-10 group-hover:shadow-[0_40px_100px_-20px_rgba(30,58,138,0.3)] transition-shadow">
              {/* Mata */}
              <div className="flex gap-10 relative">
                  <div className="absolute -inset-2 bg-blue-500/20 blur-xl rounded-full opacity-50"></div>
                {/* Mata Kiri */}
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-inner relative overflow-hidden ring-4 ring-slate-700/80">
                  <div ref={leftEyeRef} className="w-6 h-6 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.8)] relative transition-transform duration-100 ease-out">
                    <div className="w-2 h-2 bg-white rounded-full absolute top-1 left-1 opacity-80"></div>
                  </div>
                </div>
                {/* Mata Kanan */}
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-inner relative overflow-hidden ring-4 ring-slate-700/80">
                  <div ref={rightEyeRef} className="w-6 h-6 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.8)] relative transition-transform duration-100 ease-out">
                    <div className="w-2 h-2 bg-white rounded-full absolute top-1 left-1 opacity-80"></div>
                  </div>
                </div>
              </div>

              {/* Garis-garis teknis */}
              <div className="w-24 h-1 bg-slate-700 rounded-full mt-12 mb-3"></div>
              <div className="w-32 h-1 bg-slate-700 rounded-full mb-3"></div>
              <div className="flex gap-3">
                <div className="w-3 h-3 bg-blue-200 rounded-full"></div>
                <div className="w-3 h-3 bg-indigo-200 rounded-full"></div>
              </div>
            </div>

            {/* Antena */}
            <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 flex flex-col items-center">
              <div className="w-1 h-12 bg-slate-200 rounded-full"></div>
              <div className="w-4 h-4 bg-blue-600 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.9)] -translate-y-2 animate-pulse"></div>
            </div>
          </div>

          <p className="mt-6 text-center text-[9px] font-black uppercase tracking-[0.35em] text-slate-400 transition-colors group-hover:text-blue-600 sm:mt-8 sm:text-[10px] md:mt-12">Personalized AI Guide</p>
        </div>

        {/* 🔷 SISI KANAN: FORM LOGIN (Minimalist 3D Bento) */}
        <div className="flex w-full items-center justify-center bg-white/70 px-5 py-8 sm:px-8 sm:py-10 md:w-1/2 md:p-16">
          <div className="relative z-10 w-full max-w-sm origin-center">
            <Link
              href="/"
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-slate-500 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-600"
            >
              ← Kembali ke Landing
            </Link>

            <div className="flex items-center gap-2 mb-3 transform hover:scale-105 transition-transform duration-300">
              <div className="w-8 h-8 bg-blue-600 rounded-xl shadow-xl shadow-blue-200 flex items-center justify-center text-white font-black text-xs">A</div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Personalized<span className="text-blue-600">AI</span></h1>
            </div>
            
            <p className="mb-6 max-w-[280px] text-[13px] font-medium leading-relaxed text-slate-500 opacity-80 sm:mb-8 md:mb-10">
              Platform Pelatihan Karyawan Berbasis AI. Silakan login ke akun Anda.
            </p>

            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2 shadow-inner transform group hover:border-blue-100 hover:bg-white hover:shadow-lg transition-all duration-300">
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl bg-transparent p-3.5 text-sm font-semibold text-slate-800 outline-none transition-all focus:ring-2 focus:ring-blue-100 sm:p-4"
                  required
                />
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2 shadow-inner transform group hover:border-blue-100 hover:bg-white hover:shadow-lg transition-all duration-300">
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-transparent p-3.5 text-sm font-semibold text-slate-800 outline-none transition-all focus:ring-2 focus:ring-blue-100 sm:p-4"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-slate-900 p-4 text-[11px] font-bold uppercase tracking-widest text-white shadow-2xl shadow-slate-200 transition-all hover:-translate-y-1 hover:bg-blue-600 active:scale-95 disabled:opacity-50 sm:p-5 sm:text-xs"
              >
                {loading ? "Menghubungkan..." : "Login"}
              </button>
            </form>

            <div className="relative my-7 h-[1px] w-full bg-slate-100 sm:my-8 md:my-10">
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-[10px] font-bold text-slate-300 uppercase tracking-widest z-10">Atau</span>
            </div>

            <p className="relative z-10 mt-5 text-center text-xs font-medium text-gray-400 transition-transform duration-300 hover:scale-105 sm:mt-6">
              Belum punya akun?{" "}
              <Link href="/register" className="text-blue-600 font-bold hover:underline underline-offset-4 decoration-2 decoration-blue-100">
                Daftar Sekarang →
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="pointer-events-none mt-4 text-center text-[8px] font-black uppercase tracking-[0.28em] text-slate-400 opacity-50 sm:text-[9px] sm:tracking-[0.4em] md:mt-6">
        © 2026 Personalized AI — Future of Learning
      </footer>
    </div>
  );
}

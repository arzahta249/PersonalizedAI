"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppDialog } from "@/components/AppDialogProvider";
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  LineChart, 
  Info, 
  LogOut,
  User,
  ClipboardList,
  Menu, // Icon Burger
  X     // Icon Close
} from "lucide-react";

export default function SidebarMahasiswa() {
  const pathname = usePathname();
  const router = useRouter();
  const dialog = useAppDialog();

  // State untuk mengontrol Sidebar di Mobile
  const [isOpen, setIsOpen] = useState(false);

  // Mencegah scroll pada body saat sidebar terbuka di HP
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  // Daftar Menu Utama
  const menu = [
    { name: "Beranda", path: "/dashboard/mahasiswa", icon: <LayoutDashboard size={20} /> },
    { name: "Materi Kuliah", path: "/dashboard/mahasiswa/courses", icon: <BookOpen size={20} /> },
    { name: "Penugasan", path: "/dashboard/mahasiswa/assignments", icon: <ClipboardList size={20} /> },
    { name: "Ujian & Quiz", path: "/dashboard/mahasiswa/quiz", icon: <GraduationCap size={20} /> },
    { name: "Progres Belajar", path: "/dashboard/mahasiswa/progress", icon: <LineChart size={20} /> },
  ];

  const handleLogout = async () => {
    const confirmed = await dialog.confirm({
      title: "Keluar dari akun?",
      message: "Sesi Anda akan diakhiri dan Anda perlu login kembali untuk masuk ke dashboard.",
      confirmLabel: "Ya, keluar",
      cancelLabel: "Tetap di sini",
      variant: "danger",
    });

    if (!confirmed) return;
    
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId"); // Bersihkan juga userId
    router.replace("/login");
  };

  return (
    <>
      {/* 📱 MOBILE NAVBAR (Tombol Burger) - Hanya muncul di HP */}
      <div className="lg:hidden fixed top-0 left-0 w-full h-20 bg-white/90 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-6 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] flex items-center justify-center text-white font-black">
            <GraduationCap size={20} />
          </div>
          <h1 className="text-lg font-black text-slate-800 tracking-tight">Personalized<span className="text-blue-600">AI</span></h1>
        </div>
        <button 
          onClick={() => setIsOpen(true)}
          className="w-12 h-12 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center border border-slate-100 shadow-inner active:scale-95 transition-all hover:bg-blue-50 hover:text-blue-600"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* 🌑 OVERLAY GELAP (Saat Sidebar terbuka di HP) */}
      <div 
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-500 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      ></div>

      {/* 💻 SIDEBAR UTAMA (Light 3D Glassmorphism) */}
      <aside 
        className={`fixed lg:sticky top-0 left-0 w-72 h-[100dvh] bg-white/90 backdrop-blur-3xl text-slate-600 flex flex-col z-50 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] border-r border-slate-100 shadow-[20px_0_50px_rgba(0,0,0,0.05)] lg:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Efek Cahaya Ambien 3D di Sidebar */}
        <div className="absolute top-0 left-0 w-full h-40 bg-blue-50/50 blur-[50px] pointer-events-none"></div>

        {/* HEADER LOGO SIDEBAR */}
        <div className="p-8 relative z-10 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-default">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-[0_10px_20px_-5px_rgba(37,99,235,0.4)] flex items-center justify-center text-white group-hover:rotate-12 transition-transform duration-500 border border-blue-400/20">
              <GraduationCap size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">Personalized<span className="text-blue-600">AI</span></h1>
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-[0.2em] mt-1.5">Ruang Mahasiswa</p>
            </div>
          </div>

          {/* Tombol Close untuk Mobile */}
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-100 hover:text-slate-700 transition-colors border border-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* NAVIGATION LIST */}
        <nav className="flex-1 px-5 space-y-2 relative z-10 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent pb-6">
          <p className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 mt-2">
            Menu Utama
          </p>

          {menu.map((item) => {
            const isActive = item.path === "/dashboard/mahasiswa" 
              ? pathname === item.path 
              : pathname === item.path || pathname.startsWith(item.path + '/');

            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsOpen(false)} // Tutup sidebar di HP saat menu diklik
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300 group relative overflow-hidden ${
                  isActive
                    ? "text-white shadow-[0_10px_30px_-10px_rgba(37,99,235,0.5)] translate-x-2 border border-blue-100"
                    : "text-slate-500 hover:text-blue-700 hover:bg-blue-50/50 border border-transparent hover:border-blue-100/50"
                }`}
              >
                {/* Background Active Gradient */}
                {isActive && <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-100"></div>}
                
                <span className={`relative z-10 transition-transform duration-500 ${isActive ? "text-white scale-110 drop-shadow-md" : "text-slate-400 group-hover:text-blue-500 group-hover:scale-110"}`}>
                  {item.icon}
                </span>
                <span className="relative z-10">{item.name}</span>
              </Link>
            );
          })}

          <div className="my-6 border-t border-slate-100/80 mx-2" />

          <p className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">
            Lainnya
          </p>

          {/* MENU PROFIL SAYA */}
          <Link
            href="/dashboard/mahasiswa/profile"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-4 px-5 py-4 mb-2 rounded-2xl text-sm font-bold transition-all duration-300 group relative overflow-hidden ${
              pathname.includes("/dashboard/mahasiswa/profile")
                ? "text-white shadow-[0_10px_30px_-10px_rgba(37,99,235,0.5)] translate-x-2 border border-blue-100"
                : "text-slate-500 hover:text-blue-700 hover:bg-blue-50/50 border border-transparent hover:border-blue-100/50"
            }`}
          >
            {pathname.includes("/dashboard/mahasiswa/profile") && <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-100"></div>}
            <User size={20} className={`relative z-10 transition-transform duration-500 ${pathname.includes("/dashboard/mahasiswa/profile") ? "text-white scale-110 drop-shadow-md" : "text-slate-400 group-hover:text-blue-500 group-hover:scale-110"}`} />
            <span className="relative z-10">Profil Saya</span>
          </Link>

          {/* MENU TENTANG APLIKASI */}
          <Link
            href="/dashboard/mahasiswa/about"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-4 px-5 py-4 mb-4 rounded-2xl text-sm font-bold transition-all duration-300 group relative overflow-hidden ${
              pathname === "/dashboard/mahasiswa/about"
                ? "text-white shadow-[0_10px_30px_-10px_rgba(37,99,235,0.5)] translate-x-2 border border-blue-100"
                : "text-slate-500 hover:text-blue-700 hover:bg-blue-50/50 border border-transparent hover:border-blue-100/50"
            }`}
          >
            {pathname === "/dashboard/mahasiswa/about" && <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-100"></div>}
            <Info size={20} className={`relative z-10 transition-transform duration-500 ${pathname === "/dashboard/mahasiswa/about" ? "text-white scale-110 drop-shadow-md" : "text-slate-400 group-hover:text-blue-500 group-hover:scale-110"}`} />
            <span className="relative z-10">Tentang Kami</span>
          </Link>
        </nav>

        {/* FOOTER / LOGOUT BUTTON (3D POP) */}
        <div className="p-5 relative z-10 shrink-0 bg-slate-50/50 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-3 w-full px-5 py-4 rounded-2xl text-sm font-bold text-red-500 bg-white hover:bg-gradient-to-r hover:from-red-500 hover:to-rose-500 hover:text-white transition-all duration-300 border border-slate-200 hover:border-red-500 hover:shadow-[0_10px_30px_-10px_rgba(220,38,38,0.5)] group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform duration-300" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>
    </>
  );
}

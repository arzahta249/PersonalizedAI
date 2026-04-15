"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppDialog } from "@/components/AppDialogProvider";
import { 
  FiLogOut, 
  FiGrid, 
  FiBook, 
  FiFileText, 
  FiHelpCircle, 
  FiInfo,
  FiClipboard,
  FiUser,
  FiMenu, // Icon Burger
  FiX     // Icon Close
} from "react-icons/fi";

export default function SidebarDosen() {
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

  const menu = [
    { name: "Dashboard", path: "/dashboard/dosen", icon: <FiGrid /> },
    { name: "Kelola Kursus", path: "/dashboard/dosen/courses", icon: <FiBook /> },
    { name: "Kelola Materi", path: "/dashboard/dosen/materi", icon: <FiFileText /> }, 
    { name: "Kelola Kuis", path: "/dashboard/dosen/quiz", icon: <FiHelpCircle /> },
    { name: "Kelola Penugasan", path: "/dashboard/dosen/assignments", icon: <FiClipboard /> },
  ];

  const handleLogout = async () => {
    const confirmed = await dialog.confirm({
      title: "Keluar dari sesi?",
      message: "Anda akan keluar dari panel dosen dan perlu login kembali untuk melanjutkan pekerjaan.",
      confirmLabel: "Ya, keluar",
      cancelLabel: "Batal",
      variant: "danger",
    });

    if (!confirmed) return;

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    router.replace("/login");
  };

  return (
    <>
      {/* 📱 MOBILE NAVBAR (Tombol Burger) - Hanya muncul di HP */}
      <div className="lg:hidden fixed top-0 left-0 w-full h-20 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50 flex items-center justify-between px-6 z-40 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.5)] flex items-center justify-center text-white font-black text-sm">
            A
          </div>
          <h1 className="text-lg font-black text-white tracking-tight">Personalized<span className="text-blue-500">AI</span></h1>
        </div>
        <button 
          onClick={() => setIsOpen(true)}
          className="w-12 h-12 bg-slate-800 text-slate-300 rounded-xl flex items-center justify-center border border-slate-700 shadow-inner active:scale-95 transition-all"
        >
          <FiMenu size={24} />
        </button>
      </div>

      {/* 🌑 OVERLAY GELAP (Saat Sidebar terbuka di HP) */}
      <div 
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-500 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      ></div>

      {/* 💻 SIDEBAR UTAMA (3D & Glassmorphism) */}
      <aside 
        className={`fixed lg:sticky top-0 left-0 w-72 h-[100dvh] bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-300 flex flex-col z-50 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] border-r border-slate-800/80 shadow-[20px_0_50px_rgba(0,0,0,0.5)] lg:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Efek Cahaya Ambien 3D di Sidebar */}
        <div className="absolute top-0 left-0 w-full h-40 bg-blue-600/10 blur-[60px] pointer-events-none"></div>

        {/* HEADER LOGO SIDEBAR */}
        <div className="p-8 relative z-10 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-default">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-[0_10px_20px_-5px_rgba(37,99,235,0.6)] flex items-center justify-center text-white font-black text-lg border border-blue-400/30 group-hover:rotate-12 transition-transform duration-500">
              A
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight leading-none drop-shadow-md">Personalized<span className="text-blue-500">AI</span></h1>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em] mt-1.5">Dosen Panel</p>
            </div>
          </div>

          {/* Tombol Close untuk Mobile */}
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden w-10 h-10 bg-slate-800/50 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-700 hover:text-white transition-colors border border-slate-700/50"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* NAVIGATION LIST */}
        <nav className="flex-1 px-5 space-y-2 relative z-10 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent pb-6">
          {menu.map((item) => {
            const isActive = item.path === "/dashboard/dosen" 
              ? pathname === item.path 
              : pathname === item.path || pathname.startsWith(item.path + '/');

            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsOpen(false)} // Tutup sidebar di HP saat menu diklik
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300 group relative overflow-hidden ${
                  isActive
                    ? "text-white shadow-[0_10px_30px_-10px_rgba(37,99,235,0.8)] translate-x-2 border border-blue-500/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent hover:border-slate-700/50"
                }`}
              >
                {/* Background Active Gradient */}
                {isActive && <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-100"></div>}
                
                <span className={`relative z-10 text-xl transition-transform duration-500 ${isActive ? "text-white scale-110 drop-shadow-lg" : "text-slate-500 group-hover:text-blue-400 group-hover:scale-110"}`}>
                  {item.icon}
                </span>
                <span className="relative z-10">{item.name}</span>
              </Link>
            );
          })}

          <div className="pt-8 pb-3 px-5 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
            Pengaturan
          </div>

          <Link
            href="/dashboard/dosen/profile"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-4 px-5 py-4 mb-2 rounded-2xl text-sm font-bold transition-all duration-300 group relative overflow-hidden ${
              pathname.includes("/dashboard/dosen/profile")
                ? "text-white shadow-[0_10px_30px_-10px_rgba(37,99,235,0.8)] translate-x-2 border border-blue-500/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent hover:border-slate-700/50"
            }`}
          >
            {pathname.includes("/dashboard/dosen/profile") && <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-100"></div>}
            <FiUser className={`relative z-10 text-xl transition-transform duration-500 ${pathname.includes("/dashboard/dosen/profile") ? "text-white scale-110 drop-shadow-lg" : "text-slate-500 group-hover:text-blue-400 group-hover:scale-110"}`} />
            <span className="relative z-10">Profil Saya</span>
          </Link>

          <Link
            href="/dashboard/dosen/about"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-4 px-5 py-4 mb-4 rounded-2xl text-sm font-bold transition-all duration-300 group relative overflow-hidden ${
              pathname === "/dashboard/dosen/about"
                ? "text-white shadow-[0_10px_30px_-10px_rgba(37,99,235,0.8)] translate-x-2 border border-blue-500/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent hover:border-slate-700/50"
            }`}
          >
            {pathname === "/dashboard/dosen/about" && <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-100"></div>}
            <FiInfo className={`relative z-10 text-xl transition-transform duration-500 ${pathname === "/dashboard/dosen/about" ? "text-white scale-110 drop-shadow-lg" : "text-slate-500 group-hover:text-blue-400 group-hover:scale-110"}`} />
            <span className="relative z-10">Tentang Kami</span>
          </Link>
        </nav>

        {/* FOOTER / LOGOUT BUTTON (3D POP) */}
        <div className="p-5 relative z-10 shrink-0 bg-slate-900 border-t border-slate-800/80">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-3 w-full px-5 py-4 rounded-2xl text-sm font-bold text-slate-400 bg-slate-800/30 hover:bg-gradient-to-r hover:from-red-600 hover:to-rose-600 hover:text-white transition-all duration-300 border border-slate-700/50 hover:border-red-500 hover:shadow-[0_10px_30px_-10px_rgba(220,38,38,0.8)] group"
          >
            <FiLogOut className="text-xl group-hover:-translate-x-1 transition-transform duration-300" />
            <span>Keluar Sesi</span>
          </button>
        </div>
      </aside>
    </>
  );
}

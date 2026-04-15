"use client";

import DashboardAiChatbot from "@/components/DashboardAiChatbot";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LogOut, 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Menu, 
  X, 
  CheckSquare,
  FileText,
  Info
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Tambahkan path /dashboard/admin/assignments di sini
  const menu = [
    { name: "Dashboard", path: "/dashboard/admin", icon: <LayoutDashboard size={20} /> },
    { name: "Users", path: "/dashboard/admin/users", icon: <Users size={20} /> },
    { name: "Materi", path: "/dashboard/admin/materi", icon: <BookOpen size={20} /> },
    { name: "Quiz Approval", path: "/dashboard/admin/quizzes", icon: <CheckSquare size={20} /> },
    { name: "Penugasan", path: "/dashboard/admin/assignments", icon: <FileText size={20} /> },
    { name: "Tentang Kami", path: "/dashboard/admin/about", icon: <Info size={20} /> },
  ];

  const handleLogout = () => {
    localStorage.clear();
    router.replace("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-slate-800">
      {/* TOMBOL BURGER MOBILE */}
      <button 
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-white shadow-md rounded-lg border border-gray-200"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* SIDEBAR DENGAN TRANSISI CSS MURNI */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 w-72 h-screen bg-white border-r border-gray-200 p-6 flex flex-col justify-between
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div>
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">A</div>
            <h1 className="text-2xl font-bold tracking-tight">Admin<span className="text-blue-600">Hub</span></h1>
          </div>

          <nav className="space-y-1">
            {menu.map((item) => {
              const isActive = item.path === "/dashboard/admin"
                ? pathname === item.path
                : pathname === item.path || pathname.startsWith(item.path + "/");
              return (
                <Link key={item.path} href={item.path} onClick={() => setSidebarOpen(false)}>
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                    isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "text-slate-500 hover:bg-gray-100"
                  }`}>
                    {item.icon}
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors font-medium">
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* OVERLAY UNTUK MOBILE */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* MAIN CONTENT */}
      <main className="min-w-0 flex-1 min-h-screen overflow-x-hidden p-4 pb-24 pt-20 sm:p-5 sm:pb-28 lg:p-10 lg:pb-10 lg:pt-10">
        <div className="mx-auto w-full max-w-7xl">
          {children}
        </div>
      </main>

      <DashboardAiChatbot role="ADMIN" />
    </div>
  );
}

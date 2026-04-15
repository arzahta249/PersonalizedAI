"use client";

import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { useAppDialog } from "@/components/AppDialogProvider";
import { Users, Book, Award, GraduationCap, Trash2, Search, ArrowUpRight, Loader2, UserCheck, Activity } from "lucide-react";

export default function AdminDashboard() {
  const dialog = useAppDialog();
  const [stat, setStat] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // --- FUNGSI AMBIL DATA DARI API KAMU ---
  const loadData = useCallback(async () => {
    try {
      const [resStat, resUsers] = await Promise.all([
        fetch("/api/admin/stat"),
        fetch("/api/admin/users")
      ]);

      if (resStat.ok) {
        const dataStat = await resStat.json();
        setStat(dataStat);
      }

      if (resUsers.ok) {
        const dataUsers = await resUsers.json();
        setUsers(dataUsers);
      }
    } catch (error) {
      console.error("Gagal sinkronisasi data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Hapus User & Refresh Stat
  async function handleDelete(id: string) {
    const confirmed = await dialog.confirm({
      title: "Hapus pengguna permanen?",
      message: "Akun yang dihapus akan hilang dari sistem. Tindakan ini tidak bisa dibatalkan.",
      confirmLabel: "Ya, hapus",
      cancelLabel: "Batal",
      variant: "danger",
    });

    if (!confirmed) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        // Panggil ulang loadData agar angka stat di atas ikut berkurang otomatis
        loadData();
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menghapus user.");
    }
  }

  // Filter Search Dinamis
  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.npm?.includes(searchQuery)
  );

  // Konfigurasi Card (Mapping Key sesuai API kamu)
  const statsConfig = [
    { title: "Total Users", key: "totalUsers", icon: <Users size={20} />, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Dosen", key: "dosen", icon: <UserCheck size={20} />, color: "text-indigo-600", bg: "bg-indigo-50" },
    { title: "Mahasiswa", key: "mahasiswa", icon: <GraduationCap size={20} />, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Total Materi", key: "totalCourses", icon: <Book size={20} />, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Total Quiz", key: "totalQuiz", icon: <Award size={20} />, color: "text-orange-600", bg: "bg-orange-50" },
    { title: "User Aktif", key: "activeUsers", icon: <Activity size={20} />, color: "text-cyan-600", bg: "bg-cyan-50" },
  ];

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      <p className="text-slate-500 font-medium animate-pulse">Menghubungkan ke API Prisma...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight text-center md:text-left">Dashboard Admin</h1>
        <p className="text-slate-500 text-sm text-center md:text-left font-medium">Manajemen data pengguna dan materi secara real-time.</p>
      </div>

      {/* STAT CARDS - Menggunakan 6 Kolom agar semua data API tampil */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statsConfig.map((item, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className={`${item.bg} ${item.color} w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              {item.icon}
            </div>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{item.title}</p>
            <h2 className="text-2xl font-bold text-slate-800 mt-1">{stat?.[item.key] ?? 0}</h2>
          </div>
        ))}
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="font-bold text-lg text-slate-800">Daftar Pengguna</h2>
            <p className="text-xs text-slate-400 font-medium">Menampilkan {filteredUsers.length} total akun</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Cari Nama, Email, atau NPM..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Informasi User</th>
                <th className="px-6 py-4">NPM</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm italic md:not-italic">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700">{user.name || "Anonim"}</span>
                        <span className="text-xs text-slate-400">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{user.npm || "-"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold tracking-tighter ${
                        user.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-400 text-sm">Data tidak ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

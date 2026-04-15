"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiBookOpen, FiPlus, FiTrash2, FiLayers, FiBarChart } from "react-icons/fi";
import { useAppDialog } from "@/components/AppDialogProvider";

export default function CoursesPage() {
  const dialog = useAppDialog();
  const [courses, setCourses] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    level: "",
    category: "",
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const res = await fetch("/api/dosen/courses");
    const data = await res.json();
    setCourses(data);
  };

  const handleCreate = async (e: any) => {
    e.preventDefault();
    const res = await fetch("/api/dosen/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) {
      toast.error(data.message);
      return;
    }

    toast.success("Kursus berhasil dibuat");
    setForm({ title: "", description: "", level: "", category: "" });
    fetchCourses();
  };

  const handleDelete = async (id: string) => {
    const confirmed = await dialog.confirm({
      title: "Hapus kursus ini?",
      message: "Kursus yang dihapus tidak bisa dipulihkan. Pastikan data penting sudah aman.",
      confirmLabel: "Ya, hapus",
      cancelLabel: "Batal",
      variant: "danger",
    });

    if (!confirmed) return;
    await fetch(`/api/dosen/courses/${id}`, { method: "DELETE" });
    toast.success("Kursus dihapus");
    fetchCourses();
  };

  return (
    <div className="p-4 md:p-8 space-y-10 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 text-white">
          <FiBookOpen size={24} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Kelola Kursus</h1>
      </div>

      {/* 🔥 FORM (Soft 3D Card) */}
      <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 bg-blue-600 h-full"></div>
        
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
          <FiPlus /> Tambah Kursus Baru
        </h2>

        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-4 md:col-span-2">
            <input
              placeholder="Judul Kursus"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-semibold"
            />
            <input
              placeholder="Deskripsi Singkat"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-semibold"
            />
          </div>

          {/* SELECT LEVEL */}
          <div className="relative group">
            <FiBarChart className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <select
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
              className="w-full bg-slate-50 border border-slate-100 p-4 pl-12 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-bold text-slate-700 appearance-none cursor-pointer"
            >
              <option value="">Pilih Level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          {/* SELECT CATEGORY */}
          <div className="relative group">
            <FiLayers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full bg-slate-50 border border-slate-100 p-4 pl-12 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-bold text-slate-700 appearance-none cursor-pointer"
            >
              <option value="">Pilih Kategori</option>
              <option value="Informatika">Informatika</option>
              <option value="Sistem Informasi">Sistem Informasi</option>
              <option value="Kecerdasan Buatan">Kecerdasan Buatan</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          <div className="md:col-span-2 pt-2">
            <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-blue-600 hover:-translate-y-1 active:scale-95 transition-all w-full md:w-auto">
              Simpan Kursus
            </button>
          </div>
        </form>
      </div>

      {/* 🔥 LIST (Clean 3D Card) */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <h3 className="font-bold text-slate-800">Daftar Kursus Anda</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50">
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="p-6">Judul</th>
                <th className="p-6">Level</th>
                <th className="p-6">Kategori</th>
                <th className="p-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {courses.map((c) => (
                <tr key={c.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="p-6">
                    <p className="font-bold text-slate-800 tracking-tight">{c.title}</p>
                  </td>
                  <td className="p-6">
                    <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                      {c.level}
                    </span>
                  </td>
                  <td className="p-6">
                    <p className="text-sm font-semibold text-slate-500">{c.category}</p>
                  </td>
                  <td className="p-6 text-center">
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Hapus"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

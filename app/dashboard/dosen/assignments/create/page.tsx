"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeft, Save, Calendar } from "lucide-react";
import DosenAiStudio from "@/components/DosenAiStudio";

type CourseRow = {
  id: string;
  title: string;
};

type AssignmentFormData = {
  title: string;
  courseId: string;
  dueDate: string;
  description: string;
};

export default function CreateAssignmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [formData, setFormData] = useState<AssignmentFormData>({
    title: "",
    courseId: "",
    dueDate: "",
    description: "",
  });

  useEffect(() => {
    fetch("/api/dosen/courses")
      .then((res) => res.json())
      .then((data) => {
        const normalized = Array.isArray(data) ? data : [];
        setCourses(normalized);
        if (normalized[0]?.id) {
          setFormData((prev) => ({ ...prev, courseId: prev.courseId || normalized[0].id }));
        }
      })
      .catch((error) => console.error("Gagal ambil course:", error));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/dosen/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Gagal menyimpan tugas");

      toast.success("Tugas berhasil dibuat.");
      router.push("/dashboard/dosen/assignments");
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-4 md:p-8">
      <DosenAiStudio
        type="ASSIGNMENT"
        courses={courses.map((course) => ({ id: course.id, title: course.title }))}
        onApply={(draft) => {
          const nextDue = new Date();
          nextDue.setDate(nextDue.getDate() + (typeof draft.dueInDays === "number" ? draft.dueInDays : 7));
          const nextTitle = typeof draft.title === "string" ? draft.title.trim() : "";
          const nextDescription = typeof draft.description === "string" ? draft.description.trim() : "";

          setFormData((prev: AssignmentFormData) => ({
            ...prev,
            title: nextTitle || prev.title,
            description: nextDescription || prev.description,
            dueDate: nextDue.toISOString().slice(0, 16),
          }));
        }}
      />

      <div className="flex flex-col gap-2">
        <Link
          href="/dashboard/dosen/assignments"
          className="flex w-fit items-center gap-2 text-sm font-bold text-slate-400 transition-colors hover:text-blue-600"
        >
          <ArrowLeft size={16} /> Kembali ke Daftar
        </Link>
        <h1 className="mt-2 text-3xl font-black text-slate-900">Buat Tugas Baru</h1>
        <p className="text-slate-500">Instruksi manual tetap tersedia, tapi sekarang Anda juga bisa memulai dari draft AI.</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm md:p-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500">Judul Tugas</label>
            <input
              required
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Contoh: Analisis Arsitektur Sistem..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 font-medium outline-none transition-all focus:border-blue-600 focus:bg-white"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500">Pilih Mata Kuliah</label>
            <select
              required
              name="courseId"
              value={formData.courseId}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 font-medium outline-none transition-all focus:border-blue-600 focus:bg-white text-slate-700"
            >
              <option value="" disabled>
                -- Pilih Mata Kuliah --
              </option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-8 space-y-3 md:w-1/2">
          <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
            <Calendar size={14} /> Batas Waktu
          </label>
          <input
            required
            type="datetime-local"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 font-medium outline-none transition-all focus:border-blue-600 focus:bg-white text-slate-700"
          />
        </div>

        <div className="mt-8 space-y-3">
          <label className="text-xs font-black uppercase tracking-widest text-slate-500">Instruksi Tugas</label>
          <textarea
            required
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={9}
            placeholder="Tuliskan instruksi lengkap tugas di sini..."
            className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 font-medium outline-none transition-all focus:border-blue-600 focus:bg-white"
          />
        </div>

        <div className="pt-8 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`flex items-center gap-3 rounded-2xl bg-blue-600 px-8 py-4 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-700 disabled:opacity-50 ${
              loading ? "btn-loading" : ""
            }`}
          >
            {loading ? <span className="loading-orb text-white" /> : <Save size={18} />}
            <span className={loading ? "loading-dots" : ""}>{loading ? "Menyimpan" : "Simpan & Publikasikan"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

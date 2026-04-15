"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { BookOpen, FileText, Layers3, UploadCloud, Video, Wand2 } from "lucide-react";
import DosenAiStudio from "@/components/DosenAiStudio";

type CourseRow = {
  id: string;
  title: string;
};

type ModuleRow = {
  id: string;
  title: string;
  type: string;
  difficulty: string;
  order: number;
  videoUrl?: string | null;
  fileUrl?: string | null;
  content?: string;
};

type ModuleForm = {
  title: string;
  content: string;
  type: string;
  videoUrl: string;
  fileUrl: string;
  difficulty: string;
  order: number;
};

export default function MateriPage() {
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState<ModuleForm>({
    title: "",
    content: "",
    type: "TEXT",
    videoUrl: "",
    fileUrl: "",
    difficulty: "BEGINNER",
    order: 1,
  });

  useEffect(() => {
    fetch("/api/dosen/courses")
      .then((res) => res.json())
      .then((data) => {
        const normalized = Array.isArray(data) ? data : [];
        setCourses(normalized);
        if (normalized[0]?.id) setSelectedCourse(normalized[0].id);
      });
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    setLoading(true);
    fetch(`/api/dosen/modules?courseId=${selectedCourse}`)
      .then((res) => res.json())
      .then((data) => {
        const normalized = Array.isArray(data) ? data : [];
        setModules(normalized);
        setForm((prev) => ({ ...prev, order: normalized.length + 1 }));
      })
      .finally(() => setLoading(false));
  }, [selectedCourse]);

  const selectedCourseTitle = useMemo(
    () => courses.find((course) => course.id === selectedCourse)?.title || "Mata Kuliah",
    [courses, selectedCourse]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
      toast.success(`File ${e.target.files[0].name} terpilih`);
    }
  };

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return toast.error("Pilih course terlebih dahulu.");

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("content", form.content);
      formData.append("type", form.type);
      formData.append("courseId", selectedCourse);
      formData.append("difficulty", form.difficulty);
      formData.append("order", String(form.order));

      if (form.type === "VIDEO") formData.append("videoUrl", form.videoUrl);
      if (form.type === "FILE" && selectedFile) {
        formData.append("file", selectedFile);
      } else if (form.fileUrl) {
        formData.append("fileUrl", form.fileUrl);
      }

      const res = await fetch("/api/dosen/modules", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Gagal membuat materi.");
        return;
      }

      toast.success("Materi berhasil dipublikasikan.");
      setForm({
        title: "",
        content: "",
        type: "TEXT",
        videoUrl: "",
        fileUrl: "",
        difficulty: "BEGINNER",
        order: modules.length + 2,
      });
      setSelectedFile(null);
      const updated = await fetch(`/api/dosen/modules?courseId=${selectedCourse}`).then((response) => response.json());
      setModules(Array.isArray(updated) ? updated : []);
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengupload materi.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8 p-4 md:p-8">
      <DosenAiStudio
        type="MATERI"
        courses={courses.map((course) => ({ id: course.id, title: course.title }))}
        onApply={(draft) => {
          const nextTitle = typeof draft.title === "string" ? draft.title.trim() : "";
          const nextType = typeof draft.type === "string" ? draft.type.trim() : "";
          const nextDifficulty = typeof draft.difficulty === "string" ? draft.difficulty.trim() : "";
          const nextContent = typeof draft.content === "string" ? draft.content.trim() : "";

          setForm((prev: ModuleForm) => ({
            ...prev,
            title: nextTitle || prev.title,
            type: nextType || prev.type,
            difficulty: nextDifficulty || prev.difficulty,
            content: nextContent || prev.content,
          }));
        }}
      />

      <header className="flex flex-col gap-5 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-end md:justify-between md:p-8">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-600">Content Manager</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Materi dinamis untuk kelas yang lebih hidup.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            Tulis manual atau biarkan AI menyusun draft materi, lalu review sebentar sebelum diterbitkan ke mahasiswa.
          </p>
        </div>

        <div className="w-full md:w-[320px]">
          <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.25em] text-slate-500">Mata Kuliah Aktif</label>
          <select
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 font-bold text-sm outline-none"
            onChange={(e) => setSelectedCourse(e.target.value)}
            value={selectedCourse}
          >
            <option value="">-- Pilih Mata Kuliah --</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-100 p-3 text-blue-600">
              <Wand2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Editor Materi</h2>
              <p className="text-sm text-slate-500">Kursus aktif: {selectedCourseTitle}</p>
            </div>
          </div>

          <form onSubmit={handleCreateModule} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.25em] text-slate-500">Judul Materi</label>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold outline-none transition focus:border-blue-500 focus:bg-white"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.25em] text-slate-500">Tipe</label>
                <select
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold outline-none"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="TEXT">Teks</option>
                  <option value="VIDEO">Video</option>
                  <option value="FILE">Dokumen</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.25em] text-slate-500">Level</label>
                <select
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold outline-none"
                  value={form.difficulty}
                  onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.25em] text-slate-500">Urutan</label>
                <input
                  type="number"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold outline-none"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: parseInt(e.target.value, 10) || 1 })}
                />
              </div>
            </div>

            {form.type === "VIDEO" && (
              <div>
                <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.25em] text-slate-500">Link Video</label>
                <input
                  placeholder="https://youtube.com/..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold outline-none transition focus:border-blue-500 focus:bg-white"
                  value={form.videoUrl}
                  onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                />
              </div>
            )}

            {form.type === "FILE" && (
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-blue-200 bg-white px-4 py-8 text-center transition hover:border-blue-400"
                >
                  <UploadCloud className="h-8 w-8 text-blue-500" />
                  <p className="mt-3 text-sm font-bold text-slate-700">{selectedFile ? selectedFile.name : "Pilih file pendukung"}</p>
                  <p className="mt-1 text-xs text-slate-400">PDF, PPT, DOC, atau ZIP</p>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileSelect}
                  accept=".pdf,.ppt,.pptx,.zip,.doc,.docx"
                />

                <input
                  placeholder="Atau tempel link file eksternal"
                  className="mt-4 w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold outline-none transition focus:border-blue-500"
                  value={form.fileUrl}
                  onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.25em] text-slate-500">Isi Materi</label>
              <textarea
                className="min-h-[220px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium outline-none transition focus:border-blue-500 focus:bg-white"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                required
              />
            </div>

            <button
              disabled={isUploading}
              className={`inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black uppercase tracking-[0.25em] text-white transition hover:bg-blue-600 disabled:opacity-60 ${
                isUploading ? "btn-loading" : ""
              }`}
            >
              {isUploading && <span className="loading-orb text-white" />}
              <span className={isUploading ? "loading-dots" : ""}>{isUploading ? "Menerbitkan" : "Terbitkan Materi"}</span>
            </button>
          </form>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">Materi Terpublikasi</h2>
              <p className="mt-1 text-sm text-slate-500">Semua modul tersusun otomatis berdasarkan urutan dan siap dibuka mahasiswa.</p>
            </div>
            <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
              <Layers3 className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {loading ? (
              <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm font-semibold text-slate-400">
                Memuat modul...
              </div>
            ) : modules.length === 0 ? (
              <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                <BookOpen className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-4 text-lg font-bold text-slate-800">Belum ada materi</p>
                <p className="mt-2 text-sm text-slate-500">Gunakan editor manual atau AI untuk membuat modul pertama Anda.</p>
              </div>
            ) : (
              modules.map((moduleItem) => (
                <article
                  key={moduleItem.id}
                  className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="rounded-2xl bg-white p-3 text-blue-600 shadow-sm">
                        {moduleItem.type === "VIDEO" ? (
                          <Video className="h-5 w-5" />
                        ) : moduleItem.type === "FILE" ? (
                          <FileText className="h-5 w-5" />
                        ) : (
                          <BookOpen className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-blue-600">Urutan {moduleItem.order}</p>
                        <h3 className="mt-2 text-lg font-black text-slate-900">{moduleItem.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-500 line-clamp-3">{moduleItem.content || "Materi tanpa deskripsi"}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white">
                      {moduleItem.type}
                    </span>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

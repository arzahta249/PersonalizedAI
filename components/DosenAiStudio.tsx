"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Sparkles, Wand2, BookOpenCheck } from "lucide-react";

type GeneratorType = "MATERI" | "QUIZ" | "ASSIGNMENT";

type CourseOption = {
  id: string;
  title: string;
};

type ModuleOption = {
  id: string;
  title: string;
};

type DraftPayload = Record<string, unknown>;

type Props = {
  type: GeneratorType;
  courses?: CourseOption[];
  modules?: ModuleOption[];
  onApply: (draft: DraftPayload) => void;
};

const labels: Record<GeneratorType, { title: string; hint: string }> = {
  MATERI: {
    title: "AI Materi Builder",
    hint: "Tulis topik, gaya belajar, atau capaian pembelajaran. AI akan membuat draft materi siap edit.",
  },
  QUIZ: {
    title: "AI Quiz Builder",
    hint: "Minta AI membuat paket soal otomatis lengkap dengan jawaban dan tingkat kesulitan.",
  },
  ASSIGNMENT: {
    title: "AI Assignment Builder",
    hint: "Minta AI menyusun instruksi tugas, luaran, dan deadline rekomendasi untuk mahasiswa.",
  },
};

export default function DosenAiStudio({ type, courses = [], modules = [], onApply }: Props) {
  const [prompt, setPrompt] = useState("");
  const [courseId, setCourseId] = useState(courses[0]?.id || "");
  const [moduleId, setModuleId] = useState(modules[0]?.id || "");
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<DraftPayload | null>(null);

  const courseTitle = useMemo(
    () => courses.find((course) => course.id === courseId)?.title || "Mata Kuliah",
    [courseId, courses]
  );
  const moduleTitle = useMemo(
    () => modules.find((moduleItem) => moduleItem.id === moduleId)?.title || "",
    [moduleId, modules]
  );

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Tulis perintah AI terlebih dahulu.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ai/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          prompt,
          courseTitle,
          moduleTitle,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "AI gagal membuat draft.");
        return;
      }

      const nextDraft = data.draft as DraftPayload;
      setDraft(nextDraft);
      toast.success(`Draft ${type.toLowerCase()} berhasil dibuat.`);
    } catch (error) {
      console.error(error);
      toast.error("Koneksi AI terputus.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.18),_transparent_32%),linear-gradient(135deg,#0f172a,#111827_55%,#1d4ed8)] p-6 text-white shadow-[0_30px_80px_-30px_rgba(15,23,42,0.75)] md:p-7">
      <div className="absolute inset-y-0 right-0 w-40 bg-white/5 blur-3xl" />
      <div className="relative z-10 space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-blue-100">
              <Sparkles className="h-3.5 w-3.5" />
              {labels[type].title}
            </div>
            <h3 className="mt-4 text-2xl font-black tracking-tight">Perintah singkat, draft langsung jadi.</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200">{labels[type].hint}</p>
          </div>
          <div className="hidden rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-right md:block">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-200">Mode</p>
            <p className="mt-2 text-lg font-bold">{type}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[1.3fr_0.7fr_0.7fr]">
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            rows={4}
            placeholder="Contoh: Buatkan quiz 5 soal untuk topik basis data relasional dengan 3 soal pilihan ganda dan 2 essay, fokus ke normalisasi."
            className="min-h-[140px] rounded-[1.5rem] border border-white/10 bg-white/10 px-4 py-4 text-sm text-white outline-none placeholder:text-slate-300"
          />

          <div className="space-y-3">
            <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-blue-100">Mata Kuliah</label>
            <select
              value={courseId}
              onChange={(event) => setCourseId(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none"
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id} className="text-slate-900">
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-blue-100">Modul</label>
            <select
              value={moduleId}
              onChange={(event) => setModuleId(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none"
            >
              <option value="" className="text-slate-900">
                Pilih modul
              </option>
              {modules.map((moduleItem) => (
                <option key={moduleItem.id} value={moduleItem.id} className="text-slate-900">
                  {moduleItem.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className={`inline-flex items-center justify-center gap-3 rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-900 transition hover:-translate-y-0.5 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60 ${
              loading ? "btn-loading" : ""
            }`}
          >
            {loading ? <span className="loading-orb text-slate-900" /> : <Wand2 className="h-4 w-4" />}
            <span className={loading ? "loading-dots" : ""}>{loading ? "Menyusun Draft" : "Generate Dengan AI"}</span>
          </button>

          {draft && (
            <button
              type="button"
              onClick={() => onApply(draft)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-white/20"
            >
              <BookOpenCheck className="h-4 w-4" />
              Terapkan ke Form
            </button>
          )}
        </div>

        {draft && (
          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-blue-100">Preview Draft</p>
            <pre className="mt-3 overflow-auto whitespace-pre-wrap text-xs leading-6 text-slate-100">
              {JSON.stringify(draft, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </section>
  );
}

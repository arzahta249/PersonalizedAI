// app/dashboard/mahasiswa/learn/[moduleId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Download, Loader2 } from "lucide-react";

type ModuleDetail = {
  id: string;
  title: string;
  type: string;
  content: string;
  videoUrl?: string | null;
  fileUrl?: string | null;
  course?: { id: string; title: string } | null;
};

export default function LearnPage() {
  const params = useParams<{ moduleID: string }>();
  const [moduleItem, setModuleItem] = useState<ModuleDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.moduleID) return;

    fetch(`/api/modules/${params.moduleID}`)
      .then((res) => res.json())
      .then((data) => {
        setModuleItem(data);
        const userId = localStorage.getItem("userId");
        if (userId && data?.id) {
          fetch("/api/mahasiswa/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, moduleId: data.id }),
          }).catch(() => null);
        }
      })
      .finally(() => setLoading(false));
  }, [params?.moduleID]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-sm font-semibold text-slate-500">Menyiapkan materi...</p>
      </div>
    );
  }

  if (!moduleItem) {
    return <p className="p-8 text-slate-500">Materi tidak ditemukan.</p>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 md:p-8">
      <header className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-600">{moduleItem.course?.title || "Materi"}</p>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">{moduleItem.title}</h1>
        <p className="mt-3 text-sm font-medium text-slate-500">Tipe Materi: {moduleItem.type}</p>
      </header>

      {moduleItem.videoUrl && (
        <div className="aspect-video overflow-hidden rounded-[2rem] bg-black shadow-2xl">
          <iframe className="h-full w-full" src={moduleItem.videoUrl} allowFullScreen></iframe>
        </div>
      )}

      <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-10">
        <div className="prose prose-slate max-w-none whitespace-pre-wrap">{moduleItem.content}</div>
      </article>

      {moduleItem.fileUrl && (
        <a
          href={moduleItem.fileUrl}
          download
          className="flex items-center gap-4 rounded-[1.5rem] border border-blue-100 bg-blue-50 p-6 text-blue-700 transition hover:bg-blue-100"
        >
          <Download />
          <div>
            <p className="font-bold text-sm">Download Lampiran Materi</p>
            <p className="text-xs opacity-70">Klik untuk mengunduh file pendukung.</p>
          </div>
        </a>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { FiUploadCloud, FiFileText, FiPlayCircle, FiSave, FiCheckCircle, FiFile } from "react-icons/fi";

interface LessonFormProps {
  moduleId: string;
  onComplete: () => void;
}

export default function LessonForm({ moduleId, onComplete }: LessonFormProps) {
  const [type, setType] = useState("TEXT"); // TEXT | VIDEO | FILE
  const [fileType, setFileType] = useState("PDF"); // PDF | WORD | PPT
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    fileUrl: "",
    videoUrl: "",
    order: 1
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Logic: Jika type FILE, kita kirimkan info fileType juga di content atau metadata
      const payload = { 
        ...form, 
        type, 
        moduleId,
        content: type === "FILE" ? `Type: ${fileType}` : form.content 
      };

      const res = await fetch("/api/dosen/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Gagal menyimpan");

      toast.success("Materi berhasil ditambahkan!");
      onComplete();
    } catch (error) {
      toast.error("Terjadi kesalahan saat menyimpan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 p-8 rounded-[40px] border-2 border-dashed border-slate-200 mt-4 animate-in slide-in-from-top duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="font-black text-slate-800 uppercase text-[11px] tracking-[0.2em]">
            Konten Materi Baru
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Pilih format materi pembelajaran</p>
        </div>

        {/* TAB PEMILIH TIPE UTAMA */}
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 w-fit">
          {[
            { id: "TEXT", icon: <FiFileText />, label: "Teks" },
            { id: "VIDEO", icon: <FiPlayCircle />, label: "Video" },
            { id: "FILE", icon: <FiUploadCloud />, label: "File" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setType(item.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${
                type === item.id ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          placeholder="Judul Materi (Contoh: Pertemuan 1 - Pengenalan)"
          className="w-full p-5 bg-white rounded-3xl border-none outline-none focus:ring-2 ring-blue-500/20 font-bold text-sm shadow-sm"
          onChange={e => setForm({...form, title: e.target.value})}
          required
        />

        {/* INPUT KHUSUS TEKS */}
        {type === "TEXT" && (
          <textarea
            placeholder="Tulis isi materi di sini..."
            className="w-full p-6 bg-white rounded-[30px] border-none outline-none focus:ring-2 ring-blue-500/20 font-medium text-sm min-h-[200px] shadow-sm"
            onChange={e => setForm({...form, content: e.target.value})}
          />
        )}

        {/* INPUT KHUSUS VIDEO */}
        {type === "VIDEO" && (
          <div className="p-6 bg-white rounded-[30px] shadow-sm border border-slate-100 space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Link Video Pembelajaran</p>
            <input
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:bg-white focus:ring-2 ring-red-500/10 font-semibold text-sm text-red-600"
              onChange={e => setForm({...form, videoUrl: e.target.value})}
            />
          </div>
        )}

        {/* INPUT KHUSUS FILE (PDF/WORD/PPT) */}
        {type === "FILE" && (
          <div className="space-y-6">
            {/* Sub-selector untuk jenis file */}
            <div className="grid grid-cols-3 gap-3">
              {["PDF", "WORD", "PPT"].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFileType(f)}
                  className={`p-4 rounded-2xl border-2 font-black text-[10px] transition-all flex flex-col items-center gap-2 ${
                    fileType === f ? "border-blue-600 bg-blue-50 text-blue-600 shadow-md" : "border-slate-100 bg-white text-slate-400"
                  }`}
                >
                  <FiFile size={20} />
                  {f} DOCUMENT
                </button>
              ))}
            </div>

            <div className="relative w-full h-44 bg-white rounded-[40px] border-2 border-dashed border-blue-100 flex flex-col items-center justify-center group hover:border-blue-400 transition-all cursor-pointer">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FiUploadCloud className="text-blue-600 text-2xl" />
              </div>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Unggah File {fileType}</p>
              <p className="text-[9px] text-slate-400 mt-1 italic">Klik untuk memilih dokumen materi</p>
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-5 bg-slate-900 text-white rounded-[25px] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3 active:scale-95"
        >
          {loading ? "Menyimpan..." : <><FiCheckCircle size={18} /> Simpan Materi</>}
        </button>
      </form>
    </div>
  );
}
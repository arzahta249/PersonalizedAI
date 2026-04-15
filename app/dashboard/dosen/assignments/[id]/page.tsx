"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { 
  ArrowLeft, 
  Clock, 
  FileText, 
  CheckCircle2, 
  UploadCloud,
  Loader2,
  AlertCircle
} from "lucide-react";

export default function DetailTugasMahasiswaPage() {
  const params = useParams();
  
  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // State untuk form jawaban
  const [answerLink, setAnswerLink] = useState("");

  useEffect(() => {
    if (!params?.id) return;
    
    const userId = localStorage.getItem("userId");

    fetch(`/api/mahasiswa/assignments/${params.id}?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        setAssignment(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [params?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerLink) {
      toast.error("Harap masukkan link jawaban kamu.");
      return;
    }
    
    // (Nanti fungsi POST ke API pengumpulan akan kita taruh di sini)
    toast.success("Link jawaban berhasil disiapkan untuk dikirim.");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em]">Membuka Kertas Tugas...</p>
      </div>
    );
  }

  if (!assignment) {
    return <div className="text-center p-20 text-red-500">Tugas tidak ditemukan.</div>;
  }

  const dueDate = new Date(assignment.dueDate);
  const isPastDue = new Date() > dueDate;
  const hasSubmitted = !!assignment.submission;

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
      
      <Link href="/dashboard/mahasiswa/assignments" className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-blue-600 w-fit transition-colors">
        <ArrowLeft size={16} /> Kembali ke Daftar Tugas
      </Link>

      {/* STATUS BANNER */}
      {hasSubmitted ? (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <CheckCircle2 size={24} className="shrink-0" />
          <div>
            <h3 className="font-bold">Tugas Sudah Dikumpulkan!</h3>
            <p className="text-sm font-medium opacity-80 mt-1">Kamu sudah mengumpulkan tugas ini pada {new Date(assignment.submission.submittedAt).toLocaleString('id-ID')}.</p>
          </div>
        </div>
      ) : isPastDue ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <AlertCircle size={24} className="shrink-0" />
          <div>
            <h3 className="font-bold">Batas Waktu Berakhir</h3>
            <p className="text-sm font-medium opacity-80 mt-1">Maaf, kamu sudah tidak bisa mengumpulkan tugas ini karena melewati batas waktu.</p>
          </div>
        </div>
      ) : null}

      <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
        
        {/* HEADER TUGAS */}
        <div className="border-b border-slate-100 pb-8 space-y-4">
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-full inline-block">
            {assignment.courseTitle}
          </span>
          <h1 className="text-3xl font-black text-slate-900 leading-tight">{assignment.title}</h1>
          
          <div className="flex items-center gap-2 text-orange-600 font-bold bg-orange-50 w-fit px-4 py-2 rounded-xl text-sm">
            <Clock size={16} />
            Deadline: {dueDate.toLocaleString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {/* INSTRUKSI */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileText size={20} className="text-blue-600" /> Instruksi Pengerjaan
          </h3>
          <div className="bg-slate-50 p-6 rounded-2xl text-slate-600 font-medium leading-relaxed whitespace-pre-wrap border border-slate-100">
            {assignment.description}
          </div>
        </div>

        {/* AREA PENGUMPULAN (Tampil jika belum kumpul dan belum telat) */}
        {!hasSubmitted && !isPastDue && (
          <div className="pt-8 border-t border-slate-100 space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <UploadCloud size={20} className="text-blue-600" /> Pengumpulan Jawaban
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Link Jawaban (Google Drive / Doc / Github)</label>
                <input 
                  type="url" 
                  required
                  placeholder="https://..." 
                  value={answerLink}
                  onChange={(e) => setAnswerLink(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
                <p className="text-xs text-slate-400 font-medium ml-1">Pastikan link dapat diakses oleh dosen (Tidak di-Private).</p>
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-600/30 text-sm flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                {submitting ? "Mengirim..." : "Kumpulkan Tugas Sekarang"}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

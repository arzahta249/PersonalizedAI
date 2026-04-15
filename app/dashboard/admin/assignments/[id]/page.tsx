"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { 
  ArrowLeft, FileText, Users, Clock, 
  ExternalLink, Edit3, X, Save, CheckCircle2, Loader2 
} from "lucide-react";

export default function DosenAssignmentDetailPage() {
  const params = useParams();
  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // State untuk Modal Penilaian
  const [isGrading, setIsGrading] = useState(false);
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [score, setScore] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  // Fetch Data Tugas
  const fetchAssignment = () => {
    fetch(`/api/dosen/assignments/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setAssignment(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (params?.id) fetchAssignment();
  }, [params?.id]);

  // Fungsi Buka Modal
  const openGradingModal = (submission: any) => {
    setSelectedSub(submission);
    setScore(submission.score ? submission.score.toString() : "");
    setFeedback(submission.feedback || "");
    setIsGrading(true);
  };

  // Fungsi Simpan Nilai
  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch(`/api/dosen/assignments/${params.id}/grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: selectedSub.id,
          score: score,
          feedback: feedback
        }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan");
      
      toast.success("Nilai berhasil disimpan.");
      setIsGrading(false);
      fetchAssignment(); // Refresh data otomatis setelah nilai masuk
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em]">Memuat Ruang Penilaian...</p>
      </div>
    );
  }

  if (!assignment) return <div className="p-20 text-center">Tugas tidak ditemukan.</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
      
      <Link href="/dashboard/dosen/assignments" className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-blue-600 w-fit transition-colors">
        <ArrowLeft size={16} /> Kembali ke Daftar Tugas
      </Link>

      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
            {assignment.course?.title}
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-3">{assignment.title}</h1>
          <p className="text-sm text-slate-500 mt-2 font-medium flex items-center gap-2">
            <Clock size={16} /> Deadline: {new Date(assignment.dueDate).toLocaleString('id-ID')}
          </p>
        </div>
        <div className="bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100 text-center shrink-0">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Terkumpul</p>
          <p className="text-2xl font-black text-slate-800">{assignment.submissions?.length || 0} <span className="text-sm text-slate-400 font-medium">mhs</span></p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-black text-slate-900">Daftar Pengumpulan Mahasiswa</h2>
        </div>

        {assignment.submissions && assignment.submissions.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {assignment.submissions.map((sub: any) => (
              <div key={sub.id} className="p-6 md:p-8 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                <div>
                  <h3 className="font-bold text-slate-900">{sub.user?.name || "Mahasiswa"}</h3>
                  <p className="text-xs text-slate-500 mt-1">{sub.user?.email}</p>
                </div>
                
                <div className="flex items-center gap-4">
                  {sub.score !== null ? (
                    <div className="text-right mr-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nilai</p>
                      <p className="text-xl font-black text-emerald-600">{sub.score}</p>
                    </div>
                  ) : (
                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest bg-orange-50 px-3 py-1.5 rounded-md mr-4">
                      Belum Dinilai
                    </span>
                  )}

                  <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-white border border-slate-200 text-slate-600 hover:border-blue-600 hover:text-blue-600 rounded-xl transition-all" title="Lihat File Jawaban">
                    <ExternalLink size={18} />
                  </a>
                  
                  <button onClick={() => openGradingModal(sub)} className="flex items-center gap-2 px-4 py-3 bg-slate-900 text-white hover:bg-blue-600 rounded-xl text-xs font-bold transition-all shadow-sm">
                    {sub.score !== null ? <><Edit3 size={16} /> Edit Nilai</> : <><CheckCircle2 size={16} /> Beri Nilai</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center text-slate-400">
            <Users size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-bold text-slate-600">Belum ada pengumpulan</p>
          </div>
        )}
      </div>

      {/* MODAL PENILAIAN */}
      {isGrading && selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 relative">
            
            <button onClick={() => setIsGrading(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
              <X size={20} />
            </button>

            <h3 className="text-xl font-black text-slate-900 mb-1">Berikan Penilaian</h3>
            <p className="text-sm text-slate-500 font-medium mb-6">Atas nama <span className="text-blue-600 font-bold">{selectedSub.user?.name}</span></p>

            <form onSubmit={handleSaveGrade} className="space-y-5">
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Nilai (0 - 100)</label>
                <input 
                  type="number" 
                  min="0" max="100" required
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="w-full p-4 text-2xl font-black text-center bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-600 focus:bg-white transition-all"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Catatan / Feedback (Opsional)</label>
                <textarea 
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-blue-600 focus:bg-white transition-all resize-none"
                  placeholder="Ketik komentar untuk mahasiswa di sini..."
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {isSaving ? "Menyimpan..." : "Simpan Nilai"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

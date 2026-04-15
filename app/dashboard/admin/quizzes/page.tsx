"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAppDialog } from "@/components/AppDialogProvider";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Loader2, 
  FileText,
  AlertTriangle
} from "lucide-react";

export default function AdminQuizApprovalPage() {
  const dialog = useAppDialog();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Fungsi mengambil data
  const fetchQuizzes = () => {
    setLoading(true);
    fetch("/api/admin/quizzes")
      .then((res) => res.json())
      .then((data) => {
        setQuizzes(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // Fungsi merubah status (Approve/Reject)
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const confirmed = await dialog.confirm({
      title: "Ubah status kuis?",
      message: `Status kuis akan diubah menjadi ${newStatus}. Pastikan keputusan ini sudah final.`,
      confirmLabel: "Ya, proses",
      cancelLabel: "Batal",
      variant: newStatus === "REJECTED" ? "danger" : "info",
    });

    if (!confirmed) return;
    
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/quizzes/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Gagal update");
      
      // Refresh data setelah berhasil
      fetchQuizzes();
    } catch (error) {
      toast.error("Terjadi kesalahan saat memproses data.");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em]">Memuat Data Kuis...</p>
      </div>
    );
  }

  // Filter data sesuai Tab yang aktif
  const displayedQuizzes = quizzes.filter(q => q.status === activeTab);

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Quiz Approval</h1>
        <p className="text-slate-500 mt-2">Tinjau dan setujui kuis yang diajukan oleh dosen sebelum dipublikasikan ke mahasiswa.</p>
      </div>

      {/* TABS NAVIGASI */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab("PENDING")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "PENDING" ? "bg-white text-orange-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
        >
          <Clock size={16} /> Menunggu ({quizzes.filter(q => q.status === "PENDING").length})
        </button>
        <button 
          onClick={() => setActiveTab("APPROVED")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "APPROVED" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
        >
          <CheckCircle2 size={16} /> Disetujui
        </button>
        <button 
          onClick={() => setActiveTab("REJECTED")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "REJECTED" ? "bg-white text-red-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
        >
          <XCircle size={16} /> Ditolak
        </button>
      </div>

      {/* DAFTAR KUIS (TABLE/LIST VIEW) */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        {displayedQuizzes.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {displayedQuizzes.map((quiz) => (
              <div key={quiz.id} className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50 transition-colors">
                
                <div className="flex items-start gap-5">
                  <div className={`p-4 rounded-2xl ${
                    quiz.status === "PENDING" ? "bg-orange-50 text-orange-600" : 
                    quiz.status === "APPROVED" ? "bg-emerald-50 text-emerald-600" : 
                    "bg-red-50 text-red-600"
                  }`}>
                    <FileText size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-md">
                      {quiz.courseTitle}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-2">{quiz.title}</h3>
                    <p className="text-xs text-slate-500 font-medium">Modul: {quiz.moduleTitle}</p>
                  </div>
                </div>

                {/* ACTION BUTTONS (Hanya aktif jika status PENDING) */}
                {quiz.status === "PENDING" ? (
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleUpdateStatus(quiz.id, "REJECTED")}
                      disabled={processingId === quiz.id}
                      className="px-6 py-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors disabled:opacity-50"
                    >
                      Tolak
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(quiz.id, "APPROVED")}
                      disabled={processingId === quiz.id}
                      className="px-6 py-3 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl text-xs font-black uppercase tracking-widest transition-colors disabled:opacity-50"
                    >
                      {processingId === quiz.id ? <Loader2 size={16} className="animate-spin" /> : "Setujui Kuis"}
                    </button>
                  </div>
                ) : (
                  <div className="px-5 py-2 border border-slate-100 rounded-xl bg-white text-xs font-bold text-slate-400">
                    Diproses
                  </div>
                )}
                
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 flex flex-col items-center justify-center text-center text-slate-400">
            <AlertTriangle size={48} className="mb-4 opacity-20" />
            <p className="font-bold text-slate-600">Tidak ada data</p>
            <p className="text-sm mt-1">Belum ada kuis di kategori ini.</p>
          </div>
        )}
      </div>

    </div>
  );
}

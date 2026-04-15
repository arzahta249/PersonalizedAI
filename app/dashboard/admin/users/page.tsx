"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAppDialog } from "@/components/AppDialogProvider";
import { Check, Loader2, Search, Shield, Trash2, UserRound, X } from "lucide-react";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "DOSEN" | "MAHASISWA";
  npm: string | null;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  approvedAt: string | null;
};

export default function UsersPage() {
  const dialog = useAppDialog();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengambil data user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const searchStr = searchQuery.toLowerCase();
    return users.filter((user) =>
      [user.name, user.email, user.npm || "", user.role, user.approvalStatus]
        .join(" ")
        .toLowerCase()
        .includes(searchStr)
    );
  }, [searchQuery, users]);

  const handleDelete = async (id: string) => {
    const confirmed = await dialog.confirm({
      title: "Hapus user ini?",
      message: "Data pengguna akan dihapus dari sistem. Pastikan tindakan ini memang diperlukan.",
      confirmLabel: "Ya, hapus",
      cancelLabel: "Batal",
      variant: "danger",
    });

    if (!confirmed) return;

    try {
      setProcessingId(id);
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Gagal menghapus user");
        return;
      }

      toast.success("User berhasil dihapus");
      fetchUsers();
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproval = async (id: string, approvalStatus: "APPROVED" | "REJECTED") => {
    try {
      setProcessingId(id);
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvalStatus }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Gagal memperbarui approval");
        return;
      }

      toast.success(data.message || "Status berhasil diperbarui");
      fetchUsers();
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium text-slate-500">Memuat data pengguna...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Manajemen User</h1>
          <p className="mt-2 text-sm text-slate-500">Approve dosen dari sini. Mahasiswa aktif otomatis, admin tetap dilindungi kode khusus saat daftar.</p>
        </div>

        <div className="relative w-full lg:w-96">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, email, role, atau status"
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 outline-none transition focus:border-blue-500"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Identitas</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Approval</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400">Data user tidak ditemukan.</td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isPendingLecturer = user.role === "DOSEN" && user.approvalStatus === "PENDING";
                  const isBusy = processingId === user.id;

                  return (
                    <tr key={user.id} className="align-top hover:bg-slate-50/80">
                      <td className="px-6 py-5">
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                            <UserRound className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{user.name}</p>
                            <p className="text-sm text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-600">{user.npm || "-"}</td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${
                          user.role === "ADMIN"
                            ? "bg-blue-100 text-blue-700"
                            : user.role === "DOSEN"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                        }`}>
                          <Shield className="h-3.5 w-3.5" />
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                          user.approvalStatus === "APPROVED"
                            ? "bg-emerald-100 text-emerald-700"
                            : user.approvalStatus === "REJECTED"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-amber-100 text-amber-700"
                        }`}>
                          {user.approvalStatus}
                        </span>
                        {user.approvedAt && (
                          <p className="mt-2 text-xs text-slate-400">
                            {new Date(user.approvedAt).toLocaleString("id-ID")}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          {isPendingLecturer && (
                            <>
                              <button
                                onClick={() => handleApproval(user.id, "APPROVED")}
                                disabled={isBusy}
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                              >
                                <Check className="h-4 w-4" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleApproval(user.id, "REJECTED")}
                                disabled={isBusy}
                                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-rose-700 disabled:opacity-60"
                              >
                                <X className="h-4 w-4" />
                                Reject
                              </button>
                            </>
                          )}
                          <Link
                            href={`/dashboard/admin/users/${user.id}`}
                            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-500 hover:text-blue-600"
                          >
                            Detail
                          </Link>
                          <button
                            onClick={() => handleDelete(user.id)}
                            disabled={isBusy}
                            className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
                          >
                            <span className="inline-flex items-center gap-2">
                              <Trash2 className="h-4 w-4" />
                              Hapus
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

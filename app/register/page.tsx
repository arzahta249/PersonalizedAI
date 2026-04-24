"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

type RegisterRole = "MAHASISWA" | "DOSEN" | "ADMIN";

const roleDescriptions: Record<RegisterRole, string> = {
  MAHASISWA: "Akun mahasiswa langsung aktif setelah daftar.",
  DOSEN: "Akun dosen harus menunggu persetujuan admin sebelum bisa login.",
  ADMIN: "Akun admin wajib memakai kode khusus agar akses tetap aman.",
};

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [role, setRole] = useState<RegisterRole>("MAHASISWA");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [npm, setNpm] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const identityLabel = useMemo(() => {
    if (role === "DOSEN") return "NIDN";
    if (role === "ADMIN") return "ID Admin (opsional)";
    return "NPM";
  }, [role]);

  const identityPlaceholder = useMemo(() => {
    if (role === "DOSEN") return "44xxxxxxxx";
    if (role === "ADMIN") return "ID admin bila diperlukan";
    return "66xxxxxxxx";
  }, [role]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          role,
          email,
          password,
          npm,
          adminCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Register gagal");
        return;
      }

      toast.success(data.message || "Register berhasil");
      router.push("/login");
    } catch (error) {
      console.error(error);
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe,white_45%,#eff6ff)] px-4 py-8">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-white bg-white shadow-[0_30px_120px_-24px_rgba(15,23,42,0.2)] md:grid-cols-[1.05fr_0.95fr]">
        <section className="bg-slate-950 px-8 py-10 text-white md:px-12 md:py-14">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-blue-300">Personalized AI</p>
          <h1 className="mt-5 max-w-md text-4xl font-black leading-tight">Daftarkan 3 role dengan email Gmail yang sama polanya, tanpa beda domain.</h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-slate-300">
            Mahasiswa langsung aktif, dosen menunggu approval admin, dan admin wajib memasukkan kode khusus.
          </p>

          <div className="mt-10 space-y-4">
            {(["MAHASISWA", "DOSEN", "ADMIN"] as RegisterRole[]).map((item) => (
              <div
                key={item}
                className={`rounded-3xl border px-5 py-4 transition-all ${
                  role === item
                    ? "border-blue-400 bg-blue-500/15"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <p className="text-sm font-bold tracking-wide">{item}</p>
                <p className="mt-1 text-sm text-slate-300">{roleDescriptions[item]}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 py-8 md:px-10 md:py-12">
          <div className="mb-8">
            <Link
              href="/"
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-slate-500 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-600"
            >
              ← Kembali ke Landing
            </Link>
            <h2 className="text-3xl font-black tracking-tight text-slate-900">Buat akun</h2>
            <p className="mt-2 text-sm text-slate-500">Semua role memakai email `@gmail.com`, role dibedakan dari pilihan akses.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Nama Lengkap</label>
              <input
                id="register-name"
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                placeholder="Masukkan nama lengkap"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Role Akses</label>
              <select
                id="register-role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value as RegisterRole)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
              >
                <option value="MAHASISWA">Mahasiswa</option>
                <option value="DOSEN">Dosen</option>
                <option value="ADMIN">Admin</option>
              </select>
              <p className="mt-2 text-xs text-slate-500">{roleDescriptions[role]}</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Email Gmail</label>
              <input
                id="register-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                placeholder="nama@gmail.com"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">{identityLabel}</label>
              <input
                id="register-identity"
                name="npm"
                type="text"
                autoComplete="username"
                value={npm}
                onChange={(e) => setNpm(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                placeholder={identityPlaceholder}
                required={role !== "ADMIN"}
              />
            </div>

            {role === "ADMIN" && (
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Kode Khusus Admin</label>
                <input
                  id="register-admin-code"
                  name="adminCode"
                  type="password"
                  autoComplete="one-time-code"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  placeholder="Masukkan kode admin"
                  required
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Password</label>
              <input
                id="register-password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                placeholder="Minimal 6 karakter"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-slate-950 px-4 py-4 text-sm font-bold uppercase tracking-[0.25em] text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Memproses..." : "Daftar Sekarang"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Sudah punya akun? <Link href="/login" className="font-bold text-blue-600 hover:underline">Masuk di sini</Link>
          </p>
        </section>
      </div>
    </div>
  );
}

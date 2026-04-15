import Link from "next/link";
import { BookOpen, BrainCircuit, ChartColumnBig, ShieldCheck, Users } from "lucide-react";

type AboutSectionProps = {
  variant?: "landing" | "dashboard";
  audience?: "public" | "mahasiswa" | "dosen" | "admin";
};

const audienceCopy = {
  public: {
    badge: "Tentang Kami",
    title: "Platform e-learning adaptif yang dibangun untuk pembelajaran yang lebih terarah.",
    description:
      "PersonalizedAI membantu proses belajar, pelatihan, dan evaluasi menjadi lebih terstruktur lewat materi, kuis, penugasan, dan analitik yang saling terhubung dalam satu sistem.",
    ctaPrimary: { href: "/register", label: "Mulai Belajar" },
    ctaSecondary: { href: "/login", label: "Masuk ke Sistem" },
  },
  mahasiswa: {
    badge: "Tentang Kami",
    title: "Ruang belajar mahasiswa yang lebih personal, jelas, dan mudah dipantau.",
    description:
      "Mahasiswa dapat mengakses materi, mengerjakan kuis serta penugasan, lalu memantau progres belajar dalam satu dashboard yang rapi dan adaptif.",
    ctaPrimary: { href: "/dashboard/mahasiswa/courses", label: "Lihat Materi" },
    ctaSecondary: { href: "/dashboard/mahasiswa/progress", label: "Cek Progres" },
  },
  dosen: {
    badge: "Tentang Kami",
    title: "Panel dosen untuk mengelola pembelajaran secara lebih efisien dan terukur.",
    description:
      "Dosen dapat menyusun kursus, menambahkan materi, membuat kuis, memberi penugasan, dan memanfaatkan dukungan AI untuk menyiapkan pengalaman belajar yang lebih efektif.",
    ctaPrimary: { href: "/dashboard/dosen/courses", label: "Kelola Kursus" },
    ctaSecondary: { href: "/dashboard/dosen/materi", label: "Atur Materi" },
  },
  admin: {
    badge: "Tentang Kami",
    title: "Pusat kendali admin untuk menjaga kualitas, keteraturan, dan keberlanjutan sistem.",
    description:
      "Admin memantau pengguna, materi, kuis, dan penugasan agar seluruh ekosistem PersonalizedAI tetap berjalan rapi, aman, dan sesuai kebutuhan institusi.",
    ctaPrimary: { href: "/dashboard/admin/users", label: "Kelola Pengguna" },
    ctaSecondary: { href: "/dashboard/admin/quizzes", label: "Review Quiz" },
  },
};

const highlights = [
  {
    icon: BrainCircuit,
    title: "Pembelajaran Adaptif",
    text: "Konten belajar disusun agar lebih relevan dengan kebutuhan pengguna dan alur pelatihan yang sedang dijalani.",
  },
  {
    icon: BookOpen,
    title: "Materi Terpusat",
    text: "Kursus, materi, kuis, dan penugasan tersimpan dalam satu tempat sehingga proses belajar lebih fokus.",
  },
  {
    icon: ChartColumnBig,
    title: "Progres Terukur",
    text: "Perkembangan belajar dapat dipantau lewat progress dan insight yang memudahkan evaluasi.",
  },
  {
    icon: Users,
    title: "Multi Akses",
    text: "Sistem dirancang untuk mahasiswa, dosen, dan admin dengan pengalaman penggunaan yang sesuai peran.",
  },
];

export default function AboutSection({
  variant = "dashboard",
  audience = "public",
}: AboutSectionProps) {
  const copy = audienceCopy[audience];
  const isLanding = variant === "landing";

  return (
    <section
      id={isLanding ? "tentang" : undefined}
      className={
        isLanding
          ? "py-24 px-6 max-w-6xl mx-auto"
          : "relative overflow-hidden rounded-[36px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.35)] sm:p-8 lg:p-10"
      }
    >
      <div
        className={
          isLanding
            ? "rounded-[40px] border border-white/70 bg-white/80 p-8 shadow-[0_30px_80px_-30px_rgba(37,99,235,0.22)] backdrop-blur-2xl sm:p-10 lg:p-14"
            : ""
        }
      >
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.3em] text-blue-700">
              <ShieldCheck className="h-4 w-4" />
              <span>{copy.badge}</span>
            </div>

            <h2 className="mt-5 max-w-2xl text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl">
              {copy.title}
            </h2>

            <p className="mt-5 max-w-2xl text-sm font-medium leading-7 text-slate-600 sm:text-base">
              {copy.description}
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href={copy.ctaPrimary.href}
                className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-[0_20px_40px_-18px_rgba(37,99,235,0.65)] transition-all hover:-translate-y-1 hover:bg-blue-700"
              >
                {copy.ctaPrimary.label}
              </Link>
              <Link
                href={copy.ctaSecondary.href}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-700 transition-all hover:-translate-y-1 hover:border-blue-200 hover:text-blue-700"
              >
                {copy.ctaSecondary.label}
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {highlights.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_14px_24px_-16px_rgba(37,99,235,0.9)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-sm font-black uppercase tracking-wide text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

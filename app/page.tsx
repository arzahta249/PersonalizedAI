"use client";

import AboutSection from "@/components/AboutSection";
import { formatChatReply } from "@/lib/chat-format";
import Link from "next/link";
import { FormEvent, MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Bot,
  BrainCircuit,
  ChartNoAxesCombined,
  ChevronRight,
  GraduationCap,
  Loader2,
  Menu,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

type LandingMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const heroRotations = [
  {
    badge: "Adaptive Learning Engine",
    title: "Bangun jalur belajar yang terasa personal sejak hari pertama.",
    text: "Personalized AI menyatukan materi, quiz, assignment, progress, dan insight agar proses belajar lebih terarah untuk mahasiswa, dosen, maupun admin.",
  },
  {
    badge: "Role Based Workspace",
    title: "Satu platform, tiga akses, alur kerja yang jelas untuk setiap peran.",
    text: "Mahasiswa fokus belajar, dosen fokus mengelola pembelajaran, dan admin fokus menjaga kualitas sistem dari satu ekosistem yang saling terhubung.",
  },
  {
    badge: "Live Teaching Support",
    title: "Landing page langsung hidup, informatif, dan siap menjelaskan platform Anda.",
    text: "Demo AI membantu pengunjung memahami fitur, role, dan alur belajar tanpa harus login lebih dulu.",
  },
];

const navItems = [
  { href: "#utama", label: "Utama" },
  { href: "#fitur", label: "Fitur" },
  { href: "#materi", label: "Materi" },
  { href: "#tentang", label: "Tentang Kami" },
  { href: "#faq", label: "FAQ" },
];

const stats = [
  { label: "Role Aktif", value: "3", hint: "Mahasiswa, dosen, admin" },
  { label: "Fitur Utama", value: "6+", hint: "Materi, quiz, tugas, progress, AI, approval" },
  { label: "AI Support", value: "24/7", hint: "Bantu jelaskan sistem" },
  { label: "Dashboard", value: "Live", hint: "Tiap role punya alur sendiri" },
];

const features = [
  {
    icon: BrainCircuit,
    title: "Asisten AI Kontekstual",
    text: "AI membantu pengunjung memahami isi website, perbedaan role, dan fungsi fitur berdasarkan konteks aplikasi.",
  },
  {
    icon: BookOpen,
    title: "Materi dan Modul Terstruktur",
    text: "Kursus, modul, dan lesson ditata rapi agar proses belajar lebih fokus dari awal sampai evaluasi.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Progress Lebih Terukur",
    text: "Platform mendukung monitoring progres belajar dan aktivitas evaluasi secara lebih jelas.",
  },
  {
    icon: ShieldCheck,
    title: "Akses Sesuai Peran",
    text: "Setiap role memiliki dashboard dan alur kerja yang berbeda sehingga pengalaman penggunaan terasa relevan.",
  },
];

const learningFlow = [
  {
    step: "01",
    title: "Masuk Sesuai Role",
    text: "Pengguna login atau register lalu diarahkan ke dashboard yang sesuai dengan kebutuhannya.",
  },
  {
    step: "02",
    title: "Jelajahi Materi",
    text: "Mahasiswa membuka course dan modul, sementara dosen menyiapkan materi sebagai jalur belajar.",
  },
  {
    step: "03",
    title: "Kerjakan Evaluasi",
    text: "Quiz dan assignment dipakai untuk mengukur pemahaman pengguna setelah mempelajari materi.",
  },
  {
    step: "04",
    title: "Pantau Hasil",
    text: "Dosen dan admin memonitor aktivitas pembelajaran, approval, serta perkembangan sistem.",
  },
];

const faqItems = [
  {
    q: "Apa fungsi utama website ini?",
    a: "Website ini dipakai sebagai platform e-learning untuk mengelola materi, quiz, penugasan, progres belajar, dan manajemen pengguna berdasarkan role.",
  },
  {
    q: "Apa bedanya mahasiswa, dosen, dan admin?",
    a: "Mahasiswa fokus belajar, dosen fokus mengelola pembelajaran, sedangkan admin fokus memantau sistem dan menjaga kualitas data.",
  },
  {
    q: "Demo AI di landing page dipakai untuk apa?",
    a: "Demo AI membantu pengunjung memahami isi website, fitur produk, dan alur penggunaan tanpa harus masuk ke dashboard terlebih dahulu.",
  },
];

const spotlightCardClass =
  "spotlight-card rounded-[28px] border border-white/70 bg-white/70 p-5 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.25)] backdrop-blur-xl";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [demoInput, setDemoInput] = useState("");
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoMessages, setDemoMessages] = useState<LandingMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Halo, saya AI demo untuk landing page. Tanya apa saja tentang fitur website, role pengguna, atau alur belajar di platform ini.",
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroRotations.length);
    }, 4200);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [demoMessages, demoLoading]);

  const hero = heroRotations[heroIndex];

  const quickPrompts = useMemo(
    () => [
      "Apa fungsi website ini?",
      "Apa bedanya role mahasiswa, dosen, dan admin?",
      "Bagaimana alur belajar di platform ini?",
    ],
    []
  );

  async function sendDemoMessage(messageText?: string) {
    const content = (messageText ?? demoInput).trim();
    if (!content || demoLoading) return;

    const nextMessages: LandingMessage[] = [
      ...demoMessages,
      { id: `${Date.now()}-user`, role: "user", content },
    ];

    setDemoMessages(nextMessages);
    setDemoInput("");
    setDemoLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: nextMessages,
          role: "GUEST",
          currentPath: "/",
          userName: "Pengunjung Landing Page",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Demo AI belum bisa merespons.");
      }

      setDemoMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          content: formatChatReply(data.reply || "Saya belum bisa menjawab sekarang."),
        },
      ]);
    } catch (error) {
      setDemoMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-fallback`,
          role: "assistant",
          content: formatChatReply(
            error instanceof Error
              ? `Maaf, demo AI sedang mengalami gangguan. ${error.message}`
              : "Maaf, demo AI sedang mengalami gangguan."
          ),
        },
      ]);
    } finally {
      setDemoLoading(false);
    }
  }

  function handleDemoSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendDemoMessage();
  }

  function handleCloseDemo() {
    setIsDemoOpen(false);
  }

  function handleSpotlightMove(event: MouseEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    event.currentTarget.style.setProperty("--spotlight-x", `${x}px`);
    event.currentTarget.style.setProperty("--spotlight-y", `${y}px`);
  }

  function handleSpotlightLeave(event: MouseEvent<HTMLElement>) {
    event.currentTarget.style.removeProperty("--spotlight-x");
    event.currentTarget.style.removeProperty("--spotlight-y");
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7fbff] text-slate-800 selection:bg-blue-100">
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute left-[-8%] top-[-6%] h-[420px] w-[420px] rounded-full bg-blue-200/35 blur-[110px]" />
        <div className="absolute bottom-[-10%] right-[-6%] h-[420px] w-[420px] rounded-full bg-cyan-200/30 blur-[120px]" />
        <div className="landing-grid absolute inset-x-0 top-20 h-[520px] opacity-50" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.68),rgba(255,255,255,0.86))]" />
      </div>

      <nav
        className={`fixed top-0 z-[100] w-full px-6 py-5 transition-all duration-500 md:px-16 ${
          scrolled || isMenuOpen
            ? "border-b border-white/60 bg-white/75 shadow-[0_8px_32px_rgba(15,23,42,0.06)] backdrop-blur-2xl"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="#utama" className="text-2xl font-black tracking-tight text-blue-600">
            Personalized<span className="font-light text-slate-400">AI</span>
          </Link>

          <div className="hidden items-center gap-10 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 md:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="transition-colors hover:text-blue-600">
                {item.label}
              </Link>
            ))}
            <Link href="/login" className="transition-colors hover:text-blue-600">
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-2xl bg-slate-900 px-7 py-3 text-white shadow-xl transition-all hover:-translate-y-1 hover:bg-blue-600"
            >
              Mulai
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-50 bg-white shadow-lg md:hidden"
          >
            {isMenuOpen ? <X size={20} className="text-blue-600" /> : <Menu size={20} className="text-blue-600" />}
          </button>
        </div>

        <div
          className={`absolute left-6 right-6 top-[88px] rounded-[32px] border border-white bg-white/95 p-8 shadow-2xl backdrop-blur-3xl transition-all duration-500 md:hidden ${
            isMenuOpen ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-8 opacity-0"
          }`}
        >
          <div className="flex flex-col gap-5 text-center text-xs font-black uppercase tracking-widest text-slate-600">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)}>
                {item.label}
              </Link>
            ))}
            <Link href="/login" onClick={() => setIsMenuOpen(false)} className="text-blue-600">
              Login
            </Link>
            <Link
              href="/register"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-2xl bg-blue-600 py-4 text-white"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <section id="utama" className="mx-auto grid max-w-7xl gap-10 px-6 pb-16 pt-36 md:grid-cols-[1.08fr_0.92fr] md:px-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-4 py-2 text-[11px] font-black uppercase tracking-[0.28em] text-blue-700 shadow-sm">
              <Sparkles size={14} />
              <span>{hero.badge}</span>
            </div>

            <h1 className="mt-6 text-4xl font-black leading-[1.04] tracking-tight text-slate-900 md:text-6xl">
              {hero.title}
            </h1>

            <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-slate-600 md:text-lg">
              {hero.text}
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-7 py-4 text-sm font-black uppercase tracking-[0.18em] text-white shadow-[0_24px_45px_-18px_rgba(37,99,235,0.55)] transition-all hover:-translate-y-1 hover:bg-blue-700"
              >
                Mulai Sekarang
                <ArrowRight size={16} />
              </Link>
              <Link
                href="#faq"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-7 py-4 text-sm font-black uppercase tracking-[0.18em] text-slate-700 transition-all hover:-translate-y-1 hover:border-blue-200 hover:text-blue-700"
              >
                Coba Demo AI
                <ChevronRight size={16} />
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
              {stats.map((item) => (
                <div
                  key={item.label}
                  onMouseMove={handleSpotlightMove}
                  onMouseLeave={handleSpotlightLeave}
                  className={spotlightCardClass}
                >
                  <p className="text-2xl font-black text-blue-600">{item.value}</p>
                  <p className="mt-2 text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                    {item.label}
                  </p>
                  <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">{item.hint}</p>
                </div>
              ))}
            </div>
          </div>

          <div
            onMouseMove={handleSpotlightMove}
            onMouseLeave={handleSpotlightLeave}
            className="spotlight-card relative overflow-hidden rounded-[36px] border border-white/70 bg-white/80 p-8 shadow-[0_40px_120px_-36px_rgba(15,23,42,0.18)] backdrop-blur-2xl"
          >
            <div className="pointer-events-none absolute inset-x-10 top-0 h-24 rounded-full bg-gradient-to-r from-blue-200/30 via-cyan-100/40 to-transparent blur-3xl" />
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
                <Bot size={24} />
              </div>
              <div>
                <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-blue-600">
                  <MessageSquareText size={14} />
                  Demo AI Assistant
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-900">Chat dibuka dari ikon robot</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                  Klik ikon robot mengambang di kanan bawah untuk mulai bertanya tentang fitur, role, dan alur sistem di platform ini.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => {
                    setIsDemoOpen(true);
                    sendDemoMessage(prompt);
                  }}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section id="fitur" className="mx-auto max-w-7xl px-6 py-8 md:px-16">
          <div className="mb-8 max-w-2xl">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-blue-600">Fitur Utama</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
              Fitur utama platform dirancang untuk belajar, mengajar, dan memantau progres dalam satu alur.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">
              Pengunjung bisa langsung memahami nilai produk lewat rangkaian fitur inti, alur pembelajaran, dan demo AI yang menjelaskan sistem secara cepat.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  onMouseMove={handleSpotlightMove}
                  onMouseLeave={handleSpotlightLeave}
                  className="spotlight-card rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_50px_-30px_rgba(15,23,42,0.28)] backdrop-blur-xl"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-5 text-lg font-black text-slate-900">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{feature.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section id="materi" className="mx-auto max-w-7xl px-6 py-16 md:px-16">
          <div className="grid gap-8 md:grid-cols-[0.95fr_1.05fr] md:items-start">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-blue-600">Materi dan Alur</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
                Pengunjung langsung paham bagaimana platform ini dipakai dari awal belajar sampai evaluasi.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">
                Section ini menjelaskan alur nyata penggunaan platform: mulai dari login, membuka materi, mengerjakan quiz, sampai memantau hasil belajar.
              </p>

              <div className="mt-8 rounded-[32px] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_32px_80px_-36px_rgba(15,23,42,0.6)]">
                <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.26em] text-blue-200">
                  <GraduationCap size={14} />
                  Jalur Belajar
                </p>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  Materi tersusun dalam bentuk course dan module. Setelah mempelajari konten, pengguna bisa lanjut ke quiz atau penugasan untuk mengukur pemahaman secara lebih terstruktur.
                </p>
                <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                  <MiniPanel title="Course" subtitle="Topik utama" />
                  <MiniPanel title="Module" subtitle="Unit belajar" />
                  <MiniPanel title="Quiz" subtitle="Evaluasi" />
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {learningFlow.map((item) => (
                <div
                  key={item.step}
                  onMouseMove={handleSpotlightMove}
                  onMouseLeave={handleSpotlightLeave}
                  className="spotlight-card flex gap-5 rounded-[30px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_50px_-32px_rgba(15,23,42,0.28)] backdrop-blur-xl"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-sm font-black text-blue-700">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <AboutSection variant="landing" audience="public" />

        <section id="faq" className="mx-auto max-w-7xl px-6 py-16 md:px-16">
          <div className="mb-8 max-w-2xl">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-blue-600">FAQ</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
              Jawaban cepat untuk pertanyaan yang paling sering muncul.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {faqItems.map((item) => (
              <div
                key={item.q}
                onMouseMove={handleSpotlightMove}
                onMouseLeave={handleSpotlightLeave}
                className="spotlight-card rounded-[30px] border border-white/70 bg-white/85 p-6 shadow-[0_22px_50px_-30px_rgba(15,23,42,0.25)] backdrop-blur-xl"
              >
                <h3 className="text-lg font-black text-slate-900">{item.q}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.a}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-[34px] border border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-700 px-8 py-8 text-white shadow-[0_40px_100px_-40px_rgba(15,23,42,0.65)]">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-blue-200">Call To Action</p>
                <h3 className="mt-3 text-3xl font-black tracking-tight">Masuk ke platform atau buat akun baru sekarang.</h3>
                <p className="mt-3 text-sm leading-7 text-blue-100">
                  Setelah landing page ini, pengguna bisa langsung lanjut ke proses login atau register tanpa kehilangan konteks produk.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-white/20"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-slate-900 transition hover:-translate-y-0.5"
                >
                  Register
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="px-6 py-12 text-center text-[10px] font-black uppercase tracking-[0.35em] text-slate-400 md:px-16">
        Copyright 2026 Personalized AI - Mochamad Alifi Arzahta - Universitas Pancasakti Tegal
      </footer>

      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[90] px-6 md:px-16">
        <div className="mx-auto flex max-w-7xl justify-end">
          <button
            type="button"
            onClick={() => setIsDemoOpen((prev) => !prev)}
            aria-label={isDemoOpen ? "Tutup chatbot" : "Buka chatbot"}
            className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-2xl shadow-blue-500/30 transition-transform hover:scale-105"
          >
            {isDemoOpen ? <X size={22} /> : <Bot size={22} />}
          </button>
        </div>
      </div>

      {isDemoOpen ? (
        <>
          <button
            type="button"
            aria-label="Tutup chatbot overlay"
            onClick={handleCloseDemo}
            className="fixed inset-0 z-[84] bg-slate-950/25 backdrop-blur-[2px] md:hidden"
          />

          <div className="pointer-events-none fixed inset-x-0 top-[88px] z-[85] px-6 md:top-[96px] md:px-16">
            <div className="mx-auto flex max-w-7xl justify-end">
              <div className="chatbot-panel-3d pointer-events-auto flex h-[min(78vh,44rem)] w-full max-w-[26rem] flex-col overflow-hidden rounded-[1.75rem] border border-slate-200/90 bg-white/96 shadow-[0_32px_90px_-38px_rgba(15,23,42,0.55)] md:h-[min(75vh,46rem)] md:w-[clamp(23rem,34vw,31rem)] md:max-w-none md:rounded-[2rem]">
                <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-blue-700 px-4 py-4 text-white md:px-5">
                  <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10 blur-2xl"></div>
                  <div className="absolute bottom-0 left-0 h-16 w-full bg-gradient-to-t from-black/15 to-transparent"></div>
                  <div className="relative z-10 flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="relative mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-lg shadow-black/20 backdrop-blur-md">
                        <Bot size={22} className="text-white" />
                        <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-slate-900 bg-emerald-400"></span>
                      </div>
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-blue-200 md:text-xs">
                          <MessageSquareText size={14} />
                          Personalized AI
                        </p>
                        <h3 className="mt-1 text-base font-black md:text-lg">Assistant Chat Bot</h3>
                        <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-100">
                          <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                          Online
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleCloseDemo}
                      aria-label="Tutup chatbot"
                      className="relative z-20 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white transition-colors hover:bg-white/20"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.08),_transparent_35%),linear-gradient(to_bottom,_#f8fbff,_#eef4ff)] px-3 py-4 md:px-4">
              <div className="space-y-4">
                {demoMessages.map((message) => {
                  const isUser = message.role === "user";

                  return (
                    <div
                      key={message.id}
                      className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      {!isUser ? (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md">
                          <Bot size={16} />
                        </div>
                      ) : null}

                      <div className={`max-w-[88%] md:max-w-[82%] ${isUser ? "order-1" : ""}`}>
                        <div
                          className={`whitespace-pre-line rounded-[1.6rem] px-4 py-3 text-[13px] leading-relaxed shadow-sm md:text-sm ${
                            isUser
                              ? "rounded-br-md bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-blue-200/60"
                              : "rounded-bl-md border border-slate-200 bg-white/95 text-slate-700"
                          }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {demoLoading ? (
                  <div className="flex items-end gap-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md">
                      <Bot size={16} />
                    </div>
                    <div className="max-w-[88%] md:max-w-[82%]">
                      <div className="flex items-center gap-2 rounded-[1.6rem] rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-[13px] text-slate-500 shadow-sm md:text-sm">
                        <Loader2 size={16} className="animate-spin" />
                        AI sedang menyiapkan jawaban...
                      </div>
                    </div>
                  </div>
                ) : null}

                <div ref={messagesEndRef} />
              </div>
            </div>

                <form onSubmit={handleDemoSubmit} className="border-t border-slate-100 bg-white/95 p-3 md:p-4">
              <div className="flex items-end gap-2 md:gap-3">
                <textarea
                  value={demoInput}
                  onChange={(event) => setDemoInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      sendDemoMessage();
                    }
                  }}
                  rows={3}
                  placeholder="Tanyakan sesuatu tentang website ini..."
                  className="min-h-[68px] flex-1 resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={demoLoading || !demoInput.trim()}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <ArrowRight size={18} />
                </button>
              </div>
              <p className="mt-2 text-[10px] font-medium text-slate-400">
                Enter untuk kirim, Shift + Enter untuk baris baru.
              </p>
                </form>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function MiniPanel({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white">{title}</p>
      <p className="mt-2 text-[11px] font-semibold text-blue-100">{subtitle}</p>
    </div>
  );
}

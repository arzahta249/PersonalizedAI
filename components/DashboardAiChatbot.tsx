"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Bot, Loader2, MessageSquareText, SendHorizonal, Sparkles, User2, X } from "lucide-react";
import { formatChatReply } from "@/lib/chat-format";

type ChatRole = "user" | "assistant";

type Message = {
  id: string;
  role: ChatRole;
  content: string;
};

type DashboardAiChatbotProps = {
  role: "ADMIN" | "DOSEN" | "MAHASISWA";
};

const starterPrompts: Record<DashboardAiChatbotProps["role"], string[]> = {
  ADMIN: [
    "Jelaskan fungsi dashboard admin ini",
    "Apa bedanya menu users, materi, quiz approval, dan penugasan?",
    "Bagaimana admin memantau aktivitas sistem?",
  ],
  DOSEN: [
    "Jelaskan halaman dosen ini",
    "Apa alur membuat kursus, materi, quiz, dan penugasan?",
    "Fitur apa saja yang bisa dipakai dosen di website ini?",
  ],
  MAHASISWA: [
    "Jelaskan website ini untuk mahasiswa",
    "Bagaimana cara belajar dari menu materi sampai quiz?",
    "Apa fungsi halaman yang sedang saya buka?",
  ],
};

export default function DashboardAiChatbot({ role }: DashboardAiChatbotProps) {
  const pathname = usePathname();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Saya siap bantu menjelaskan website ini, menu yang sedang Anda buka, dan fitur sesuai role Anda.",
    },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading, isOpen]);

  async function sendMessage(messageText?: string) {
    const content = (messageText ?? input).trim();
    if (!content || loading) return;

    const nextMessages: Message[] = [
      ...messages,
      { id: `${Date.now()}-user`, role: "user", content },
    ];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const displayName =
        typeof window === "undefined" ? "Pengguna" : localStorage.getItem("name") || "Pengguna";

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: nextMessages,
          role,
          currentPath: pathname,
          userName: displayName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Chatbot gagal merespons.");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          content: formatChatReply(data.reply || "Saya belum bisa menjawab sekarang."),
        },
      ]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Terjadi kesalahan saat menghubungi chatbot.";
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          role: "assistant",
          content: formatChatReply(`Maaf, saya belum bisa menjawab sekarang. ${message}`),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-4 right-4 z-[80] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-2xl shadow-blue-500/30 transition-transform hover:scale-105 md:bottom-5 md:right-5"
      >
        {isOpen ? <X size={22} /> : <MessageSquareText size={22} />}
      </button>

      {isOpen ? (
        <>
          <button
            type="button"
            aria-label="Tutup chatbot overlay"
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[69] bg-slate-950/35 backdrop-blur-[2px] md:hidden"
          />

          <div className="fixed bottom-20 right-4 z-[80] flex h-[88vh] w-[min(78vw,22rem)] flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-2xl md:bottom-20 md:right-5 md:h-[80vh] md:w-[min(400px,calc(100vw-2.5rem))] md:rounded-[2rem] lg:h-[84vh] lg:w-[380px]">
            <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-blue-700 px-4 py-4 text-white md:px-5">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10 blur-2xl"></div>
              <div className="absolute bottom-0 left-0 h-16 w-full bg-gradient-to-t from-black/15 to-transparent"></div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="relative mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-lg shadow-black/20 backdrop-blur-md">
                    <Bot size={22} className="text-white" />
                    <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-slate-900 bg-emerald-400"></span>
                  </div>
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-blue-200 md:text-xs">
                      <Sparkles size={14} />
                      Personalized AI
                    </p>
                    <h3 className="mt-1 text-base font-black md:text-lg">Assistant Chat Bot</h3>
                    <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-100">
                      <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                      Active Assistant
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white transition-colors hover:bg-white/20"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="border-b border-slate-100 px-3 py-3 md:px-4">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {starterPrompts[role].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-left text-[11px] font-semibold text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 md:text-xs"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.08),_transparent_35%),linear-gradient(to_bottom,_#f8fafc,_#eef2ff)] px-3 py-4 md:px-4">
              <div className="space-y-4">
                {messages.map((message) => {
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
                        <p
                          className={`mb-1 text-[10px] font-black uppercase tracking-[0.22em] ${
                            isUser ? "text-right text-blue-700" : "text-slate-400"
                          }`}
                        >
                          {isUser ? "Anda" : "AI Assistant"}
                        </p>
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

                      {isUser ? (
                        <div className="order-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 shadow-sm">
                          <User2 size={16} />
                        </div>
                      ) : null}
                    </div>
                  );
                })}

                {loading ? (
                  <div className="flex items-end gap-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md">
                      <Bot size={16} />
                    </div>
                    <div className="max-w-[88%] md:max-w-[82%]">
                      <p className="mb-1 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                        AI Assistant
                      </p>
                      <div className="flex items-center gap-2 rounded-[1.6rem] rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-[13px] text-slate-500 shadow-sm md:text-sm">
                        <Loader2 size={16} className="animate-spin" />
                        Sedang menyiapkan jawaban...
                      </div>
                    </div>
                  </div>
                ) : null}

                <div ref={messagesEndRef} />
              </div>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage();
              }}
              className="border-t border-slate-100 bg-white p-3 md:p-4"
            >
              <div className="flex items-end gap-2 md:gap-3">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Tanyakan tentang website ini..."
                  rows={3}
                  className="min-h-[68px] flex-1 resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition-colors focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <SendHorizonal size={18} />
                </button>
              </div>
              <p className="mt-2 text-[10px] font-medium text-slate-400">
                `Enter` untuk kirim, `Shift + Enter` untuk baris baru.
              </p>
            </form>
          </div>
        </>
      ) : null}
    </>
  );
}

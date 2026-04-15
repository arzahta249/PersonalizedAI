"use client";

import { createContext, ReactNode, useContext, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Sparkles, X } from "lucide-react";

type DialogVariant = "info" | "danger" | "success";
type DialogMode = "alert" | "confirm";

type DialogOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: DialogVariant;
};

type DialogState = DialogOptions & {
  mode: DialogMode;
};

type DialogContextValue = {
  alert: (options: string | DialogOptions) => Promise<void>;
  confirm: (options: string | DialogOptions) => Promise<boolean>;
};

const AppDialogContext = createContext<DialogContextValue | null>(null);

export function useAppDialog() {
  const context = useContext(AppDialogContext);

  if (!context) {
    throw new Error("useAppDialog must be used within AppDialogProvider");
  }

  return context;
}

export default function AppDialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const closeDialog = (result: boolean) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setDialog(null);
  };

  const openDialog = (mode: DialogMode, options: string | DialogOptions) =>
    new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setDialog({
        mode,
        message: typeof options === "string" ? options : options.message,
        title: typeof options === "string" ? undefined : options.title,
        confirmLabel: typeof options === "string" ? undefined : options.confirmLabel,
        cancelLabel: typeof options === "string" ? undefined : options.cancelLabel,
        variant: typeof options === "string" ? undefined : options.variant,
      });
    });

  const value = useMemo<DialogContextValue>(
    () => ({
      alert: async (options) => {
        await openDialog("alert", options);
      },
      confirm: (options) => openDialog("confirm", options),
    }),
    []
  );

  const variant = dialog?.variant ?? (dialog?.mode === "confirm" ? "danger" : "info");
  const Icon = variant === "danger" ? AlertTriangle : variant === "success" ? CheckCircle2 : Sparkles;
  const accentClass =
    variant === "danger"
      ? "from-rose-500 to-red-500 shadow-rose-500/30"
      : variant === "success"
        ? "from-emerald-500 to-teal-500 shadow-emerald-500/30"
        : "from-blue-500 to-indigo-600 shadow-blue-500/30";

  return (
    <AppDialogContext.Provider value={value}>
      {children}

      {dialog && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-md"
            onClick={() => closeDialog(false)}
          />

          <div className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-white/60 bg-white/95 p-7 shadow-[0_45px_120px_-30px_rgba(15,23,42,0.45)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_70%)]" />

            <button
              type="button"
              onClick={() => closeDialog(false)}
              className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-400 transition hover:scale-105 hover:text-slate-700"
              aria-label="Tutup dialog"
            >
              <X size={18} />
            </button>

            <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-xl ${accentClass}`}>
              <Icon size={26} />
            </div>

            <div className="mt-5">
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">
                {dialog.mode === "confirm" ? "Konfirmasi" : "Informasi"}
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                {dialog.title ?? (dialog.mode === "confirm" ? "Lanjutkan aksi ini?" : "Perhatian")}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{dialog.message}</p>
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              {dialog.mode === "confirm" && (
                <button
                  type="button"
                  onClick={() => closeDialog(false)}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300"
                >
                  {dialog.cancelLabel ?? "Batal"}
                </button>
              )}

              <button
                type="button"
                onClick={() => closeDialog(true)}
                className={`inline-flex items-center justify-center rounded-2xl bg-gradient-to-r px-5 py-3 text-sm font-black text-white shadow-xl transition hover:-translate-y-0.5 ${accentClass}`}
              >
                {dialog.confirmLabel ?? (dialog.mode === "confirm" ? "Ya, lanjutkan" : "Mengerti")}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppDialogContext.Provider>
  );
}

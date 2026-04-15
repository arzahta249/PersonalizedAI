"use client";

import { CheckCircle2, AlertTriangle, Sparkles, X } from "lucide-react";
import { Toaster, ToastBar, resolveValue, toast } from "react-hot-toast";

export default function AppToaster() {
  return (
    <Toaster
      position="top-right"
      gutter={14}
      containerStyle={{
        top: 20,
        right: 20,
      }}
      toastOptions={{
        duration: 3600,
        style: {
          background: "transparent",
          boxShadow: "none",
          padding: 0,
          maxWidth: "420px",
        },
      }}
    >
      {(t) => (
        <ToastBar toast={t}>
          {() => {
            const isSuccess = t.type === "success";
            const isError = t.type === "error";
            const message = resolveValue(t.message, t);

            return (
              <div
                className={`toast-shell ${t.visible ? "toast-enter" : "toast-leave"} ${
                  isSuccess ? "toast-success" : isError ? "toast-error" : "toast-default"
                }`}
              >
                <div className="toast-glow" />
                <div className="toast-icon-wrap">
                  {isSuccess ? (
                    <CheckCircle2 className="toast-icon" />
                  ) : isError ? (
                    <AlertTriangle className="toast-icon" />
                  ) : (
                    <Sparkles className="toast-icon" />
                  )}
                </div>

                <div className="toast-copy">
                  <p className="toast-title">
                    {isSuccess ? "Berhasil" : isError ? "Perlu Perhatian" : "Informasi"}
                  </p>
                  <div className="toast-message">{message}</div>
                </div>

                <button
                  type="button"
                  onClick={() => toast.dismiss(t.id)}
                  className="toast-close"
                  aria-label="Tutup notifikasi"
                >
                  <X size={14} />
                </button>
              </div>
            );
          }}
        </ToastBar>
      )}
    </Toaster>
  );
}

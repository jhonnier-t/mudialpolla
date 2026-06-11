"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

type ToastType = "success" | "error" | "info";
type ToastItem = { id: number; type: ToastType; message: string };

const ToastContext = createContext<{
  toast: (type: ToastType, message: string) => void;
} | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return ctx;
}

const STYLES: Record<ToastType, { box: string; icon: string }> = {
  success: { box: "bg-emerald-600 text-white", icon: "✓" },
  error: { box: "bg-red-600 text-white", icon: "✕" },
  info: { box: "bg-blue-600 text-white", icon: "ℹ" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback(
    (type: ToastType, message: string) => {
      const id = ++idRef.current;
      setToasts((t) => [...t.slice(-3), { id, type, message }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${STYLES[t.type].box}`}
            style={{ animation: "toast-in 0.25s ease-out" }}
          >
            <span aria-hidden className="mt-0.5 font-bold">
              {STYLES[t.type].icon}
            </span>
            <span className="flex-1">{t.message}</span>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="opacity-70 transition-opacity hover:opacity-100"
              aria-label="Cerrar notificación"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

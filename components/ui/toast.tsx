"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "success" | "error" | "warning";
  duration?: number;
}

interface ToastContextType {
  toasts: ToastProps[];
  addToast: (toast: Omit<ToastProps, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(
  undefined
);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const addToast = React.useCallback(
    (toast: Omit<ToastProps, "id">) => {
      const id = Math.random().toString(36).substring(7);
      const newToast = { ...toast, id };

      setToasts((prev) => [...prev, newToast]);

      // Auto remove after duration
      const duration = toast.duration || 3000;
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    },
    []
  );

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastViewport toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

function ToastViewport({
  toasts,
  removeToast,
}: {
  toasts: ToastProps[];
  removeToast: (id: string) => void;
}) {
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] flex flex-col gap-2 p-4 pt-safe pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function Toast({
  title,
  description,
  variant = "default",
  onClose,
}: ToastProps & { onClose: () => void }) {
  const variantStyles = {
    default: "bg-slate-900 text-white",
    success: "bg-emerald-600 text-white",
    error: "bg-red-600 text-white",
    warning: "bg-amber-600 text-white",
  };

  const icons = {
    default: "ℹ️",
    success: "✅",
    error: "❌",
    warning: "⚠️",
  };

  return (
    <div
      className={cn(
        "pointer-events-auto w-full max-w-md mx-auto",
        "rounded-xl shadow-lg p-4",
        "flex items-start gap-3",
        "animate-in slide-in-from-top-5 fade-in",
        variantStyles[variant]
      )}
    >
      <span className="text-xl flex-shrink-0">{icons[variant]}</span>
      <div className="flex-1 min-w-0">
        {title && (
          <p className="font-semibold text-sm leading-tight mb-1">{title}</p>
        )}
        {description && (
          <p className="text-sm opacity-90 leading-tight">{description}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 rounded-md p-1 hover:bg-white/20 active:bg-white/30 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}


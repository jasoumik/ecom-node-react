"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastStore {
  toasts: Toast[];
  addToast: (message: string, type?: "success" | "error" | "info") => void;
  removeToast: (id: string) => void;
}

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, type = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3000);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`min-w-[300px] p-4 rounded-xl shadow-lg border flex items-center justify-between animate-in slide-in-from-right-full duration-300 ${
            toast.type === "success"
              ? "bg-white border-green-100 text-green-800 dark:bg-slate-800 dark:border-green-900 dark:text-green-400"
              : toast.type === "error"
              ? "bg-white border-red-100 text-red-800 dark:bg-slate-800 dark:border-red-900 dark:text-red-400"
              : "bg-white border-sky-100 text-sky-800 dark:bg-slate-800 dark:border-sky-900 dark:text-sky-400"
          }`}
        >
          <div className="flex items-center gap-3">
            {toast.type === "success" && (
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 dark:bg-green-900/30">
                ✓
              </div>
            )}
            <span className="font-medium text-sm">{toast.message}</span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

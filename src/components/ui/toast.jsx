
"use client";

import { useEffect } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  LoaderCircle,
} from "lucide-react";

const TOAST_CONFIG = {
  success: {
    icon: CheckCircle2,
    title: "Success",
    iconColor: "text-emerald-600",
    iconBackground: "bg-emerald-50",
  },
  error: {
    icon: AlertCircle,
    title: "Something went wrong",
    iconColor: "text-red-600",
    iconBackground: "bg-red-50",
  },
  info: {
    icon: Info,
    title: "Information",
    iconColor: "text-blue-600",
    iconBackground: "bg-blue-50",
  },
  loading: {
    icon: LoaderCircle,
    title: "Please wait",
    iconColor: "text-slate-600",
    iconBackground: "bg-slate-100",
  },
};

export default function Toast({
  message,
  type = "success",
  onClose,
  duration = 3000,
}) {
  useEffect(() => {
    if (!message || type === "loading" || duration <= 0) return;

    const timer = setTimeout(() => {
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, type, duration, onClose]);

  if (!message) return null;

  const config = TOAST_CONFIG[type] || TOAST_CONFIG.success;
  const Icon = config.icon;

  return (
    <div
      className="fixed top-5 right-5 z-[9999] w-[calc(100%-2.5rem)] max-w-sm animate-in slide-in-from-bottom-3 fade-in duration-200"
      role={type === "error" ? "alert" : "status"}
      aria-live={type === "error" ? "assertive" : "polite"}
    >
      <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xl shadow-slate-900/10">
        <div
          className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${config.iconBackground}`}
        >
          <Icon
            size={19}
            className={`${config.iconColor} ${
              type === "loading" ? "animate-spin" : ""
            }`}
          />
        </div>

        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-sm font-semibold text-slate-900">
            {config.title}
          </p>

          <p className="mt-0.5 break-words text-sm leading-5 text-slate-600">
            {message}
          </p>
        </div>

        {type !== "loading" && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Dismiss notification"
            className="flex size-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

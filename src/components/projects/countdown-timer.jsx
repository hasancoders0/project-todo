
"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Clock3 } from "lucide-react";

function calculateRemaining(deadline) {
  const difference = new Date(deadline).getTime() - Date.now();

  if (Number.isNaN(difference)) return null;

  if (difference <= 0) {
    return {
      expired: true,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  const totalSeconds = Math.floor(difference / 1000);

  return {
    expired: false,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function TimeUnit({ value, label, variant }) {
  const dark = variant === "dark";

  return (
    <div
      className={`min-w-0 flex-1 rounded-xl border px-1.5 py-2.5 text-center ${
        dark
          ? "border-white/10 bg-white/[0.06]"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <p
        className={`text-xl font-semibold tabular-nums tracking-tight ${
          dark ? "text-white" : "text-slate-950"
        }`}
      >
        {String(value).padStart(2, "0")}
      </p>
      <p
        className={`mt-1 text-[9px] font-medium uppercase tracking-wider ${
          dark ? "text-slate-400" : "text-slate-500"
        }`}
      >
        {label}
      </p>
    </div>
  );
}

export default function CountdownTimer({ deadline, variant = "light" }) {
  const [remaining, setRemaining] = useState(null);
  const dark = variant === "dark";

  useEffect(() => {
    if (!deadline) {
      setRemaining(null);
      return;
    }

    const update = () => setRemaining(calculateRemaining(deadline));

    update();

    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  if (!deadline) {
    return (
      <p className={`text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}>
        No deadline has been set.
      </p>
    );
  }

  if (!remaining) {
    return (
      <div
        className={`animate-pulse rounded-xl p-4 text-sm ${
          dark ? "bg-white/5 text-slate-400" : "bg-slate-100 text-slate-500"
        }`}
      >
        Loading countdown…
      </div>
    );
  }

  if (remaining.expired) {
    return (
      <div
        className={`flex items-start gap-2 rounded-xl p-3 ${
          dark
            ? "border border-rose-400/20 bg-rose-400/10 text-rose-300"
            : "border border-rose-200 bg-rose-50 text-rose-700"
        }`}
      >
        <AlertCircle size={17} className="mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold">Deadline passed</p>
          <p
            className={`mt-1 text-xs ${
              dark ? "text-slate-400" : "text-rose-600"
            }`}
          >
            Review any remaining work.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        className={`mb-3 flex items-center gap-2 text-xs font-medium ${
          dark ? "text-emerald-300" : "text-emerald-700"
        }`}
      >
        <Clock3 size={14} />
        Time remaining
      </div>

      <div className="flex gap-1.5 sm:gap-2">
        <TimeUnit value={remaining.days} label="Days" variant={variant} />
        <TimeUnit value={remaining.hours} label="Hours" variant={variant} />
        <TimeUnit value={remaining.minutes} label="Mins" variant={variant} />
        <TimeUnit value={remaining.seconds} label="Secs" variant={variant} />
      </div>
    </div>
  );
}

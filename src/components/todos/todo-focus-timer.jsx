
"use client";

import { useEffect, useState } from "react";
import {
  Clock3,
  Play,
  Pause,
  RotateCcw,
  Check,
  Pencil,
  X,
  Timer,
  Sparkles,
} from "lucide-react";

function formatTime(totalSeconds) {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function TodoFocusTimer({
  durationMinutes = 25,
  compact = false,
}) {
  const initialDuration = Math.min(
    240,
    Math.max(1, Number(durationMinutes) || 25),
  );

  const [duration, setDuration] = useState(initialDuration);
  const [durationInput, setDurationInput] = useState(
    String(initialDuration),
  );
  const [remainingSeconds, setRemainingSeconds] = useState(
    initialDuration * 60,
  );
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [editingDuration, setEditingDuration] = useState(false);

  useEffect(() => {
    if (!isRunning) return undefined;

    const intervalId = setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          setIsRunning(false);
          setIsFinished(true);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRunning]);

  // Keep the timer synchronized when a different Todo is opened
  // or its configured focus duration changes.
  useEffect(() => {
    const nextDuration = Math.min(
      240,
      Math.max(1, Number(durationMinutes) || 25),
    );

    setDuration(nextDuration);
    setDurationInput(String(nextDuration));
    setRemainingSeconds(nextDuration * 60);
    setIsRunning(false);
    setIsFinished(false);
    setEditingDuration(false);
  }, [durationMinutes]);

  function startTimer() {
    if (remainingSeconds <= 0) {
      setRemainingSeconds(duration * 60);
      setIsFinished(false);
    }

    setIsRunning(true);
  }

  function pauseTimer() {
    setIsRunning(false);
  }

  function resetTimer() {
    setIsRunning(false);
    setRemainingSeconds(duration * 60);
    setIsFinished(false);
    setEditingDuration(false);
  }

  function finishTimer() {
    setIsRunning(false);
    setRemainingSeconds(0);
    setIsFinished(true);
  }

  function openDurationEditor() {
    setDurationInput(String(duration));
    setEditingDuration(true);
  }

  function applyDuration(event) {
    event.preventDefault();

    const parsed = Number.parseInt(durationInput, 10);

    if (!Number.isFinite(parsed) || parsed < 1 || parsed > 240) {
      setDurationInput(String(duration));
      return;
    }

    setIsRunning(false);
    setDuration(parsed);
    setDurationInput(String(parsed));
    setRemainingSeconds(parsed * 60);
    setIsFinished(false);
    setEditingDuration(false);
  }

  const progress = Math.min(
    100,
    Math.max(
      0,
      ((duration * 60 - remainingSeconds) / (duration * 60)) * 100,
    ),
  );

  const circumference = 2 * Math.PI * 88;
  const strokeOffset = circumference * (1 - progress / 100);

  const ringColor = isFinished
    ? "text-emerald-500"
    : isRunning
      ? "text-sky-500"
      : "text-slate-900";

  return (
    <section
      className={`w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white ${
        compact ? "p-3" : "p-4 sm:p-5"
      }`}
    >
      {/* Timer heading */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <Timer size={18} />
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900">
              Focus timer
            </h3>
            <p className="mt-0.5 text-[11px] text-slate-500">
              One task. Full attention.
            </p>
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
            isFinished
              ? "bg-emerald-50 text-emerald-700"
              : isRunning
                ? "bg-sky-50 text-sky-700"
                : "bg-slate-100 text-slate-600"
          }`}
        >
          {isFinished ? "Finished" : isRunning ? "Focusing" : "Ready"}
        </span>
      </div>

      {/* Circular countdown */}
      <div className="flex flex-col items-center py-5">
        <div className="relative flex size-52 max-w-full items-center justify-center">
          <svg
            viewBox="0 0 200 200"
            className="absolute inset-0 size-full -rotate-90"
            aria-hidden="true"
          >
            <circle
              cx="100"
              cy="100"
              r="88"
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              className="text-slate-100"
            />

            <circle
              cx="100"
              cy="100"
              r="88"
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeOffset}
              className={`${ringColor} transition-[stroke-dashoffset,color] duration-500`}
            />
          </svg>

          <div className="relative flex flex-col items-center">
            <span className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              {isFinished ? (
                <Check size={12} />
              ) : (
                <Clock3 size={12} />
              )}
              {isFinished ? "Session complete" : "Time remaining"}
            </span>

            <p
              className="text-4xl font-semibold tabular-nums tracking-tight text-slate-950 sm:text-5xl"
              role="timer"
              aria-live="off"
            >
              {formatTime(remainingSeconds)}
            </p>

            <button
              type="button"
              onClick={openDurationEditor}
              aria-label="Edit focus duration"
              disabled={isRunning}
              className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Pencil size={11} />
              {duration} minute session
            </button>
          </div>
        </div>

        <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
          {isFinished ? (
            <>
              <Sparkles size={13} className="text-emerald-600" />
              Nice work. Your session has ended.
            </>
          ) : isRunning ? (
            "Stay with your current task."
          ) : (
            "Start whenever you're ready."
          )}
        </p>
      </div>

      {/* Duration editor */}
      {editingDuration && (
        <form
          onSubmit={applyDuration}
          className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3"
        >
          <label
            htmlFor="focus-duration-minutes"
            className="mb-2 block text-xs font-semibold text-slate-700"
          >
            Session duration
          </label>

          <div className="flex items-center gap-2">
            <input
              id="focus-duration-minutes"
              type="number"
              min="1"
              max="240"
              step="1"
              autoFocus
              required
              value={durationInput}
              onChange={(event) => setDurationInput(event.target.value)}
              className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />

            <span className="text-xs text-slate-500">minutes</span>

            <button
              type="submit"
              className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-slate-950 px-3 text-xs font-semibold text-white transition hover:bg-slate-800"
            >
              <Check size={14} />
              Apply
            </button>

            <button
              type="button"
              onClick={() => setEditingDuration(false)}
              aria-label="Cancel duration editing"
              className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100"
            >
              <X size={15} />
            </button>
          </div>

          <p className="mt-2 text-[11px] text-slate-500">
            Choose between 1 and 240 minutes.
          </p>
        </form>
      )}

      {/* Quick duration choices */}
      {!isRunning && !editingDuration && (
        <div className="mb-4">
          <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Quick duration
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            {[15, 25, 45, 60].map((minutes) => (
              <button
                key={minutes}
                type="button"
                onClick={() => {
                  setDuration(minutes);
                  setDurationInput(String(minutes));
                  setRemainingSeconds(minutes * 60);
                  setIsFinished(false);
                }}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  duration === minutes
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900"
                }`}
              >
                {minutes} min
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Timer controls */}
      <div className="grid grid-cols-[minmax(0,1fr)_44px_44px] gap-2">
        <button
          type="button"
          onClick={isRunning ? pauseTimer : startTimer}
          disabled={isFinished}
          className="inline-flex h-11 min-w-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isRunning ? <Pause size={16} /> : <Play size={16} />}
          {isRunning ? "Pause session" : "Start session"}
        </button>

        <button
          type="button"
          onClick={resetTimer}
          aria-label="Reset focus timer"
          title="Reset timer"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        >
          <RotateCcw size={16} />
        </button>

        <button
          type="button"
          onClick={finishTimer}
          disabled={isFinished}
          aria-label="Finish focus session"
          title="Finish session"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Check size={17} />
        </button>
      </div>

      <p className="mt-3 text-center text-[10px] leading-4 text-slate-400">
        {isFinished
          ? "Reset the timer to start another session."
          : "You can pause or reset your session at any time."}
      </p>
    </section>
  );
}

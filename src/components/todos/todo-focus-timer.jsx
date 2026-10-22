
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
    Math.max(1, Number(durationMinutes) || 25)
  );

  const [duration, setDuration] = useState(initialDuration);
  const [durationInput, setDurationInput] = useState(String(initialDuration));
  const [remainingSeconds, setRemainingSeconds] = useState(
    initialDuration * 60
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

  function startTimer() {
    if (remainingSeconds <= 0) {
      setRemainingSeconds(duration * 60);
      setIsFinished(false);
    }

    setIsRunning(true);
  }

  function resetTimer() {
    setIsRunning(false);
    setRemainingSeconds(duration * 60);
    setIsFinished(false);
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
      ((duration * 60 - remainingSeconds) / (duration * 60)) * 100
    )
  );

  return (
    <section
      className={`w-full min-w-0 rounded-xl border border-slate-200 bg-white ${
        compact ? "p-2.5" : "p-3"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <Clock3 size={15} className="shrink-0 text-slate-500" />
          <h3 className="truncate text-sm font-semibold text-slate-800">
            Focus timer
          </h3>
        </div>

        {isRunning && (
          <span className="shrink-0 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700">
            Running
          </span>
        )}

        {isFinished && (
          <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
            Finished
          </span>
        )}
      </div>

      {/* Countdown with pencil button */}
      <div className="mt-1.5 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <p
            className={`font-bold leading-none tracking-tight text-slate-950 ${
              compact ? "text-3xl" : "text-4xl"
            }`}
            role="timer"
            aria-live="off"
          >
            {formatTime(remainingSeconds)}
          </p>

          <button
            type="button"
            onClick={openDurationEditor}
            aria-label="Edit focus duration"
            title="Edit focus duration"
            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <Pencil size={13} />
          </button>
        </div>

        <span className="shrink-0 text-[11px] text-slate-500">
          {duration} min session
        </span>
      </div>

      {/* Inline duration editor appears only when requested */}
      {editingDuration && (
        <form
          onSubmit={applyDuration}
          className="mt-2 flex items-center gap-2 rounded-lg bg-slate-50 p-2"
        >
          <label
            htmlFor="focus-duration"
            className="shrink-0 text-[11px] font-medium text-slate-600"
          >
            Minutes
          </label>

          <input
            id="focus-duration"
            type="number"
            min="1"
            max="240"
            step="1"
            autoFocus
            value={durationInput}
            onChange={(event) => setDurationInput(event.target.value)}
            aria-label="Focus duration in minutes"
            className="h-8 min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-800 outline-none focus:border-slate-400"
          />

          <button
            type="submit"
            className="h-8 rounded-md bg-slate-950 px-3 text-xs font-medium text-white hover:bg-slate-800"
          >
            Apply
          </button>

          <button
            type="button"
            onClick={() => setEditingDuration(false)}
            aria-label="Cancel duration editing"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-100"
          >
            <X size={14} />
          </button>
        </form>
      )}

      {/* Progress bar */}
      <div
        className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-label="Focus timer progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${
            isFinished ? "bg-emerald-500" : "bg-slate-950"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Compact horizontal controls */}
      <div className="mt-2.5 grid grid-cols-[minmax(0,1fr)_38px_auto] gap-1.5">
        <button
          type="button"
          onClick={isRunning ? () => setIsRunning(false) : startTimer}
          className="inline-flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-lg bg-slate-950 px-2.5 text-xs font-semibold text-white transition hover:bg-slate-800"
        >
          {isRunning ? <Pause size={13} /> : <Play size={13} />}
          {isRunning ? "Pause" : "Start"}
        </button>

        <button
          type="button"
          onClick={resetTimer}
          aria-label="Reset focus timer"
          title="Reset timer"
          className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
        >
          <RotateCcw size={14} />
        </button>

        <button
          type="button"
          onClick={finishTimer}
          disabled={isFinished}
          className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Check size={13} />
          Finish
        </button>
      </div>
    </section>
  );
}

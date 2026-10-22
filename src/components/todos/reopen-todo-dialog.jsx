
"use client";

import { X } from "lucide-react";

export default function ReopenTodoDialog({
  todo,
  reason,
  setReason,
  error,
  setError,
  isPending,
  onClose,
  onSubmit,
}) {
  if (!todo) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isPending) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="reopen-title"
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="reopen-title"
              className="text-base font-semibold text-slate-950"
            >
              Reopen Todo
            </h2>
            <p className="mt-1 text-sm leading-5 text-slate-500">
              Explain why this completed Todo needs to be reopened.
            </p>
          </div>

          <button
            type="button"
            disabled={isPending}
            onClick={onClose}
            aria-label="Close reopen dialog"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-50"
          >
            <X size={17} />
          </button>
        </div>

        <div className="mt-3 rounded-lg bg-slate-50 p-3">
          <p className="text-sm font-medium text-slate-800">
            {todo.title}
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-4">
          <label
            htmlFor="reopen-reason"
            className="block text-sm font-medium text-slate-700"
          >
            Reason for reopening <span className="text-rose-600">*</span>
          </label>

          <textarea
            id="reopen-reason"
            value={reason}
            onChange={(event) => {
              setReason(event.target.value);
              setError("");
            }}
            required
            maxLength={1000}
            rows={3}
            placeholder="Explain what still needs to be done..."
            disabled={isPending}
            className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-3 py-2 text-sm leading-5 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-200 disabled:opacity-60"
          />

          <p className="mt-1 text-right text-xs text-slate-400">
            {reason.length}/1000
          </p>

          {error && (
            <p role="alert" className="mt-2 text-sm text-rose-600">
              {error}
            </p>
          )}

          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isPending || !reason.trim()}
              className="rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "Reopening..." : "Confirm Reopen"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

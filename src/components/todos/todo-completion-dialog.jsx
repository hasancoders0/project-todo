
"use client";

import { CheckCircle2, X } from "lucide-react";

export default function TodoCompletionDialog({
  todo,
  message,
  setMessage,
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
        aria-labelledby="completion-title"
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="completion-title"
              className="text-base font-semibold text-slate-950"
            >
              Complete Todo
            </h2>
            <p className="mt-1 text-sm leading-5 text-slate-500">
              Add a short message about the work completed.
            </p>
          </div>

          <button
            type="button"
            disabled={isPending}
            onClick={onClose}
            aria-label="Close completion dialog"
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
            htmlFor="completion-message"
            className="block text-sm font-medium text-slate-700"
          >
            Completion message
          </label>

          <textarea
            id="completion-message"
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
              setError("");
            }}
            required
            maxLength={1000}
            rows={3}
            placeholder="Describe what you completed..."
            disabled={isPending}
            className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-3 py-2 text-sm leading-5 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-200 disabled:opacity-60"
          />

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
              disabled={isPending || !message.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCircle2 size={14} />
              {isPending ? "Saving..." : "Complete Todo"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

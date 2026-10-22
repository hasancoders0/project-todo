
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { completeTodo } from "@/actions/todo-actions";
import { X, CheckCircle2, AlertCircle } from "lucide-react";

const initialState = { error: "", success: "" };

export default function TodoCompletionListener() {
  const [todoId, setTodoId] = useState("");
  const [state, formAction, pending] = useActionState(
    completeTodo,
    initialState
  );
  const router = useRouter();

  useEffect(() => {
    function openModal(event) {
      setTodoId(event.detail?.todoId || "");
    }

    window.addEventListener("todo:complete", openModal);
    return () => window.removeEventListener("todo:complete", openModal);
  }, []);

  useEffect(() => {
    if (state?.success) {
      setTodoId("");
      router.refresh();
    }
  }, [state?.success, router]);

  if (!todoId) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !pending) setTodoId("");
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="completion-modal-title"
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={20} />
            </div>

            <div>
              <h2
                id="completion-modal-title"
                className="text-base font-semibold text-slate-950"
              >
                Complete this Todo
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Add a short note about what you completed.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={pending}
            onClick={() => setTodoId("")}
            aria-label="Close completion modal"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <form action={formAction} className="mt-5 space-y-4">
          <input type="hidden" name="todoId" value={todoId} />

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">
              Completion message
            </span>
            <textarea
              name="completionMessage"
              required
              maxLength={1000}
              rows={4}
              placeholder="Describe what was completed..."
              className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
          </label>

          {state?.error && (
            <div
              role="alert"
              className="flex gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700"
            >
              <AlertCircle size={17} className="shrink-0" />
              {state.error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() => setTodoId("")}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {pending ? "Saving..." : "Confirm completion"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

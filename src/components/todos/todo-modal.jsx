"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ListTodo } from "lucide-react";
import TodoForm from "@/components/todos/todo-form";

export default function TodoModal({
  open,
  onClose,
  projects = [],
  users = [],
  isAdmin = false,
  defaultProjectId = "",
  initialTodo = null,
  onSaved,
  title,
  description,
}) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  const editing = Boolean(initialTodo?.id);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="todo-modal-title"
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <ListTodo size={20} />
            </div>

            <div className="min-w-0">
              <h2
                id="todo-modal-title"
                className="text-lg font-semibold tracking-tight text-slate-950"
              >
                {title || (editing ? "Edit Todo" : "New Todo")}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {description ||
                  (editing
                    ? "Update details, assignment, or focus duration."
                    : "Add a Todo and set its deadline and focus duration.")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={19} />
          </button>
        </header>

        <div className="overflow-y-auto px-5 py-5 sm:px-6">
          <TodoForm
            key={initialTodo?.id || defaultProjectId || "new-todo"}
            projects={projects}
            users={users}
            isAdmin={isAdmin}
            defaultProjectId={defaultProjectId}
            initialTodo={initialTodo}
            onClose={onClose}
            onSaved={onSaved}
          />
        </div>
      </section>
    </div>,
    document.body,
  );
}

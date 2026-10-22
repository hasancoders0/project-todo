
"use client";

import { CheckCircle2, Plus } from "lucide-react";

export default function ProjectTodoEmptyState({
  hasTodos,
  isActive,
  onCreateTodo,
}) {
  return (
    <section className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
        <CheckCircle2 size={20} />
      </div>

      <h2 className="mt-3 text-sm font-semibold text-slate-900">
        {hasTodos ? "No matching Todos" : "No Todos yet"}
      </h2>

      <p className="mx-auto mt-1.5 max-w-sm text-xs leading-5 text-slate-500">
        {hasTodos
          ? "Try another search term or update your filters."
          : "Create your first Todo to start tracking this project."}
      </p>

      {!hasTodos && isActive && (
        <button
          type="button"
          onClick={onCreateTodo}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Plus size={14} />
          Create first Todo
        </button>
      )}
    </section>
  );
}

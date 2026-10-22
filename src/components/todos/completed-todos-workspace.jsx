
"use client";

import { useMemo, useState, useTransition } from "react";
import { Search, CheckCircle2 } from "lucide-react";

import { updateTodoStatus } from "@/actions/todo-actions";
import TodoCard from "@/components/todos/todo-card";
import ReopenTodoDialog from "@/components/todos/reopen-todo-dialog";
import Toast from "@/components/ui/toast";

export default function CompletedTodosWorkspace({
  todos = [],
  currentUser,
  isAdmin = false,
}) {
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("RECENT");

  const [reopenTodo, setReopenTodo] = useState(null);
  const [reopenReason, setReopenReason] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [isPending, startTransition] = useTransition();

  const projects = useMemo(() => {
    const unique = new Map();

    todos.forEach((todo) => {
      if (todo.project?.id) {
        unique.set(todo.project.id, todo.project);
      }
    });

    return Array.from(unique.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [todos]);

  const filteredTodos = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = todos.filter((todo) => {
      const matchesSearch =
        !query ||
        [
          todo.title,
          todo.description,
          todo.project?.name,
          todo.assignee?.name,
          todo.completedBy?.name,
          todo.completionMessage,
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query));

      const matchesProject =
        projectFilter === "ALL" ||
        todo.projectId === projectFilter;

      return matchesSearch && matchesProject;
    });

    return result.sort((a, b) => {
      if (sortBy === "DEADLINE") {
        return (
          new Date(a.deadlineAt).getTime() -
          new Date(b.deadlineAt).getTime()
        );
      }

      if (sortBy === "TITLE") {
        return a.title.localeCompare(b.title);
      }

      return (
        new Date(b.completedAt || b.updatedAt).getTime() -
        new Date(a.completedAt || a.updatedAt).getTime()
      );
    });
  }, [todos, search, projectFilter, sortBy]);

  function showToast(message, type = "success") {
    setToast({ id: Date.now(), message, type });
  }

  function handleStatusChange(todo, nextStatus) {
    if (isPending || nextStatus !== "PENDING") return;

    setReopenTodo(todo);
    setReopenReason("");
    setError("");
  }

  function closeDialog() {
    if (isPending) return;

    setReopenTodo(null);
    setReopenReason("");
    setError("");
  }

  function handleReopenSubmit(event) {
    event.preventDefault();

    if (!reopenTodo || isPending) return;

    const reason = reopenReason.trim();

    if (!reason) {
      setError("Please enter a reason for reopening this task.");
      return;
    }

    if (reason.length > 1000) {
      setError("The reopening reason cannot exceed 1,000 characters.");
      return;
    }

    const formData = new FormData();
    formData.set("todoId", reopenTodo.id);
    formData.set("status", "PENDING");
    formData.set("reopenReason", reason);

    startTransition(async () => {
      try {
        await updateTodoStatus(formData);

        setReopenTodo(null);
        setReopenReason("");
        setError("");
        showToast("Task reopened successfully.");
      } catch (err) {
        setError(
          err?.message || "Unable to reopen this task. Please try again.",
        );
      }
    });
  }

  return (
    <div className="space-y-5">
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-slate-500">
            <CheckCircle2 size={17} />
            <span className="text-sm">Completed tasks</span>
          </div>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {todos.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Projects represented</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {projects.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Matching tasks</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {filteredTodos.length}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_220px_180px]">
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search completed tasks..."
              aria-label="Search completed tasks"
              className="min-h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            />
          </div>

          <select
            value={projectFilter}
            onChange={(event) => setProjectFilter(event.target.value)}
            aria-label="Filter by project"
            className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
          >
            <option value="ALL">All projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            aria-label="Sort completed tasks"
            className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
          >
            <option value="RECENT">Recently completed</option>
            <option value="DEADLINE">Deadline</option>
            <option value="TITLE">Title</option>
          </select>
        </div>
      </section>

      {filteredTodos.length > 0 ? (
        <section className="space-y-4">
          {filteredTodos.map((todo) => (
            <div key={todo.id} className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                <p className="text-xs font-medium text-slate-500">
                  Project: {todo.project?.name || "Unknown project"}
                </p>
                <p className="text-xs text-emerald-700">
                  Completed{" "}
                  {todo.completedAt
                    ? new Intl.DateTimeFormat("en", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }).format(new Date(todo.completedAt))
                    : "date unavailable"}
                </p>
              </div>

              <TodoCard
                todo={todo}
                currentUser={currentUser}
                isAdmin={isAdmin}
                disabled={isPending}
                onStatusChange={handleStatusChange}
              />
            </div>
          ))}
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={23} />
          </div>

          <h2 className="mt-4 text-base font-semibold text-slate-900">
            {todos.length
              ? "No matching completed tasks"
              : "No completed tasks yet"}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {todos.length
              ? "Try another search or choose a different project."
              : "When you complete a Todo, it will appear here with its completion note and history."}
          </p>

          {(search || projectFilter !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setProjectFilter("ALL");
              }}
              className="mt-4 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Clear filters
            </button>
          )}
        </section>
      )}

      <ReopenTodoDialog
        todo={reopenTodo}
        reason={reopenReason}
        setReason={setReopenReason}
        error={error}
        setError={setError}
        isPending={isPending}
        onClose={closeDialog}
        onSubmit={handleReopenSubmit}
      />

      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={toast.type === "error" ? 5000 : 3000}
        />
      )}
    </div>
  );
}

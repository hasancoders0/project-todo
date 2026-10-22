"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { updateTodoStatus, reopenTodo } from "@/actions/todo-actions";
import TodoModal from "@/components/todos/todo-modal";
import TodoFocusTimer from "@/components/todos/todo-focus-timer";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  Edit3,
  ListTodo,
  Plus,
  RotateCcw,
  UserRound,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";

const FILTERS = [
  { value: "ALL", label: "All Todos" },
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "COMPLETED", label: "Completed" },
];

const STATUS_LABELS = {
  PENDING: "Pending",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
};

const PRIORITY_STYLES = {
  LOW: "bg-slate-100 text-slate-600",
  MEDIUM: "bg-amber-50 text-amber-700",
  HIGH: "bg-rose-50 text-rose-700",
};

function formatDate(value) {
  if (!value) return "No deadline";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function StatusBadge({ status }) {
  const styles = {
    PENDING: "bg-slate-100 text-slate-700",
    IN_PROGRESS: "bg-blue-50 text-blue-700",
    COMPLETED: "bg-emerald-50 text-emerald-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[status] || styles.PENDING
      }`}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export default function ProjectTodoList({
  projectId,
  todos = [],
  projects = [],
  users = [],
  isAdmin = false,
}) {
  const router = useRouter();

  const [filter, setFilter] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  const counts = useMemo(
    () => ({
      ALL: todos.length,
      PENDING: todos.filter((todo) => todo.status === "PENDING").length,
      IN_PROGRESS: todos.filter((todo) => todo.status === "IN_PROGRESS").length,
      COMPLETED: todos.filter((todo) => todo.status === "COMPLETED").length,
    }),
    [todos],
  );

  const filteredTodos = useMemo(
    () =>
      filter === "ALL" ? todos : todos.filter((todo) => todo.status === filter),
    [todos, filter],
  );

  const completedCount = counts.COMPLETED;
  const progress =
    todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;

  function openCreateModal() {
    setEditingTodo(null);
    setModalOpen(true);
  }

  function openEditModal(todo) {
    setEditingTodo(todo);
    setModalOpen(true);
  }

  async function changeStatus(todo, nextStatus) {
    setError("");
    setBusyId(todo.id);

    try {
      const formData = new FormData();
      formData.set("todoId", todo.id);
      formData.set("status", nextStatus);

      await updateTodoStatus(formData);
      router.refresh();
    } catch (actionError) {
      setError(actionError.message || "Unable to update Todo status.");
    } finally {
      setBusyId("");
    }
  }

  async function reopen(todo) {
    setError("");
    setBusyId(todo.id);

    try {
      const formData = new FormData();
      formData.set("todoId", todo.id);

      await reopenTodo(formData);
      router.refresh();
    } catch (actionError) {
      setError(actionError.message || "Unable to reopen this Todo.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <section className="min-w-0 space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-base font-semibold text-slate-950">Your work</h2>
          <p className="mt-1 text-sm text-slate-500">
            {todos.length} {todos.length === 1 ? "Todo" : "Todos"}
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Plus size={16} />
          New Todo
        </button>
      </div>

      <div className="flex max-w-full gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1">
        {FILTERS.map((item) => {
          const active = filter === item.value;

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition ${
                active
                  ? "bg-slate-950 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {item.label}
              <span className={active ? "text-slate-300" : "text-slate-400"}>
                {counts[item.value]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-slate-500" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Project progress
              </h3>
              <p className="text-xs text-slate-500">
                {completedCount} of {todos.length} completed
              </p>
            </div>
          </div>

          <span className="text-lg font-bold tabular-nums text-slate-950">
            {progress}%
          </span>
        </div>

        <div
          className="h-1.5 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Todo completion progress"
        >
          <div
            className="h-full rounded-full bg-slate-950 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
          <span>{counts.PENDING} pending</span>
          <span>{counts.IN_PROGRESS} in progress</span>
          <span>{counts.COMPLETED} completed</span>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700"
        >
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {filteredTodos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
          <ListTodo size={26} className="mx-auto text-slate-400" />
          <h3 className="mt-3 text-sm font-semibold text-slate-900">
            {filter === "ALL" ? "No Todos yet" : "No Todos in this category"}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {filter === "ALL"
              ? "Create your first Todo to get started."
              : "Try another filter or update a Todo's status."}
          </p>

          {filter === "ALL" && (
            <button
              type="button"
              onClick={openCreateModal}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white"
            >
              <Plus size={15} />
              Create Todo
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTodos.map((todo) => {
            const isExpanded = Boolean(expanded[todo.id]);
            const isBusy = busyId === todo.id;
            const description = todo.description || "";
            const longDescription = description.length > 180;
            const overdue =
              todo.status !== "COMPLETED" &&
              new Date(todo.deadlineAt).getTime() < Date.now();

            return (
              <article
                key={todo.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300"
              >
                <div className="grid min-w-0 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px]">
                  <div className="min-w-0 p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {todo.status === "COMPLETED" ? (
                          <CheckCircle2
                            size={21}
                            className="text-emerald-600"
                          />
                        ) : todo.status === "IN_PROGRESS" ? (
                          <Clock3 size={21} className="text-blue-600" />
                        ) : (
                          <Circle size={21} className="text-slate-400" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                          <h3
                            className={`break-words text-sm font-semibold ${
                              todo.status === "COMPLETED"
                                ? "text-slate-400 line-through"
                                : "text-slate-950"
                            }`}
                          >
                            {todo.title}
                          </h3>

                          <div className="flex shrink-0 flex-wrap gap-1.5">
                            <StatusBadge status={todo.status} />
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                PRIORITY_STYLES[todo.priority] ||
                                PRIORITY_STYLES.MEDIUM
                              }`}
                            >
                              {todo.priority || "MEDIUM"}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3">
                          {description ? (
                            <p
                              className={`whitespace-pre-wrap break-words text-sm leading-6 text-slate-600 ${
                                isExpanded ? "" : "line-clamp-3"
                              }`}
                            >
                              {description}
                            </p>
                          ) : (
                            <p className="text-sm text-slate-400">
                              No description provided.
                            </p>
                          )}

                          {longDescription && (
                            <button
                              type="button"
                              onClick={() =>
                                setExpanded((current) => ({
                                  ...current,
                                  [todo.id]: !current[todo.id],
                                }))
                              }
                              className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-950"
                            >
                              {isExpanded ? "See less" : "See more"}
                              {isExpanded ? (
                                <ChevronUp size={14} />
                              ) : (
                                <ChevronDown size={14} />
                              )}
                            </button>
                          )}
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
                          <span
                            className={`inline-flex items-center gap-1.5 ${
                              overdue ? "font-semibold text-red-600" : ""
                            }`}
                          >
                            <CalendarDays size={14} />
                            {overdue ? "Overdue · " : "Due "}
                            {formatDate(todo.deadlineAt)}
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <UserRound size={14} />
                            {todo.assignee?.name ||
                              todo.assignee?.username ||
                              "Unassigned"}
                          </span>
                        </div>

                        {isExpanded && todo.status === "COMPLETED" && (
                          <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
                            <h4 className="text-xs font-semibold text-emerald-800">
                              Latest completion
                            </h4>

                            <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-700">
                              {todo.completionMessage ||
                                todo.completions?.[0]?.message ||
                                "No completion message recorded."}
                            </p>

                            {todo.completedAt && (
                              <p className="mt-2 text-xs text-slate-500">
                                Completed {formatDate(todo.completedAt)}
                                {todo.completedBy?.name
                                  ? ` by ${todo.completedBy.name}`
                                  : ""}
                              </p>
                            )}

                            {todo.completions?.length > 1 && (
                              <div className="mt-3 border-t border-emerald-100 pt-3">
                                <h5 className="text-xs font-semibold text-slate-700">
                                  Previous completion records
                                </h5>

                                <div className="mt-2 space-y-2">
                                  {todo.completions.slice(1).map((record) => (
                                    <div
                                      key={record.id}
                                      className="rounded-lg bg-white/80 p-2"
                                    >
                                      <p className="whitespace-pre-wrap text-sm text-slate-600">
                                        {record.message}
                                      </p>
                                      <p className="mt-1 text-xs text-slate-400">
                                        {formatDate(record.completedAt)}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          {todo.status === "PENDING" && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => changeStatus(todo, "IN_PROGRESS")}
                              className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                            >
                              <Clock3 size={14} />
                              {isBusy ? "Updating..." : "Start Todo"}
                            </button>
                          )}

                          {todo.status === "IN_PROGRESS" && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => {
                                window.dispatchEvent(
                                  new CustomEvent("todo:complete", {
                                    detail: { todoId: todo.id },
                                  }),
                                );
                              }}
                              className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                            >
                              <Check size={14} />
                              Mark completed
                            </button>
                          )}

                          {todo.status === "COMPLETED" && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => reopen(todo)}
                              className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                            >
                              <RotateCcw size={14} />
                              {isBusy ? "Reopening..." : "Reopen Todo"}
                            </button>
                          )}

                          {todo.status !== "COMPLETED" && (
                            <button
                              type="button"
                              onClick={() => openEditModal(todo)}
                              className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                              <Edit3 size={14} />
                              Edit
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <aside className="border-t border-slate-200 bg-slate-50/70 p-4 sm:p-5 xl:border-l xl:border-t-0">
                    <TodoFocusTimer />
                  </aside>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <TodoModal
        key={`${editingTodo?.id || "new"}-${modalOpen}`}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        projectId={projectId}
        todo={editingTodo}
        projects={projects}
        users={users}
        isAdmin={isAdmin}
      />
    </section>
  );
}

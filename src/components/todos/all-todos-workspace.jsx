"use client";

import { useMemo, useState, useTransition } from "react";
import { Search, ListTodo } from "lucide-react";

import { deleteTodo, updateTodoStatus } from "@/actions/todo-actions";
import TodoCard from "@/components/todos/todo-card";
import TodoFilterBar from "@/components/todos/todo-filter-bar";
import TodoModal from "@/components/todos/todo-modal";
import TodoCompletionDialog from "@/components/todos/todo-completion-dialog";
import ReopenTodoDialog from "@/components/todos/reopen-todo-dialog";
import Toast from "@/components/ui/toast";

export default function AllTodosWorkspace({
  todos = [],
  projects = [],
  users = [],
  currentUser,
  isAdmin = false,
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [projectFilter, setProjectFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("DEADLINE");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);

  const [completionTodo, setCompletionTodo] = useState(null);
  const [completionMessage, setCompletionMessage] = useState("");

  const [reopenTodo, setReopenTodo] = useState(null);
  const [reopenReason, setReopenReason] = useState("");

  const [toast, setToast] = useState(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const counts = useMemo(
    () => ({
      ALL: todos.length,
      PENDING: todos.filter((todo) => todo.status === "PENDING").length,
      IN_PROGRESS: todos.filter((todo) => todo.status === "IN_PROGRESS").length,
      COMPLETED: todos.filter((todo) => todo.status === "COMPLETED").length,
    }),
    [todos],
  );

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = counts.COMPLETED;

    return {
      total,
      completed,
      pending: counts.PENDING,
      inProgress: counts.IN_PROGRESS,
      progress: total ? Math.round((completed / total) * 100) : 0,
    };
  }, [todos, counts]);

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
          todo.assignee?.username,
          todo.creator?.name,
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "ALL" || todo.status === statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" || todo.priority === priorityFilter;

      const matchesProject =
        projectFilter === "ALL" || todo.projectId === projectFilter;

      return (
        matchesSearch && matchesStatus && matchesPriority && matchesProject
      );
    });

    return result.sort((a, b) => {
      if (sortBy === "PRIORITY") {
        const rank = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        return (rank[b.priority] || 0) - (rank[a.priority] || 0);
      }

      if (sortBy === "TITLE") {
        return a.title.localeCompare(b.title);
      }

      if (sortBy === "CREATED") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }

      if (a.status === "COMPLETED" && b.status !== "COMPLETED") {
        return 1;
      }

      if (a.status !== "COMPLETED" && b.status === "COMPLETED") {
        return -1;
      }

      return (
        new Date(a.deadlineAt).getTime() - new Date(b.deadlineAt).getTime()
      );
    });
  }, [todos, search, statusFilter, priorityFilter, projectFilter, sortBy]);

  const modalProjects = useMemo(
    () =>
      projects.map((project) => ({
        ...project,
        memberIds: (project.members || []).map(
          (member) => member.user?.id || member.userId,
        ),
      })),
    [projects],
  );

  const hasFilters =
    Boolean(search.trim()) ||
    statusFilter !== "ALL" ||
    priorityFilter !== "ALL" ||
    projectFilter !== "ALL" ||
    sortBy !== "DEADLINE";

  function showToast(message, type = "success") {
    setToast({ id: Date.now(), message, type });
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("ALL");
    setPriorityFilter("ALL");
    setProjectFilter("ALL");
    setSortBy("DEADLINE");
  }

  function openCreateModal() {
    setEditingTodo(null);
    setError("");
    setModalOpen(true);
  }

  function openEditModal(todo) {
    setEditingTodo(todo);
    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingTodo(null);
  }

  function handleStatusChange(todo, nextStatus) {
    if (!todo || isPending) return;

    setError("");

    if (nextStatus === "COMPLETED") {
      setReopenTodo(null);
      setReopenReason("");
      setCompletionTodo(todo);
      setCompletionMessage("");
      return;
    }

    if (todo.status === "COMPLETED" && nextStatus === "PENDING") {
      setCompletionTodo(null);
      setCompletionMessage("");
      setReopenTodo(todo);
      setReopenReason("");
      return;
    }

    submitStatusChange(todo, nextStatus);
  }

  function submitStatusChange(todo, status, message = "", reason = "") {
    if (!todo || isPending) return;

    const formData = new FormData();
    formData.set("todoId", todo.id);
    formData.set("status", status);

    if (status === "COMPLETED") {
      if (!message.trim()) {
        showToast("Please enter a completion message.", "error");
        return;
      }

      formData.set("completionMessage", message.trim());
    }

    if (todo.status === "COMPLETED" && status === "PENDING") {
      if (!reason.trim()) {
        setError("Please enter a reason for reopening this Todo.");
        return;
      }

      formData.set("reopenReason", reason.trim());
    }

    setError("");

    startTransition(async () => {
      try {
        await updateTodoStatus(formData);

        setCompletionTodo(null);
        setCompletionMessage("");
        setReopenTodo(null);
        setReopenReason("");

        showToast(
          status === "COMPLETED"
            ? "Todo completed successfully."
            : status === "IN_PROGRESS"
              ? "Todo started successfully."
              : "Todo reopened successfully.",
        );
      } catch (err) {
        showToast(err?.message || "Unable to update this Todo.", "error");
      }
    });
  }

  function handleCompletionSubmit(event) {
    event.preventDefault();

    if (!completionTodo || !completionMessage.trim()) {
      setError("Please enter a completion message.");
      return;
    }

    submitStatusChange(completionTodo, "COMPLETED", completionMessage.trim());
  }

  function handleReopenSubmit(event) {
    event.preventDefault();

    if (!reopenTodo || !reopenReason.trim()) {
      setError("Please enter a reason for reopening this Todo.");
      return;
    }

    if (reopenReason.trim().length > 1000) {
      setError("The reopening reason cannot exceed 1,000 characters.");
      return;
    }

    submitStatusChange(reopenTodo, "PENDING", "", reopenReason.trim());
  }

  function handleDeleteTodo(todo) {
    if (
      !window.confirm(
        `Are you sure you want to delete "${todo.title}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    const formData = new FormData();
    formData.set("todoId", todo.id);

    startTransition(async () => {
      try {
        await deleteTodo(formData);
        showToast("Todo deleted successfully.");
      } catch (err) {
        showToast(err?.message || "Unable to delete this Todo.", "error");
      }
    });
  }

  function closeDialogs() {
    if (isPending) return;

    setCompletionTodo(null);
    setCompletionMessage("");
    setReopenTodo(null);
    setReopenReason("");
    setError("");
  }

  return (
    <div className="min-w-0 space-y-6">
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Todos", value: stats.total },
          { label: "Pending", value: stats.pending },
          { label: "In progress", value: stats.inProgress },
          { label: "Completed", value: stats.completed },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-200 bg-white p-4"
          >
            <p className="text-2xl font-semibold tracking-tight text-slate-950">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TodoFilterBar
            value={statusFilter}
            onChange={setStatusFilter}
            counts={counts}
          />

          <button
            type="button"
            onClick={openCreateModal}
            disabled={!projects.some((project) => project.status === "ACTIVE")}
            className="min-h-10 shrink-0 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            + Create Todo
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative sm:col-span-2">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search Todos, projects, or assignees..."
              aria-label="Search Todos"
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
            aria-label="Filter by priority"
            className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
          >
            <option value="ALL">All priorities</option>
            <option value="HIGH">High priority</option>
            <option value="MEDIUM">Medium priority</option>
            <option value="LOW">Low priority</option>
          </select>

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
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <p className="text-sm text-slate-500">
            Showing {filteredTodos.length} of {todos.length} Todos
          </p>

          <div className="flex items-center gap-2">
            <label htmlFor="todo-sort" className="text-xs text-slate-500">
              Sort by
            </label>
            <select
              id="todo-sort"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="min-h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-slate-400"
            >
              <option value="DEADLINE">Deadline</option>
              <option value="PRIORITY">Priority</option>
              <option value="CREATED">Newest</option>
              <option value="TITLE">Title</option>
            </select>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-semibold text-slate-600 hover:text-slate-950"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {filteredTodos.length ? (
        <section className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-2">
          {filteredTodos.map((todo) => (
            <div key={todo.id} className="flex min-w-0 flex-col gap-2">
              <p className="px-1 text-xs font-medium text-slate-500">
                Project: {todo.project?.name || "Unknown project"}
              </p>

              <div className="min-w-0 flex-1">
                <TodoCard
                  todo={todo}
                  currentUser={currentUser}
                  isAdmin={isAdmin}
                  disabled={isPending}
                  onEdit={openEditModal}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDeleteTodo}
                />
              </div>
            </div>
          ))}
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <ListTodo size={22} />
          </div>

          <h2 className="mt-4 text-base font-semibold text-slate-900">
            {todos.length ? "No matching Todos" : "No Todos yet"}
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            {todos.length
              ? "Try changing your search or filters."
              : "Tasks from your accessible projects will appear here."}
          </p>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Clear filters
            </button>
          )}
        </section>
      )}

      <TodoModal
        open={modalOpen}
        onClose={closeModal}
        projects={modalProjects}
        users={users}
        isAdmin={isAdmin}
        initialTodo={editingTodo}
        currentUserId={currentUser?.id}
        title={editingTodo ? "Edit Todo" : "Create a Todo"}
        description={
          editingTodo
            ? "Update the Todo details and focus duration."
            : "Create a Todo with a deadline and focus duration."
        }
        onSaved={() => {
          const wasEditing = Boolean(editingTodo);
          closeModal();
          showToast(
            wasEditing
              ? "Todo updated successfully."
              : "Todo created successfully.",
          );
        }}
      />

      <TodoCompletionDialog
        todo={completionTodo}
        message={completionMessage}
        setMessage={setCompletionMessage}
        error={error}
        setError={setError}
        isPending={isPending}
        onClose={closeDialogs}
        onSubmit={handleCompletionSubmit}
      />

      <ReopenTodoDialog
        todo={reopenTodo}
        reason={reopenReason}
        setReason={setReopenReason}
        error={error}
        setError={setError}
        isPending={isPending}
        onClose={closeDialogs}
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

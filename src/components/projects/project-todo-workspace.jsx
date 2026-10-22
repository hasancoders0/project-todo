
"use client";

import { useMemo, useState, useTransition } from "react";

import { deleteTodo, updateTodoStatus } from "@/actions/todo-actions";
import TodoModal from "@/components/todos/todo-modal";
import TodoCard from "@/components/todos/todo-card";
import ProjectSidebar from "@/components/projects/project-sidebar";
import ProjectTodoToolbar from "@/components/projects/project-todo-toolbar";
import ProjectTodoEmptyState from "@/components/projects/project-todo-empty-state";
import TodoCompletionDialog from "@/components/todos/todo-completion-dialog";
import ReopenTodoDialog from "@/components/todos/reopen-todo-dialog";
import Toast from "@/components/ui/toast";

export default function ProjectTodoWorkspace({
  project,
  todos = [],
  currentUser,
  teamMembers = [],
  isAdmin = false,
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
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

  const isActive = project.status === "ACTIVE";

  function showToast(message, type = "success") {
    setToast({ id: Date.now(), message, type });
  }

  function closeToast() {
    setToast(null);
  }

  const projectMembers = useMemo(
    () =>
      (project.members || []).map((member) => ({
        ...member,
        user: member.user || member,
      })),
    [project.members],
  );

  const modalUsers = useMemo(() => {
    const users = new Map();

    teamMembers.forEach((user) => {
      if (user?.id) users.set(user.id, user);
    });

    projectMembers.forEach((member) => {
      if (member.user?.id) {
        users.set(member.user.id, member.user);
      }
    });

    if (currentUser?.id) {
      users.set(currentUser.id, currentUser);
    }

    return Array.from(users.values());
  }, [teamMembers, projectMembers, currentUser]);

  const modalProjects = useMemo(
    () => [
      {
        id: project.id,
        name: project.name,
        status: project.status,
        members: projectMembers,
        memberIds: projectMembers.map(
          (member) => member.user?.id || member.userId,
        ),
      },
    ],
    [project.id, project.name, project.status, projectMembers],
  );

  const stats = useMemo(() => {
    const total = todos.length;

    const completed = todos.filter(
      (todo) => todo.status === "COMPLETED",
    ).length;

    const inProgress = todos.filter(
      (todo) => todo.status === "IN_PROGRESS",
    ).length;

    const pending = todos.filter(
      (todo) => todo.status === "PENDING",
    ).length;

    return {
      total,
      completed,
      inProgress,
      pending,
      progress: total ? Math.round((completed / total) * 100) : 0,
    };
  }, [todos]);

  const filteredTodos = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = todos.filter((todo) => {
      const matchesSearch =
        !query ||
        (todo.title || "").toLowerCase().includes(query) ||
        (todo.description || "").toLowerCase().includes(query) ||
        (todo.assignee?.name || "").toLowerCase().includes(query) ||
        (todo.assignee?.username || "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" || todo.status === statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" || todo.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "PRIORITY") {
        const rank = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        return (rank[b.priority] || 0) - (rank[a.priority] || 0);
      }

      if (sortBy === "TITLE") {
        return (a.title || "").localeCompare(b.title || "");
      }

      if (sortBy === "CREATED") {
        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
      }

      if (a.status === "COMPLETED" && b.status !== "COMPLETED") {
        return 1;
      }

      if (a.status !== "COMPLETED" && b.status === "COMPLETED") {
        return -1;
      }

      const aDeadline = a.deadlineAt
        ? new Date(a.deadlineAt).getTime()
        : Number.MAX_SAFE_INTEGER;

      const bDeadline = b.deadlineAt
        ? new Date(b.deadlineAt).getTime()
        : Number.MAX_SAFE_INTEGER;

      return aDeadline - bDeadline;
    });
  }, [todos, search, statusFilter, priorityFilter, sortBy]);

  const hasFilters =
    search.trim() !== "" ||
    statusFilter !== "ALL" ||
    priorityFilter !== "ALL" ||
    sortBy !== "DEADLINE";

  function clearFilters() {
    setSearch("");
    setStatusFilter("ALL");
    setPriorityFilter("ALL");
    setSortBy("DEADLINE");
  }

  function openCreateModal() {
    if (!isActive) return;

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

  function closeCompletionDialog() {
    if (isPending) return;

    setCompletionTodo(null);
    setCompletionMessage("");
    setError("");
  }

  function closeReopenDialog() {
    if (isPending) return;

    setReopenTodo(null);
    setReopenReason("");
    setError("");
  }

  function handleStatusChange(todo, nextStatus) {
    if (!todo || isPending) return;

    if (nextStatus === "COMPLETED") {
      setReopenTodo(null);
      setReopenReason("");
      setCompletionTodo(todo);
      setCompletionMessage("");
      setError("");
      return;
    }

    if (todo.status === "COMPLETED" && nextStatus === "PENDING") {
      if (reopenTodo?.id === todo.id) return;

      setCompletionTodo(null);
      setCompletionMessage("");
      setReopenTodo(todo);
      setReopenReason("");
      setError("");
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
      const trimmedMessage = message.trim();

      if (!trimmedMessage) {
        showToast("Please enter a completion message.", "error");
        return;
      }

      formData.set("completionMessage", trimmedMessage);
    }

    if (todo.status === "COMPLETED" && status === "PENDING") {
      const trimmedReason = reason.trim();

      if (!trimmedReason) {
        setError("Please enter a reason for reopening this Todo.");
        return;
      }

      if (trimmedReason.length > 1000) {
        setError("The reopening reason cannot exceed 1,000 characters.");
        return;
      }

      formData.set("reopenReason", trimmedReason);
    }

    setError("");

    startTransition(async () => {
      try {
        const result = await updateTodoStatus(formData);

        if (result?.error || result?.success === false) {
          throw new Error(
            typeof result.error === "string"
              ? result.error
              : "Unable to update this Todo. Please try again.",
          );
        }

        setCompletionTodo(null);
        setCompletionMessage("");
        setReopenTodo(null);
        setReopenReason("");
        setError("");

        showToast(
          status === "COMPLETED"
            ? "Todo completed successfully."
            : status === "IN_PROGRESS"
              ? "Todo started successfully."
              : "Todo reopened successfully.",
        );
      } catch (err) {
        console.error("Todo status update failed:", err);

        showToast(
          err?.message || "Unable to update this Todo. Please try again.",
          "error",
        );
      }
    });
  }

  function handleCompletionSubmit(event) {
    event.preventDefault();

    if (!completionTodo || !completionMessage.trim()) {
      setError("Please enter a completion message.");
      return;
    }

    submitStatusChange(
      completionTodo,
      "COMPLETED",
      completionMessage.trim(),
    );
  }

  function handleReopenSubmit(event) {
    event.preventDefault();

    if (!reopenTodo || isPending) return;

    const reason = reopenReason.trim();

    if (!reason) {
      setError("Please enter a reason for reopening this Todo.");
      return;
    }

    if (reason.length > 1000) {
      setError("The reopening reason cannot exceed 1,000 characters.");
      return;
    }

    submitStatusChange(reopenTodo, "PENDING", "", reason);
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

    setError("");

    startTransition(async () => {
      try {
        const result = await deleteTodo(formData);

        if (result?.error || result?.success === false) {
          throw new Error(
            typeof result.error === "string"
              ? result.error
              : "Unable to delete this Todo. Please try again.",
          );
        }

        showToast("Todo deleted successfully.");
      } catch (err) {
        console.error("Todo deletion failed:", err);

        showToast(
          err?.message || "Unable to delete this Todo. Please try again.",
          "error",
        );
      }
    });
  }

  return (
    <div className="w-full min-w-0 pb-4">
      <div className="grid min-w-0 grid-cols-1 items-start gap-3 xl:grid-cols-[minmax(0,1fr)_330px]">
        <main className="min-w-0 space-y-3">
          <ProjectTodoToolbar
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            stats={stats}
            totalTodos={todos.length}
            filteredCount={filteredTodos.length}
            hasFilters={hasFilters}
            clearFilters={clearFilters}
            onCreateTodo={openCreateModal}
            isActive={isActive}
          />

          {!isActive && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              This project is {project.status.toLowerCase()}. Creating new
              Todos is disabled until the project is active.
            </div>
          )}

          {filteredTodos.length > 0 ? (
            <section className="min-w-0 space-y-2.5">
              {filteredTodos.map((todo) => (
                <TodoCard
                  key={todo.id}
                  todo={todo}
                  currentUser={currentUser}
                  isAdmin={isAdmin}
                  disabled={isPending}
                  onEdit={openEditModal}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDeleteTodo}
                />
              ))}
            </section>
          ) : (
            <ProjectTodoEmptyState
              hasTodos={todos.length > 0}
              isActive={isActive}
              onCreateTodo={openCreateModal}
            />
          )}
        </main>

        <aside className="min-w-0 space-y-3">
          <ProjectSidebar
            project={project}
            todos={todos}
            members={projectMembers}
            stats={stats}
            isAdmin={isAdmin}
          />
        </aside>
      </div>

      <TodoModal
        open={modalOpen}
        onClose={closeModal}
        projects={modalProjects}
        users={modalUsers}
        isAdmin={isAdmin}
        defaultProjectId={project.id}
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
        onClose={closeCompletionDialog}
        onSubmit={handleCompletionSubmit}
      />

      <ReopenTodoDialog
        todo={reopenTodo}
        reason={reopenReason}
        setReason={setReopenReason}
        error={error}
        setError={setError}
        isPending={isPending}
        onClose={closeReopenDialog}
        onSubmit={handleReopenSubmit}
      />

      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
          duration={toast.type === "error" ? 5000 : 3000}
        />
      )}
    </div>
  );
}

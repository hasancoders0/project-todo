"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  FolderKanban,
  LoaderCircle,
  Save,
  Trash2,
  Users,
} from "lucide-react";

import {
  createProject,
  updateProject,
  deleteProject,
} from "@/actions/project-actions";

export default function ProjectForm({ project = null, users = [] }) {
  const router = useRouter();
  const isEditing = Boolean(project?.id);

  const action = isEditing
    ? updateProject.bind(null, project.id)
    : createProject;

  const [state, formAction, pending] = useActionState(action, {
    error: null,
  });

  const [selectedMembers, setSelectedMembers] = useState(
    (project?.members ?? [])
      .map((member) => member.userId ?? member.user?.id)
      .filter(Boolean),
  );

  const [startAt, setStartAt] = useState(
    project?.startAt
      ? new Date(project.startAt).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
  );

  const [deadlineAt, setDeadlineAt] = useState(
    project?.deadlineAt
      ? new Date(project.deadlineAt).toISOString().slice(0, 10)
      : "",
  );

  const [deletePending, setDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  function toggleMember(userId) {
    setSelectedMembers((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId],
    );
  }

  async function handleDeleteProject() {
    if (!project?.id || deletePending) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.name}"? This action cannot be undone. Related records may also be affected according to your database rules.`,
    );

    if (!confirmed) return;

    setDeletePending(true);
    setDeleteError("");

    try {
      const formData = new FormData();
      formData.set("projectId", project.id);

      const result = await deleteProject(formData);

      if (result?.error) {
        setDeleteError(result.error);
        setDeletePending(false);
      }
    } catch (error) {
      // A successful server action may redirect, which Next.js
      // handles through its navigation mechanism.
      throw error;
    }
  }

  return (
    <form action={formAction} className="space-y-7">
      <div className="space-y-2">
        <label
          htmlFor="name"
          className="block text-sm font-semibold text-slate-800"
        >
          Project name <span className="text-rose-500">*</span>
        </label>

        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={120}
          defaultValue={project?.name ?? ""}
          placeholder="e.g. Website redesign"
          className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="description"
          className="block text-sm font-semibold text-slate-800"
        >
          Description
        </label>

        <textarea
          id="description"
          name="description"
          rows={4}
          maxLength={2000}
          defaultValue={project?.description ?? ""}
          placeholder="Describe the project, goals, and expected outcome..."
          className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
        />

        <p className="text-xs text-slate-400">Maximum 2,000 characters.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="startAt"
            className="flex items-center gap-2 text-sm font-semibold text-slate-800"
          >
            <CalendarDays size={16} className="text-slate-400" />
            Start date
          </label>

          <input
            id="startAt"
            name="startAt"
            type="date"
            value={startAt}
            onChange={(event) => setStartAt(event.target.value)}
            max={deadlineAt || undefined}
            className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="deadlineAt"
            className="flex items-center gap-2 text-sm font-semibold text-slate-800"
          >
            <CalendarDays size={16} className="text-slate-400" />
            Deadline <span className="text-rose-500">*</span>
          </label>

          <input
            id="deadlineAt"
            name="deadlineAt"
            type="date"
            required
            value={deadlineAt}
            min={startAt || undefined}
            onChange={(event) => setDeadlineAt(event.target.value)}
            className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Users size={16} className="text-slate-400" />
            Project members <span className="text-rose-500">*</span>
          </label>

          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            {selectedMembers.length} selected
          </span>
        </div>

        <p className="text-sm text-slate-500">
          Select the team members who should have access to this project.
        </p>

        {users.length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {users.map((user) => {
              const checked = selectedMembers.includes(user.id);

              return (
                <label
                  key={user.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                    checked
                      ? "border-slate-400 bg-slate-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    name="memberIds"
                    value={user.id}
                    checked={checked}
                    onChange={() => toggleMember(user.id)}
                    className="size-4 rounded border-slate-300 accent-slate-900"
                  />

                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium text-slate-800">
                      {user.name || user.email || "Team member"}
                    </span>

                    {user.email && user.name && (
                      <span className="truncate text-xs text-slate-500">
                        {user.email}
                      </span>
                    )}
                  </span>
                </label>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
            No team members are available.
          </div>
        )}
      </div>

      {state?.error && (
        <p
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {state.error}
        </p>
      )}

      {deleteError && (
        <p
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {deleteError}
        </p>
      )}

      <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-400">
          <span className="text-rose-500">*</span> Required fields
        </p>

        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <Link
            href="/projects"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </Link>

          {isEditing && (
            <button
              type="button"
              onClick={handleDeleteProject}
              disabled={pending || deletePending}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deletePending ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
              {deletePending ? "Deleting..." : "Delete Project"}
            </button>
          )}

          <button
            type="submit"
            disabled={
              pending ||
              deletePending ||
              users.length === 0 ||
              selectedMembers.length === 0 ||
              !deadlineAt ||
              (startAt && deadlineAt && startAt > deadlineAt)
            }
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : isEditing ? (
              <Save size={16} />
            ) : (
              <FolderKanban size={16} />
            )}

            {pending
              ? isEditing
                ? "Saving changes..."
                : "Creating project..."
              : isEditing
                ? "Save changes"
                : "Create project"}
          </button>
        </div>
      </div>
    </form>
  );
}

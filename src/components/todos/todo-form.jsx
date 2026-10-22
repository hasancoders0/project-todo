"use client";

import { useActionState, useEffect } from "react";
import {
  CalendarClock,
  Check,
  Clock3,
  FolderKanban,
  LoaderCircle,
  Save,
  UserRound,
  X,
} from "lucide-react";
import { saveTodo } from "@/actions/todo-actions";

const initialState = {
  error: "",
  success: false,
  message: "",
};

const inputClass =
  "mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

const labelClass = "block text-sm font-medium text-slate-700";

const sectionClass =
  "space-y-4 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5";

function toDateTimeLocal(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const offset = date.getTimezoneOffset() * 60_000;

  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function getAssigneeLabel(user) {
  return user.name || user.username || user.email || "Team member";
}

function FieldLabel({ htmlFor, icon: Icon, children, required = false }) {
  return (
    <label htmlFor={htmlFor} className={labelClass}>
      <span className="inline-flex items-center gap-2">
        {Icon && <Icon size={15} className="shrink-0 text-slate-400" />}
        <span>{children}</span>
        {required && (
          <span className="text-rose-500" aria-hidden="true">
            *
          </span>
        )}
      </span>
    </label>
  );
}

export default function TodoForm({
  projects = [],
  users = [],
  isAdmin = false,
  defaultProjectId = "",
  initialTodo = null,
  onClose,
  onSaved,
}) {
  const isEditing = Boolean(initialTodo?.id);

  const [state, formAction, pending] = useActionState(saveTodo, initialState);

  const selectedProjectId = initialTodo?.projectId || defaultProjectId || "";

  const selectedProject = projects.find(
    (project) => project.id === selectedProjectId,
  );

  const projectMembers = selectedProject?.memberIds
    ? users.filter((user) => selectedProject.memberIds.includes(user.id))
    : users;

  const initialAssigneeId =
    initialTodo?.assigneeId ||
    users.find((user) => user.role === "ADMIN")?.id ||
    users[0]?.id ||
    "";

  useEffect(() => {
    if (state.success) {
      onSaved?.(state);
    }
  }, [state, onSaved]);

  return (
    <form action={formAction} className="space-y-4 sm:space-y-5">
      {initialTodo?.id && (
        <input type="hidden" name="todoId" value={initialTodo.id} />
      )}

      <input type="hidden" name="projectId" value={selectedProjectId} />

      {/* Basic information */}
      <section className={sectionClass}>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Basic information
          </h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Give your Todo a clear title and any helpful details.
          </p>
        </div>

        <div>
          <FieldLabel htmlFor="todo-title" required>
            Todo title
          </FieldLabel>

          <input
            id="todo-title"
            name="title"
            type="text"
            required
            maxLength={200}
            defaultValue={initialTodo?.title || ""}
            placeholder="e.g. Prepare the project report"
            className={inputClass}
            autoFocus
          />

          <p className="mt-1.5 text-xs text-slate-400">
            Keep it short and action-oriented.
          </p>
        </div>

        <div>
          <FieldLabel htmlFor="todo-description">Description</FieldLabel>

          <textarea
            id="todo-description"
            name="description"
            rows={3}
            maxLength={5000}
            defaultValue={initialTodo?.description || ""}
            placeholder="Add instructions, requirements, or additional details..."
            className={`${inputClass} min-h-24 resize-y`}
          />
        </div>
      </section>

      {/* Organization */}
      <section className={sectionClass}>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Organization</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Choose the project, priority, and responsible team member.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="min-w-0">
            <FieldLabel
              htmlFor="todo-project"
              icon={FolderKanban}
              required={!defaultProjectId && !isEditing}
            >
              Project
            </FieldLabel>

            {defaultProjectId || isEditing ? (
              <div className="mt-1.5 flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-700">
                <FolderKanban size={16} className="shrink-0 text-slate-400" />
                <span className="truncate">
                  {selectedProject?.name || "Selected project"}
                </span>
              </div>
            ) : (
              <select
                id="todo-project"
                name="projectId"
                required
                defaultValue={selectedProjectId}
                className={inputClass}
              >
                <option value="" disabled>
                  Select a project
                </option>

                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="min-w-0">
            <FieldLabel htmlFor="todo-priority">Priority</FieldLabel>

            <select
              id="todo-priority"
              name="priority"
              defaultValue={initialTodo?.priority || "MEDIUM"}
              className={inputClass}
            >
              <option value="LOW">Low priority</option>
              <option value="MEDIUM">Medium priority</option>
              <option value="HIGH">High priority</option>
            </select>
          </div>
        </div>

        {isAdmin && (
          <div>
            <FieldLabel htmlFor="todo-assignee" icon={UserRound} required>
              Assign to
            </FieldLabel>

            <select
              id="todo-assignee"
              name="assigneeId"
              defaultValue={initialAssigneeId}
              required
              className={inputClass}
            >
              <option value="" disabled>
                Select a project member
              </option>

              {projectMembers.map((user) => (
                <option key={user.id} value={user.id}>
                  {getAssigneeLabel(user)}
                  {user.role === "ADMIN" ? " (Admin)" : ""}
                </option>
              ))}
            </select>

            <p className="mt-1.5 text-xs leading-5 text-slate-500">
              Only members of the selected project can be assigned.
            </p>
          </div>
        )}
      </section>

      {/* Scheduling and focus */}
      <section className={sectionClass}>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Scheduling</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Set a deadline and the initial focus timer duration.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="min-w-0">
            <FieldLabel htmlFor="todo-deadline" icon={CalendarClock} required>
              Due date and time
            </FieldLabel>

            <input
              id="todo-deadline"
              name="deadlineAt"
              type="datetime-local"
              required
              defaultValue={toDateTimeLocal(initialTodo?.deadlineAt)}
              className={inputClass}
            />
          </div>

          <div className="min-w-0">
            <FieldLabel htmlFor="todo-focus-duration" icon={Clock3} required>
              Focus duration
            </FieldLabel>

            <div className="relative mt-1.5">
              <input
                id="todo-focus-duration"
                name="focusDurationMinutes"
                type="number"
                min={1}
                max={1440}
                step={1}
                required
                defaultValue={initialTodo?.focusDurationMinutes ?? 25}
                className={`${inputClass} pr-20`}
              />

              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                minutes
              </span>
            </div>

            <p className="mt-1.5 text-xs leading-5 text-slate-500">
              Initial focus timer duration. You can change it later.
            </p>
          </div>
        </div>
      </section>

      {/* Error feedback */}
      {state.error && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-5 text-rose-700"
        >
          <span className="mt-0.5 shrink-0 font-semibold">!</span>
          <p>{state.error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={pending}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X size={16} />
          Cancel
        </button>

        <button
          type="submit"
          disabled={pending || projects.length === 0}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? (
            <LoaderCircle size={16} className="animate-spin" />
          ) : state.success ? (
            <Check size={16} />
          ) : (
            <Save size={16} />
          )}

          {pending ? "Saving..." : isEditing ? "Save changes" : "Create Todo"}
        </button>
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import {
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Clock3,
  Edit3,
  Maximize2,
  MoreHorizontal,
  Play,
  RotateCcw,
  RotateCw,
  Timer,
  Trash2,
  X,
} from "lucide-react";

import TodoFocusTimer from "@/components/todos/todo-focus-timer";

const PRIORITY_STYLES = {
  LOW: "bg-slate-100 text-slate-600",
  MEDIUM: "bg-amber-50 text-amber-700",
  HIGH: "bg-rose-50 text-rose-700",
};

const STATUS_STYLES = {
  PENDING: "bg-slate-100 text-slate-600",
  IN_PROGRESS: "bg-sky-50 text-sky-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
};

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value) {
  if (!value) return "No deadline";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "No deadline";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getUserLabel(user) {
  if (!user) return "Unassigned";

  return user.name || user.username || user.email || "Team member";
}

function getInitials(name) {
  return (name || "U")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getTimeRemaining(value) {
  if (!value) return null;

  const difference = new Date(value).getTime() - Date.now();

  if (Number.isNaN(difference)) return null;

  if (difference <= 0) {
    return { label: "Deadline passed", expired: true };
  }

  const days = Math.floor(difference / 86400000);
  const hours = Math.floor((difference % 86400000) / 3600000);
  const minutes = Math.floor((difference % 3600000) / 60000);

  if (days > 0) {
    return {
      label: `${days}d ${hours}h remaining`,
      expired: false,
    };
  }

  if (hours > 0) {
    return {
      label: `${hours}h ${minutes}m remaining`,
      expired: false,
    };
  }

  return {
    label: `${Math.max(1, minutes)}m remaining`,
    expired: false,
  };
}

function StatusIcon({ status }) {
  if (status === "COMPLETED") return <CheckCircle2 size={17} />;
  if (status === "IN_PROGRESS") return <Clock3 size={17} />;

  return <Circle size={17} />;
}

function getReopenHistory(todo) {
  const history = Array.isArray(todo.statusHistory) ? todo.statusHistory : [];

  return history
    .filter(
      (item) => item.fromStatus === "COMPLETED" && item.toStatus === "PENDING",
    )
    .sort(
      (a, b) =>
        new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime(),
    );
}

/**
 * Compact horizontal information row used for notes and history.
 */
function CompactInfoRow({ icon, label, date, children, variant = "slate" }) {
  const styles = {
    slate: {
      wrapper: "border-slate-200 bg-white",
      icon: "text-slate-500",
      label: "text-slate-500",
      content: "text-slate-700",
    },
    amber: {
      wrapper: "border-amber-100 bg-amber-50/60",
      icon: "text-amber-700",
      label: "text-amber-800",
      content: "text-slate-700",
    },
    emerald: {
      wrapper: "border-emerald-100 bg-emerald-50/60",
      icon: "text-emerald-700",
      label: "text-emerald-800",
      content: "text-slate-700",
    },
  };

  const style = styles[variant] || styles.slate;

  return (
    <div
      className={`flex min-w-0 flex-wrap items-start gap-x-2 gap-y-1 border-b px-2.5 py-2 last:border-b-0 ${style.wrapper}`}
    >
      <span className={`mt-0.5 shrink-0 ${style.icon}`}>{icon}</span>

      <span
        className={`shrink-0 text-[10px] font-semibold uppercase tracking-wide ${style.label}`}
      >
        {label}
      </span>

      <div
        className={`min-w-0 flex-1 break-words text-[11px] leading-4 ${style.content}`}
      >
        {children}
      </div>

      {date && (
        <span className="ml-auto shrink-0 text-[10px] text-slate-400">
          {date}
        </span>
      )}
    </div>
  );
}

export default function TodoCard({
  todo,
  currentUser,
  isAdmin = false,
  disabled = false,
  onEdit,
  onStatusChange,
  onDelete,
}) {
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [reopenHistoryExpanded, setReopenHistoryExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [focusModalOpen, setFocusModalOpen] = useState(false);

  const description = todo.description || "";
  const isLongDescription = description.length > 160;

  const isCompleted = todo.status === "COMPLETED";
  const isInProgress = todo.status === "IN_PROGRESS";

  const nextStatus = isCompleted
    ? "PENDING"
    : isInProgress
      ? "COMPLETED"
      : "IN_PROGRESS";

  const statusLabel = isCompleted
    ? "Completed"
    : isInProgress
      ? "In progress"
      : "Not started";

  const actionLabel = isCompleted
    ? "Reopen Todo"
    : isInProgress
      ? "Mark completed"
      : "Start Todo";

  const canEdit = isAdmin || todo.createdById === currentUser?.id;
  const canDelete = isAdmin || todo.createdById === currentUser?.id;

  const assigneeName = getUserLabel(todo.assignee);
  const deadline = getTimeRemaining(todo.deadlineAt);
  const completions = Array.isArray(todo.completions) ? todo.completions : [];

  const reopenHistory = getReopenHistory(todo);
  const latestReopen = reopenHistory[0] || null;
  const isReopened = Boolean(latestReopen);

  function handleMainAction() {
    if (disabled) return;

    onStatusChange?.(todo, nextStatus);
  }

  function closeFocusModal() {
    setFocusModalOpen(false);
  }

  return (
    <>
      <article
        className={`group flex h-full min-w-0 flex-col rounded-2xl border p-3.5 transition duration-200 sm:p-4 ${
          isCompleted
            ? "border-slate-200 bg-slate-50/70"
            : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
        }`}
      >
        {/* Header */}
        <div className="flex min-w-0 items-start gap-2.5">
          <div
            className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${
              isCompleted
                ? "bg-emerald-50 text-emerald-600"
                : isInProgress
                  ? "bg-sky-50 text-sky-600"
                  : "bg-slate-100 text-slate-500"
            }`}
          >
            <StatusIcon status={todo.status} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <h3
                className={`min-w-0 break-words text-sm font-semibold leading-5 ${
                  isCompleted ? "text-slate-500 line-through" : "text-slate-900"
                }`}
              >
                {todo.title}
              </h3>

              <span
                className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                  PRIORITY_STYLES[todo.priority] || PRIORITY_STYLES.MEDIUM
                }`}
              >
                {todo.priority || "MEDIUM"}
              </span>

              <span
                className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
                  STATUS_STYLES[todo.status] || STATUS_STYLES.PENDING
                }`}
              >
                {statusLabel}
              </span>

              {isReopened && (
                <span
                  title={`Reopened on ${formatDate(latestReopen.changedAt)}`}
                  className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-200"
                >
                  <RotateCw size={10} />
                  Reopened
                </span>
              )}
            </div>
          </div>

          {/* More actions */}
          <div className="relative -mr-1 -mt-1 shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={`More actions for ${todo.title}`}
              aria-expanded={menuOpen}
              className={`flex size-8 items-center justify-center rounded-lg transition ${
                menuOpen
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <MoreHorizontal size={19} />
            </button>

            {menuOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close actions menu"
                  className="fixed inset-0 z-20 cursor-default"
                  onClick={() => setMenuOpen(false)}
                />

                <div className="absolute right-0 top-full z-30 mt-1 w-40 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-900/10">
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onEdit?.(todo);
                      }}
                      disabled={disabled}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      <Edit3 size={13} />
                      Edit Todo
                    </button>
                  )}

                  {canDelete && (
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete?.(todo);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                    >
                      <Trash2 size={13} />
                      Delete Todo
                    </button>
                  )}

                  {!canEdit && !canDelete && (
                    <p className="px-2.5 py-2 text-xs text-slate-400">
                      No additional actions
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="mt-3 flex-1">
          {description && (
            <div>
              <p
                className={`whitespace-pre-wrap break-words text-xs leading-5 text-slate-600 ${
                  descriptionExpanded ? "" : "line-clamp-3"
                }`}
              >
                {description}
              </p>

              {isLongDescription && (
                <button
                  type="button"
                  onClick={() =>
                    setDescriptionExpanded((expanded) => !expanded)
                  }
                  className="mt-1 text-[11px] font-semibold text-slate-500 hover:text-slate-900"
                >
                  {descriptionExpanded ? "Show less" : "See more"}
                </button>
              )}
            </div>
          )}

          {/* Assignee and deadline */}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-slate-500">
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[9px] font-semibold text-slate-600">
                {getInitials(assigneeName)}
              </span>
              <span className="max-w-36 truncate">{assigneeName}</span>
            </span>

            <span className="inline-flex items-center gap-1.5">
              <CalendarClock size={13} />
              Due {formatDateTime(todo.deadlineAt)}
            </span>

            {isCompleted && todo.completedAt && (
              <span className="inline-flex items-center gap-1 text-emerald-700">
                <CheckCircle2 size={13} />
                Completed {formatDate(todo.completedAt)}
              </span>
            )}
          </div>

          {deadline && !isCompleted && (
            <p
              className={`mt-1.5 text-[10px] ${
                deadline.expired
                  ? "font-medium text-rose-600"
                  : "text-slate-500"
              }`}
            >
              {deadline.label}
            </p>
          )}

          {/* Compact reopening reason */}
          {latestReopen?.reason && (
            <div className="mt-3 overflow-hidden rounded-lg border border-amber-100">
              <CompactInfoRow
                icon={<RotateCw size={12} />}
                label="Reopening reason"
                date={formatDate(latestReopen.changedAt)}
                variant="amber"
              >
                {latestReopen.reason}
              </CompactInfoRow>
            </div>
          )}

          {/* Compact reopening history */}
          {reopenHistory.length > 1 && (
            <div className="mt-1.5">
              <button
                type="button"
                onClick={() =>
                  setReopenHistoryExpanded((expanded) => !expanded)
                }
                aria-expanded={reopenHistoryExpanded}
                className="inline-flex items-center gap-1 rounded-md py-1 text-[11px] font-medium text-amber-700 transition hover:text-amber-900"
              >
                {reopenHistoryExpanded
                  ? "Hide reopening history"
                  : "View reopening history"}

                <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] text-amber-700">
                  {reopenHistory.length}
                </span>

                {reopenHistoryExpanded ? (
                  <ChevronUp size={12} />
                ) : (
                  <ChevronDown size={12} />
                )}
              </button>

              {reopenHistoryExpanded && (
                <div className="mt-1 overflow-hidden rounded-lg border border-amber-100 bg-white">
                  {reopenHistory.map((item, index) => (
                    <div
                      key={item.id ?? `${item.changedAt}-${index}`}
                      className={`flex flex-wrap items-start gap-x-2 gap-y-1 px-2.5 py-1.5 ${
                        index > 0 ? "border-t border-slate-100" : ""
                      }`}
                    >
                      <RotateCw
                        size={11}
                        className="mt-0.5 shrink-0 text-amber-600"
                      />

                      <span className="shrink-0 text-[10px] text-slate-500">
                        {formatDate(item.changedAt)}
                      </span>

                      {item.reason && (
                        <p className="min-w-0 flex-1 whitespace-pre-wrap break-words text-[11px] leading-4 text-slate-600">
                          {item.reason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Compact completion note */}
          {isCompleted && todo.completionMessage && (
            <div className="mt-2 overflow-hidden rounded-lg border border-emerald-100">
              <CompactInfoRow
                icon={<CheckCircle2 size={12} />}
                label="Completion note"
                variant="emerald"
              >
                {todo.completionMessage}
              </CompactInfoRow>
            </div>
          )}

          {/* Compact completion history */}
          {isCompleted && completions.length > 0 && (
            <div className="mt-1.5">
              <button
                type="button"
                onClick={() => setHistoryExpanded((expanded) => !expanded)}
                aria-expanded={historyExpanded}
                className="inline-flex items-center gap-1 rounded-md py-1 text-[11px] font-medium text-slate-500 transition hover:text-slate-900"
              >
                {historyExpanded ? "Hide history" : "View history"}

                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                  {completions.length}
                </span>

                {historyExpanded ? (
                  <ChevronUp size={12} />
                ) : (
                  <ChevronDown size={12} />
                )}
              </button>

              {historyExpanded && (
                <div className="mt-1 overflow-hidden rounded-lg border border-slate-200 bg-white">
                  {completions.map((completion, index) => (
                    <div
                      key={
                        completion.id ?? `${completion.completedAt}-${index}`
                      }
                      className={`flex min-w-0 flex-wrap items-start gap-x-2 gap-y-1 px-2.5 py-1.5 ${
                        index > 0 ? "border-t border-slate-100" : ""
                      }`}
                    >
                      <CheckCircle2
                        size={12}
                        className="mt-0.5 shrink-0 text-emerald-600"
                      />

                      <span className="shrink-0 text-[10px] font-medium text-slate-700">
                        {getUserLabel(completion.completedBy)}
                      </span>

                      <span className="shrink-0 text-[10px] text-slate-400">
                        {formatDate(completion.completedAt)}
                      </span>

                      {completion.message && (
                        <p className="min-w-0 flex-1 whitespace-pre-wrap break-words text-[11px] leading-4 text-slate-600">
                          {completion.message}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
          {!isCompleted && (
            <button
              type="button"
              onClick={() => setFocusModalOpen(true)}
              disabled={disabled}
              className="inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Play size={12} />
              Start Focus
            </button>
          )}

          <button
            type="button"
            onClick={handleMainAction}
            disabled={disabled}
            aria-label={`${actionLabel}: ${todo.title}`}
            title={`${actionLabel}: ${todo.title}`}
            className={`inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
              isInProgress
                ? "border border-slate-950 bg-white text-slate-900 hover:bg-slate-50"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {isCompleted ? (
              <RotateCcw size={12} />
            ) : isInProgress ? (
              <Check size={13} />
            ) : (
              <Play size={12} />
            )}

            {actionLabel}
          </button>

          {canEdit && (
            <button
              type="button"
              onClick={() => onEdit?.(todo)}
              disabled={disabled}
              className="inline-flex min-h-8 items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
            >
              <Edit3 size={13} />
              Edit
            </button>
          )}
        </div>
      </article>

      {/* Focus timer modal */}
      {focusModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeFocusModal();
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={`focus-title-${todo.id}`}
            className="my-auto w-full max-w-md overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl shadow-slate-950/20"
          >
            {/* Modal header */}
            <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
                  <Timer size={20} />
                </div>

                <div className="min-w-0">
                  <h2
                    id={`focus-title-${todo.id}`}
                    className="text-base font-semibold text-slate-900"
                  >
                    Focus session
                  </h2>

                  <p className="mt-1 break-words text-xs leading-5 text-slate-500">
                    {todo.title}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeFocusModal}
                aria-label="Close focus timer"
                className="ml-3 flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={18} />
              </button>
            </div>

            {/* Timer content */}
            <div className="p-4 sm:p-6">
              <div className="mb-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                <Maximize2 size={13} />
                <span>Stay focused. One task at a time.</span>
              </div>

              <TodoFocusTimer
                key={todo.id}
                durationMinutes={todo.focusDurationMinutes || 25}
              />

              <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
                <div className="flex items-start gap-2.5">
                  <CalendarClock
                    size={15}
                    className="mt-0.5 shrink-0 text-slate-500"
                  />

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-700">
                      Task deadline
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {formatDateTime(todo.deadlineAt)}
                    </p>

                    {deadline && (
                      <p
                        className={`mt-1 text-[11px] ${
                          deadline.expired
                            ? "font-medium text-rose-600"
                            : "text-slate-500"
                        }`}
                      >
                        {deadline.label}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={closeFocusModal}
                className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                Close focus window
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

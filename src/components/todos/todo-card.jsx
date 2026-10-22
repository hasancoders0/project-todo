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
  MoreHorizontal,
  Play,
  RotateCcw,
  Trash2,
  RotateCw,
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
    return { label: `${days}d ${hours}h remaining`, expired: false };
  }

  if (hours > 0) {
    return { label: `${hours}h ${minutes}m remaining`, expired: false };
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
  const completions = todo.completions || [];

  const reopenHistory = getReopenHistory(todo);
  const latestReopen = reopenHistory[0] || null;
  const isReopened = Boolean(latestReopen);

  function handleMainAction() {
    if (disabled) return;

    // The workspace owns the dialog and asks for the reopen reason.
    // Do not create a second dialog inside this card.
    onStatusChange?.(todo, nextStatus);
  }

  return (
    <article
      className={`group min-w-0 rounded-2xl border transition-colors ${
        isCompleted
          ? "border-slate-200 bg-slate-50/70"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div className="grid min-w-0 grid-cols-1 gap-3 p-3 sm:p-3.5 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-4">
        <div className="min-w-0">
          <div className="flex items-start gap-2.5">
            <div
              className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl ${
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
              {/* Todo title and badges */}
              <div className="flex items-start gap-2">
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
                  <h3
                    className={`break-words text-sm font-semibold leading-5 ${
                      isCompleted
                        ? "text-slate-500 line-through"
                        : "text-slate-900"
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

                {/* Card actions menu */}
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
                            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
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

              {/* Description */}
              {description && (
                <div className="mt-1">
                  <p
                    className={`whitespace-pre-wrap break-words text-xs leading-5 text-slate-600 ${
                      descriptionExpanded ? "" : "line-clamp-2"
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
                      className="mt-0.5 text-[11px] font-semibold text-slate-500 hover:text-slate-900"
                    >
                      {descriptionExpanded ? "Show less" : "See more"}
                    </button>
                  )}
                </div>
              )}

              {/* Assignee and deadline */}
              <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <span className="flex size-5 items-center justify-center rounded-full bg-slate-100 text-[9px] font-semibold text-slate-600">
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

              {/* Latest reopening reason */}
              {latestReopen?.reason && (
                <div className="mt-2.5 rounded-lg border border-amber-100 bg-amber-50/70 px-2.5 py-2">
                  <div className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wide text-amber-800">
                    <RotateCw size={11} />
                    Reopening reason
                  </div>

                  <p className="mt-0.5 whitespace-pre-wrap break-words text-xs leading-4 text-slate-700">
                    {latestReopen.reason}
                  </p>

                  <p className="mt-1 text-[10px] text-slate-500">
                    Reopened {formatDate(latestReopen.changedAt)}
                  </p>
                </div>
              )}

              {/* Reopening history */}
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
                          key={item.id}
                          className={`px-2.5 py-2 ${
                            index > 0 ? "border-t border-slate-100" : ""
                          }`}
                        >
                          <div className="flex flex-wrap items-center gap-x-1.5 text-[10px] text-slate-500">
                            <span>{formatDate(item.changedAt)}</span>
                          </div>

                          {item.reason && (
                            <p className="mt-1 whitespace-pre-wrap break-words text-[11px] leading-4 text-slate-600">
                              {item.reason}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Completion note */}
              {isCompleted && todo.completionMessage && (
                <div className="mt-2.5 rounded-lg border border-emerald-100 bg-emerald-50/80 px-2.5 py-2">
                  <div className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wide text-emerald-800">
                    <CheckCircle2 size={11} />
                    Completion note
                  </div>

                  <p className="mt-0.5 whitespace-pre-wrap break-words text-xs leading-4 text-slate-700">
                    {todo.completionMessage}
                  </p>
                </div>
              )}

              {/* Completion history */}
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
                          key={completion.id}
                          className={`flex items-start gap-2 px-2.5 py-1.5 ${
                            index > 0 ? "border-t border-slate-100" : ""
                          }`}
                        >
                          <CheckCircle2
                            size={12}
                            className="mt-0.5 shrink-0 text-emerald-600"
                          />

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-x-1.5 text-[10px] leading-4 text-slate-500">
                              <span className="font-medium text-slate-700">
                                {getUserLabel(completion.completedBy)}
                              </span>
                              <span>·</span>
                              <span>{formatDate(completion.completedAt)}</span>
                            </div>

                            {completion.message && (
                              <p className="mt-0.5 whitespace-pre-wrap break-words text-[11px] leading-4 text-slate-600">
                                {completion.message}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Main action */}
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleMainAction}
                  disabled={disabled}
                  aria-label={`${actionLabel}: ${todo.title}`}
                  title={`${actionLabel}: ${todo.title}`}
                  className={`inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    isInProgress
                      ? "bg-slate-950 text-white hover:bg-slate-800"
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
                    className="inline-flex min-h-8 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
                  >
                    <Edit3 size={13} />
                    Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Focus timer */}
        <div className="min-w-0 border-t border-slate-100 pt-3 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
          <TodoFocusTimer
            durationMinutes={todo.focusDurationMinutes || 25}
            compact
          />

          {deadline && !isCompleted && (
            <p
              className={`mt-1.5 px-0.5 text-[10px] ${
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
    </article>
  );
}

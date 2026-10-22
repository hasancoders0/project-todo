import Link from "next/link";
import {
  CalendarDays,
  Clock3,
  Pencil,
  Users,
  UserRound,
  FolderKanban,
} from "lucide-react";

import CountdownTimer from "@/components/projects/countdown-timer";

function formatDate(value) {
  if (!value) return "Not set";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not set";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getInitials(name) {
  return (name || "U")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function ProjectSidebar({ project, isAdmin = false }) {
  if (!project) return null;

  const statusStyles = {
    ACTIVE: "bg-emerald-50 text-emerald-700",
    COMPLETED: "bg-blue-50 text-blue-700",
    ARCHIVED: "bg-slate-100 text-slate-600",
  };

  const statusLabels = {
    ACTIVE: "Active",
    COMPLETED: "Completed",
    ARCHIVED: "Archived",
  };

  const members = project.members ?? [];
  const creatorId = project.creator?.id;

  return (
    <aside className="space-y-4">
      {/* Deadline countdown */}
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-white shadow-sm">
        <div className="border-b border-white/10 px-4 py-3.5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Clock3 size={16} className="text-slate-300" />

            <h2>Deadline countdown</h2>
          </div>

          <p className="mt-1 text-xs text-slate-400">
            Time remaining for this project
          </p>
        </div>

        <div className="p-4">
          <CountdownTimer deadline={project.deadlineAt} variant="dark" />

          <div className="mt-4 flex items-start gap-2 border-t border-white/10 pt-3 text-xs text-slate-400">
            <CalendarDays size={14} className="mt-0.5 shrink-0" />

            <span>Due {formatDate(project.deadlineAt)}</span>
          </div>
        </div>
      </section>

      {/* Project details */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <FolderKanban size={16} className="text-slate-500" />

          <h2 className="text-sm font-semibold text-slate-950">
            Project details
          </h2>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <p className="text-xs text-slate-500">Project name</p>

            <p className="mt-1 break-words text-sm font-medium text-slate-900">
              {project.name || "Untitled project"}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Status</p>

            <span
              className={`mt-1.5 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                statusStyles[project.status] || "bg-slate-100 text-slate-600"
              }`}
            >
              {statusLabels[project.status] || project.status || "Unknown"}
            </span>
          </div>

          <div>
            <p className="text-xs text-slate-500">Start date</p>

            <p className="mt-1 text-sm font-medium text-slate-900">
              {formatDate(project.startAt)}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Created</p>

            <p className="mt-1 text-sm font-medium text-slate-900">
              {formatDate(project.createdAt)}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Deadline</p>

            <p className="mt-1 text-sm font-medium text-slate-900">
              {formatDate(project.deadlineAt)}
            </p>
          </div>

          {project.description && (
            <div>
              <p className="text-xs text-slate-500">Description</p>

              <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-5 text-slate-700">
                {project.description}
              </p>
            </div>
          )}
        </div>

        {isAdmin && (
          <Link
            href={`/projects/${project.id}/edit`}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
          >
            <Pencil size={14} />
            Edit project
          </Link>
        )}
      </section>

      {/* Project team */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-slate-500" />

            <h2 className="text-sm font-semibold text-slate-950">
              Project team
            </h2>
          </div>

          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
            {members.length}
          </span>
        </div>

        {members.length > 0 ? (
          <div className="mt-4 space-y-3">
            {members.map((member, index) => {
              const user = member?.user ?? member;

              if (!user?.id) return null;

              const name = user.name || user.username || "Team member";

              const isCreator = user.id === creatorId;

              return (
                <div
                  key={user.id || index}
                  className="flex min-w-0 items-center gap-3"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                    {getInitials(name)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {name}
                    </p>

                    <p className="text-xs text-slate-500">
                      {isCreator ? "Project creator" : "Project member"}
                    </p>
                  </div>

                  {isCreator && (
                    <UserRound size={14} className="shrink-0 text-slate-400" />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">
            No team members added yet.
          </p>
        )}
      </section>
    </aside>
  );
}

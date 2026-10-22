
import Link from "next/link";
import {
  FolderKanban,
  Plus,
  CalendarDays,
  ArrowUpRight,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

const statusStyles = {
  ACTIVE: "bg-blue-50 text-blue-700",
  COMPLETED: "bg-green-50 text-green-700",
  ARCHIVED: "bg-gray-100 text-gray-600",
};

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function ProjectsPage() {
  const user = await requireUser();

  const where =
    user.role === "ADMIN"
      ? {}
      : {
          members: {
            some: {
              userId: user.id,
            },
          },
        };

  const projects = await prisma.project.findMany({
    where,
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      startAt: true,
      deadlineAt: true,
      updatedAt: true,
      creator: {
        select: {
          name: true,
        },
      },
      members: {
        select: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      _count: {
        select: {
          todos: true,
        },
      },
      todos: {
        where: {
          status: "COMPLETED",
        },
        select: {
          id: true,
        },
      },
    },
  });

  const activeCount = projects.filter(
    (project) => project.status === "ACTIVE"
  ).length;

  const completedCount = projects.filter(
    (project) => project.status === "COMPLETED"
  ).length;

  const archivedCount = projects.filter(
    (project) => project.status === "ARCHIVED"
  ).length;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Projects
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Organize projects, deadlines, and team responsibilities.
          </p>
        </div>

        {user.role === "ADMIN" && (
          <Link
            href="/projects/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700"
          >
            <Plus className="h-4 w-4" />
            Create Project
          </Link>
        )}
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Total Projects", value: projects.length },
          { label: "Active", value: activeCount },
          {
            label: "Completed / Archived",
            value: completedCount + archivedCount,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-gray-200 bg-white p-5"
          >
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            All Projects
          </h2>
          <span className="text-sm text-gray-500">
            {projects.length} projects
          </span>
        </div>

        {projects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <FolderKanban className="mx-auto h-10 w-10 text-gray-300" />

            <h3 className="mt-4 text-base font-semibold text-gray-900">
              No projects yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              {user.role === "ADMIN"
                ? "Create your first project to organize tasks, set deadlines, and bring your team together."
                : "Projects will appear here when an administrator adds you to a project."}
            </p>

            {user.role === "ADMIN" && (
              <Link
                href="/projects/new"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700"
              >
                <Plus className="h-4 w-4" />
                Create your first project
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {projects.map((project) => {
              const totalTasks = project._count.todos;
              const completedTasks = project.todos.length;
              const progress =
                totalTasks === 0
                  ? 0
                  : Math.round((completedTasks / totalTasks) * 100);

              const isOverdue =
                project.status === "ACTIVE" &&
                new Date(project.deadlineAt) < new Date();

              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="group rounded-xl border border-gray-200 bg-white p-5 transition hover:border-gray-300 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="rounded-lg bg-gray-100 p-2.5">
                        <FolderKanban className="h-5 w-5 text-gray-700" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-gray-900">
                          {project.name}
                        </h3>
                        <p className="mt-1 text-xs text-gray-500">
                          Created by {project.creator.name}
                        </p>
                      </div>
                    </div>

                    <ArrowUpRight className="h-4 w-4 shrink-0 text-gray-400 transition group-hover:text-gray-900" />
                  </div>

                  <p className="mt-4 line-clamp-2 min-h-10 text-sm leading-5 text-gray-500">
                    {project.description || "No project description added."}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        statusStyles[project.status] ||
                        statusStyles.ARCHIVED
                      }`}
                    >
                      {project.status}
                    </span>

                    {isOverdue && (
                      <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                        Past deadline
                      </span>
                    )}
                  </div>

                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="text-gray-500">Task progress</span>
                      <span className="font-medium text-gray-700">
                        {completedTasks}/{totalTasks} · {progress}%
                      </span>
                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-gray-900 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Due {formatDate(project.deadlineAt)}
                    </div>

                    <span className="text-xs text-gray-500">
                      {project.members.length}{" "}
                      {project.members.length === 1 ? "member" : "members"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

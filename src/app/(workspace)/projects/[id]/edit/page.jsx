
import { notFound } from "next/navigation";
import { AlertCircle, FolderKanban } from "lucide-react";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProjectForm from "@/components/projects/project-form";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({ params }) {
  await requireAdmin();

  const { id } = await params;

  const [project, users] = await Promise.all([
    prisma.project.findUnique({
      where: { id },
      include: {
        members: {
          select: {
            userId: true,
          },
        },
      },
    }),
    prisma.user.findMany({
      orderBy: {
        username: "asc",
      },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
      },
    }),
  ]);

  if (!project) {
    notFound();
  }

  const availableUsers = users.map((user) => ({
    ...user,
    name: user.name?.trim() || user.username || "Unnamed user",
  }));

  const projectData = {
    id: project.id,
    name: project.name,
    description: project.description || "",
    startAt: project.startAt
      ? project.startAt.toISOString().slice(0, 10)
      : "",
    deadlineAt: project.deadlineAt
      ? project.deadlineAt.toISOString().slice(0, 10)
      : "",
    memberIds: project.members.map((member) => member.userId),
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 pb-8">
      <header className="flex items-start gap-3.5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
          <FolderKanban className="h-5 w-5 text-slate-800" />
        </div>

        <div className="min-w-0 pt-0.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Project management
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
            Edit project
          </h1>
          <p className="mt-1.5 text-sm leading-6 text-slate-500">
            Update project details, assigned team members, and dates.
          </p>
        </div>
      </header>

      {availableUsers.length === 0 ? (
        <section
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
          <div>
            <h2 className="text-sm font-semibold text-amber-900">
              No team members found
            </h2>
            <p className="mt-1 text-sm leading-6 text-amber-800">
              No users are available to assign to this project.
            </p>
          </div>
        </section>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
              <FolderKanban size={17} className="text-slate-700" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-slate-900">
                Project settings
              </h2>
              <p className="mt-1 truncate text-xs leading-5 text-slate-500">
                {project.name}
              </p>
            </div>
          </div>

          <ProjectForm users={availableUsers} project={projectData} />
        </section>
      )}
    </div>
  );
}

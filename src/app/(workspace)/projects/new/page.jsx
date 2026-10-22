
import { AlertCircle, FolderPlus } from "lucide-react";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProjectForm from "@/components/projects/project-form";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  await requireAdmin();

  let users = [];

  try {
    users = await prisma.user.findMany({
      orderBy: {
        username: "asc",
      },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
      },
    });
  } catch (error) {
    console.error("Failed to load project team members:", error);

    return (
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-rose-200 bg-white p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
          <div>
            <h1 className="text-base font-semibold text-slate-900">
              Unable to load team members
            </h1>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              We couldn't load the team list. Please refresh the page and try
              again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const availableUsers = users.map((user) => ({
    ...user,
    name: user.name?.trim() || user.username || "Unnamed user",
  }));

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 pb-8">
      <header className="flex items-start gap-3.5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
          <FolderPlus className="h-5 w-5 text-slate-800" />
        </div>

        <div className="min-w-0 pt-0.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Project management
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
            Create project
          </h1>
          <p className="mt-1.5 text-sm leading-6 text-slate-500">
            Set up a project, assign your team, and define the schedule.
          </p>
        </div>
      </header>

      {availableUsers.length === 0 ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-sm font-semibold text-amber-900">
            No team members found
          </h2>
          <p className="mt-1 text-sm leading-6 text-amber-800">
            Add at least one user before creating a project.
          </p>
        </section>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
              <FolderPlus size={17} className="text-slate-700" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Project details
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Enter the project information and choose its team.
              </p>
            </div>
          </div>

          <ProjectForm users={availableUsers} />
        </section>
      )}
    </div>
  );
}

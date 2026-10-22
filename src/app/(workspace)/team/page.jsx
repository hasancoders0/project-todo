
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

import {
  createTeamMember,
  updateTeamMemberProjects,
} from "@/actions/team-actions";

export const metadata = {
  title: "Team Members | Project ToDo",
  description: "Manage team members and project assignments.",
};

export default async function TeamPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("project-todo-user")?.value;

  if (!userId) {
    redirect("/login");
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      role: true,
    },
  });

  if (!currentUser) {
    redirect("/login");
  }

  if (currentUser.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [members, projects, adminCount] = await Promise.all([
    prisma.user.findMany({
      where: { role: "MEMBER" },
      orderBy: { createdAt: "desc" },
      include: {
        projectMemberships: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
          },
        },
        _count: {
          select: {
            assignedTodos: true,
            createdTodos: true,
            completedTodos: true,
          },
        },
      },
    }),

    prisma.project.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        status: true,
      },
    }),

    prisma.user.count({
      where: { role: "ADMIN" },
    }),
  ]);

  const assignmentCount = members.reduce(
    (total, member) => total + member.projectMemberships.length,
    0
  );

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Page header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-neutral-500">
            Workspace / Team
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">
            Team Members
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
            Manage your team, create member accounts, and control project access
            from one place.
          </p>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-600">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Administrator
        </div>
      </header>

      {/* Overview cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Members"
          value={members.length}
          description="Registered team members"
          icon="users"
        />

        <StatCard
          label="Administrators"
          value={adminCount}
          description="Accounts with admin access"
          icon="shield"
        />

        <StatCard
          label="Total Projects"
          value={projects.length}
          description="Available workspace projects"
          icon="folder"
        />

        <StatCard
          label="Project Assignments"
          value={assignmentCount}
          description="Member-to-project connections"
          icon="layers"
        />
      </section>

      {/* Main content */}
      <section className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        {/* Create member */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="mb-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700">
              <UserPlusIcon />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-neutral-950">
              Add team member
            </h2>

            <p className="mt-1 text-sm leading-5 text-neutral-500">
              Create a member account using their name and username.
            </p>
          </div>

          <form action={createTeamMember} className="space-y-4">
            <div>
              <label
                htmlFor="member-name"
                className="mb-1.5 block text-sm font-medium text-neutral-700"
              >
                Full name
              </label>

              <input
                id="member-name"
                name="name"
                type="text"
                placeholder="e.g. Alex Morgan"
                autoComplete="name"
                maxLength={100}
                required
                className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-100"
              />
            </div>

            <div>
              <label
                htmlFor="member-username"
                className="mb-1.5 block text-sm font-medium text-neutral-700"
              >
                Username
              </label>

              <input
                id="member-username"
                name="username"
                type="text"
                placeholder="e.g. alex_morgan"
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="off"
                spellCheck={false}
                maxLength={50}
                pattern="[A-Za-z0-9_-]+"
                required
                className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-100"
              />

              <p className="mt-1.5 text-xs leading-5 text-neutral-500">
                Use letters, numbers, underscores, or hyphens.
              </p>
            </div>

            <div className="rounded-xl bg-neutral-50 p-3.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-neutral-600">
                  Account role
                </span>

                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-neutral-700 ring-1 ring-neutral-200">
                  Member
                </span>
              </div>

              <p className="mt-2 text-xs leading-5 text-neutral-500">
                The member can log in using the assigned username. No email or
                password is required by your current login flow.
              </p>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2"
            >
              <UserPlusIcon />
              Create member
            </button>
          </form>
        </div>

        {/* Members list */}
        <div className="min-w-0 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-neutral-950">
                All team members
              </h2>

              <p className="mt-1 text-sm text-neutral-500">
                Review member activity and manage project assignments.
              </p>
            </div>

            <span className="text-sm text-neutral-500">
              {members.length}{" "}
              {members.length === 1 ? "member" : "members"}
            </span>
          </div>

          {members.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100">
                <UsersIcon />
              </div>

              <h3 className="mt-4 font-semibold text-neutral-900">
                No team members yet
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-neutral-500">
                Create your first member using the form. You can assign projects
                once the member has been created.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {members.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  projects={projects}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value, description, icon }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-neutral-500">{label}</p>

          <p className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
          {icon === "users" && <UsersIcon />}
          {icon === "shield" && <ShieldIcon />}
          {icon === "folder" && <FolderIcon />}
          {icon === "layers" && <LayersIcon />}
        </div>
      </div>

      <p className="mt-3 text-xs text-neutral-500">{description}</p>
    </div>
  );
}

function MemberCard({ member, projects }) {
  const assignedProjectIds = new Set(
    member.projectMemberships.map((membership) => membership.projectId)
  );

  const initials = member.name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-neutral-300">
      {/* Member details */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-sm font-semibold text-neutral-700">
            {initials || "M"}
          </div>

          <div className="min-w-0">
            <h3 className="truncate font-semibold text-neutral-950">
              {member.name}
            </h3>

            <p className="mt-0.5 text-sm text-neutral-500">
              @{member.username}
            </p>

            <p className="mt-1 text-xs text-neutral-400">
              Joined{" "}
              {new Date(member.createdAt).toLocaleDateString("en", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          Member
        </span>
      </div>

      {/* Member statistics */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <MiniStat
          label="Assigned tasks"
          value={member._count.assignedTodos}
        />

        <MiniStat
          label="Created tasks"
          value={member._count.createdTodos}
        />

        <MiniStat
          label="Completed tasks"
          value={member._count.completedTodos}
        />
      </div>

      {/* Project assignment form */}
      <div className="mt-5 border-t border-neutral-100 pt-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h4 className="text-sm font-semibold text-neutral-900">
            Project assignments
          </h4>

          <span className="text-xs text-neutral-500">
            {member.projectMemberships.length}{" "}
            {member.projectMemberships.length === 1 ? "project" : "projects"}{" "}
            assigned
          </span>
        </div>

        <p className="mt-1 text-xs leading-5 text-neutral-500">
          Select the projects this member should have access to.
        </p>

        <form action={updateTeamMemberProjects} className="mt-4 space-y-4">
          <input type="hidden" name="userId" value={member.id} />

          {projects.length === 0 ? (
            <p className="rounded-xl bg-neutral-50 p-4 text-sm text-neutral-500">
              No projects available. Create a project before assigning members.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {projects.map((project) => (
                <label
                  key={project.id}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200 p-3 transition hover:bg-neutral-50 has-[:checked]:border-neutral-400 has-[:checked]:bg-neutral-50"
                >
                  <input
                    type="checkbox"
                    name="projectIds"
                    value={project.id}
                    defaultChecked={assignedProjectIds.has(project.id)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-neutral-900"
                  />

                  <span className="min-w-0 flex-1">
                    <span className="block break-words text-sm font-medium text-neutral-800">
                      {project.name}
                    </span>

                    <span className="mt-1 block text-xs capitalize text-neutral-500">
                      {project.status.toLowerCase()}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-neutral-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-neutral-500">
              Saving replaces this member&apos;s current project assignments.
            </p>

            <button
              type="submit"
              disabled={projects.length === 0}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckIcon />
              Save assignments
            </button>
          </div>
        </form>
      </div>
    </article>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-xl bg-neutral-50 p-3">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1.5 text-xl font-semibold text-neutral-900">{value}</p>
    </div>
  );
}

/* Small inline SVG icons; no additional dependencies required. */

function UsersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="10" cy="7" r="4" />
      <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function UserPlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M15 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M19 8v6M16 11h6" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

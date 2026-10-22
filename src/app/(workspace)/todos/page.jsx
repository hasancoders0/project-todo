
import { prisma } from "@/lib/prisma";
import { getRequiredUser } from "@/lib/permissions";
import AllTodosWorkspace from "@/components/todos/all-todos-workspace";

export const dynamic = "force-dynamic";

export default async function TodosPage() {
  const user = await getRequiredUser();
  const isAdmin = user.role === "ADMIN";

  const todoWhere = isAdmin
    ? {}
    : {
        project: {
          members: {
            some: {
              userId: user.id,
            },
          },
        },
        OR: [
          { createdById: user.id },
          { assigneeId: user.id },
        ],
      };

  const projectWhere = isAdmin
    ? {}
    : {
        members: {
          some: {
            userId: user.id,
          },
        },
      };

  const [todos, projects, teamMembers] = await Promise.all([
    prisma.todo.findMany({
      where: todoWhere,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        completedBy: {
          select: {
            id: true,
            name: true,
          },
        },
        completions: {
          orderBy: {
            completedAt: "desc",
          },
          include: {
            completedBy: {
              select: {
                id: true,
                name: true,
                username: true,
                email: true,
              },
            },
          },
        },
        statusHistory: {
          orderBy: {
            changedAt: "desc",
          },
          include: {
            changedBy: {
              select: {
                id: true,
                name: true,
                username: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: [
        { status: "asc" },
        { deadlineAt: "asc" },
        { createdAt: "desc" },
      ],
    }),

    prisma.project.findMany({
      where: projectWhere,
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    }),

    isAdmin
      ? prisma.user.findMany({
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
          },
          orderBy: {
            name: "asc",
          },
        })
      : prisma.user.findMany({
          where: {
            id: user.id,
          },
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
          },
        }),
  ]);

  const serializeDate = (value) =>
    value instanceof Date ? value.toISOString() : value;

  const serializedTodos = todos.map((todo) => ({
    ...todo,
    createdAt: serializeDate(todo.createdAt),
    updatedAt: serializeDate(todo.updatedAt),
    deadlineAt: serializeDate(todo.deadlineAt),
    completedAt: serializeDate(todo.completedAt),
    completions: todo.completions.map((completion) => ({
      ...completion,
      completedAt: serializeDate(completion.completedAt),
    })),
    statusHistory: todo.statusHistory.map((history) => ({
      ...history,
      changedAt: serializeDate(history.changedAt),
    })),
  }));

  const serializedProjects = projects.map((project) => ({
    ...project,
    startAt: serializeDate(project.startAt),
    deadlineAt: serializeDate(project.deadlineAt),
    createdAt: serializeDate(project.createdAt),
    updatedAt: serializeDate(project.updatedAt),
  }));

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
      <header className="space-y-2">
        <p className="text-sm font-medium text-slate-500">
          Workspace / Todos
        </p>

        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
          All Todos
        </h1>

        <p className="max-w-2xl text-sm leading-6 text-slate-500">
          Track your tasks, manage priorities, and keep projects moving
          forward.
        </p>
      </header>

      <AllTodosWorkspace
        todos={serializedTodos}
        projects={serializedProjects}
        users={teamMembers}
        currentUser={{
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
        }}
        isAdmin={isAdmin}
      />
    </main>
  );
}

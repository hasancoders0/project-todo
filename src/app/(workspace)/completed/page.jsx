
import { prisma } from "@/lib/prisma";
import { getRequiredUser } from "@/lib/permissions";
import CompletedTodosWorkspace from "@/components/todos/completed-todos-workspace";

export const dynamic = "force-dynamic";

export default async function CompletedPage() {
  const user = await getRequiredUser();
  const isAdmin = user.role === "ADMIN";

  const where = {
    status: "COMPLETED",
    ...(isAdmin
      ? {}
      : {
          project: {
            members: {
              some: { userId: user.id },
            },
          },
          OR: [
            { createdById: user.id },
            { assigneeId: user.id },
          ],
        }),
  };

  const todos = await prisma.todo.findMany({
    where,
    include: {
      project: {
        select: {
          id: true,
          name: true,
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
          username: true,
          email: true,
        },
      },
      completions: {
        orderBy: { completedAt: "desc" },
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
        orderBy: { changedAt: "desc" },
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
      { completedAt: "desc" },
      { updatedAt: "desc" },
    ],
  });

  const serializeDate = (value) =>
    value instanceof Date ? value.toISOString() : value;

  const serializedTodos = todos.map((todo) => ({
    ...todo,
    createdAt: serializeDate(todo.createdAt),
    updatedAt: serializeDate(todo.updatedAt),
    deadlineAt: serializeDate(todo.deadlineAt),
    completedAt: serializeDate(todo.completedAt),
    completions: todo.completions.map((item) => ({
      ...item,
      completedAt: serializeDate(item.completedAt),
    })),
    statusHistory: todo.statusHistory.map((item) => ({
      ...item,
      changedAt: serializeDate(item.changedAt),
    })),
  }));

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
      <header className="space-y-2">
        <p className="text-sm font-medium text-slate-500">
          Workspace / Completed
        </p>

        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
          Completed Tasks
        </h1>

        <p className="max-w-2xl text-sm leading-6 text-slate-500">
          Review finished work, completion notes, and task history.
        </p>
      </header>

      <CompletedTodosWorkspace
        todos={serializedTodos}
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

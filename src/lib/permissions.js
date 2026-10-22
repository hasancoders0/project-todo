
import { getCurrentUser } from "@/lib/auth";

export async function getRequiredUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Not authenticated.");
  }

  return user;
}

export async function getRequiredAdmin() {
  const user = await getRequiredUser();

  if (user.role !== "ADMIN") {
    throw new Error("Not authorized.");
  }

  return user;
}

export async function canAccessProject(projectId, user) {
  if (!projectId || !user) {
    return false;
  }

  if (user.role === "ADMIN") {
    return true;
  }

  const { prisma } = await import("@/lib/prisma");

  const membership = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId: user.id,
      },
    },
    select: {
      id: true,
    },
  });

  return Boolean(membership);
}

export async function getAccessibleProject(projectId, user) {
  if (!projectId || !user) {
    return null;
  }

  const { prisma } = await import("@/lib/prisma");

  const where =
    user.role === "ADMIN"
      ? { id: projectId }
      : {
          id: projectId,
          members: {
            some: {
              userId: user.id,
            },
          },
        };

  return prisma.project.findFirst({
    where,
    select: {
      id: true,
      name: true,
      status: true,
      deadlineAt: true,
    },
  });
}

export async function canAccessTodo(todoId, user) {
  if (!todoId || !user) {
    return false;
  }

  const { prisma } = await import("@/lib/prisma");

  const where =
    user.role === "ADMIN"
      ? { id: todoId }
      : {
          id: todoId,
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

  const todo = await prisma.todo.findFirst({
    where,
    select: {
      id: true,
    },
  });

  return Boolean(todo);
}

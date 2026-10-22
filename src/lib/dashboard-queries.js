
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/**
 * Returns the projects and todos the current user is allowed to access.
 *
 * Admin: all projects and todos.
 * Member: assigned projects, but only todos they created or assigned to.
 */
function getProjectAccessFilter(user) {
  if (user.role === "ADMIN") {
    return {};
  }

  return {
    members: {
      some: {
        userId: user.id,
      },
    },
  };
}

function getTodoAccessFilter(user) {
  if (user.role === "ADMIN") {
    return {};
  }

  return {
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
}

/**
 * Dashboard statistic cards:
 * - Active projects
 * - Open/pending todos
 * - In-progress todos
 * - Overdue todos
 * - Completed todos
 */
export async function getDashboardStats() {
  const user = await getCurrentUser();

  const emptyStats = {
    activeProjects: 0,
    totalProjects: 0,
    openTodos: 0,
    pendingTodos: 0,
    inProgressTodos: 0,
    overdueTodos: 0,
    completedTodos: 0,
    totalTodos: 0,
  };

  if (!user) {
    return emptyStats;
  }

  const now = new Date();
  const projectWhere = getProjectAccessFilter(user);
  const todoWhere = getTodoAccessFilter(user);

  const [
    activeProjects,
    totalProjects,
    openTodos,
    pendingTodos,
    inProgressTodos,
    overdueTodos,
    completedTodos,
    totalTodos,
  ] = await Promise.all([
    prisma.project.count({
      where: {
        ...projectWhere,
        status: "ACTIVE",
      },
    }),

    prisma.project.count({
      where: projectWhere,
    }),

    prisma.todo.count({
      where: {
        ...todoWhere,
        status: {
          in: ["PENDING", "IN_PROGRESS"],
        },
      },
    }),

    prisma.todo.count({
      where: {
        ...todoWhere,
        status: "PENDING",
      },
    }),

    prisma.todo.count({
      where: {
        ...todoWhere,
        status: "IN_PROGRESS",
      },
    }),

    prisma.todo.count({
      where: {
        ...todoWhere,
        status: {
          in: ["PENDING", "IN_PROGRESS"],
        },
        deadlineAt: {
          lt: now,
        },
      },
    }),

    prisma.todo.count({
      where: {
        ...todoWhere,
        status: "COMPLETED",
      },
    }),

    prisma.todo.count({
      where: todoWhere,
    }),
  ]);

  return {
    activeProjects,
    totalProjects,
    openTodos,
    pendingTodos,
    inProgressTodos,
    overdueTodos,
    completedTodos,
    totalTodos,
  };
}

/**
 * Returns the five most recently updated projects.
 * Includes the total todo count and completed todo count
 * required to calculate project progress.
 */
export async function getRecentProjects() {
  const user = await getCurrentUser();

  if (!user) {
    return [];
  }

  const projects = await prisma.project.findMany({
    where: getProjectAccessFilter(user),
    orderBy: {
      updatedAt: "desc",
    },
    take: 5,
    select: {
      id: true,
      name: true,
      description: true,
      deadlineAt: true,
      status: true,
      updatedAt: true,
      _count: {
        select: {
          todos: true,
        },
      },
      todos: {
        where: {
          ...getTodoAccessFilter(user),
          status: "COMPLETED",
        },
        select: {
          id: true,
        },
      },
    },
  });

  return projects;
}

/**
 * Returns tasks due soon, ordered by the nearest deadline.
 * Only includes non-completed tasks the user can access.
 */
export async function getTasksDueSoon(limit = 5) {
  const user = await getCurrentUser();

  if (!user) {
    return [];
  }

  const now = new Date();
  const upcomingLimit = new Date(now);
  upcomingLimit.setDate(upcomingLimit.getDate() + 7);

  return prisma.todo.findMany({
    where: {
      ...getTodoAccessFilter(user),
      status: {
        in: ["PENDING", "IN_PROGRESS"],
      },
      deadlineAt: {
        gte: now,
        lte: upcomingLimit,
      },
    },
    orderBy: {
      deadlineAt: "asc",
    },
    take: limit,
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
      deadlineAt: true,
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
        },
      },
    },
  });
}

/**
 * Returns recently completed tasks the user can access.
 */
export async function getRecentlyCompletedTodos(limit = 5) {
  const user = await getCurrentUser();

  if (!user) {
    return [];
  }

  return prisma.todo.findMany({
    where: {
      ...getTodoAccessFilter(user),
      status: "COMPLETED",
    },
    orderBy: {
      completedAt: "desc",
    },
    take: limit,
    select: {
      id: true,
      title: true,
      completionMessage: true,
      completedAt: true,
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
        },
      },
      completedBy: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

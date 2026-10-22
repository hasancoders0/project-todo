
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  getRequiredUser,
  getAccessibleProject,
} from "@/lib/permissions";
import ProjectTodoWorkspace from "@/components/projects/project-todo-workspace";

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }) {
  const { id } = await params;
  const user = await getRequiredUser();

  const accessibleProject = await getAccessibleProject(id, user);

  if (!accessibleProject) {
    notFound();
  }

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },

      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              role: true,
            },
          },
        },
        orderBy: {
          addedAt: "asc",
        },
      },

      todos: {
        where:
          user.role === "ADMIN"
            ? {}
            : {
                OR: [
                  { createdById: user.id },
                  { assigneeId: user.id },
                ],
              },

        include: {
          creator: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },

          assignee: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },

          completedBy: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },

          completions: {
            include: {
              completedBy: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                },
              },
            },
            orderBy: {
              completedAt: "desc",
            },
          },

          // Fetch status changes, including todo reopening reasons.
          statusHistory: {
            include: {
              changedBy: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                },
              },
            },
            orderBy: {
              changedAt: "desc",
            },
          },
        },

        orderBy: [
          { status: "asc" },
          { deadlineAt: "asc" },
          { createdAt: "desc" },
        ],
      },
    },
  });

  if (!project) {
    notFound();
  }

  const projectData = {
    ...project,

    deadlineAt: project.deadlineAt.toISOString(),
    startAt: project.startAt?.toISOString() ?? null,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),

    members: project.members.map((membership) => ({
      id: membership.id,
      userId: membership.userId,
      addedAt: membership.addedAt.toISOString(),
      user: membership.user,
    })),

    todos: project.todos.map((todo) => ({
      ...todo,

      deadlineAt: todo.deadlineAt.toISOString(),
      completedAt: todo.completedAt?.toISOString() ?? null,
      createdAt: todo.createdAt.toISOString(),
      updatedAt: todo.updatedAt.toISOString(),

      completions: todo.completions.map((completion) => ({
        ...completion,
        completedAt: completion.completedAt.toISOString(),
      })),

      // Convert Date objects to serializable strings for client components.
      statusHistory: todo.statusHistory.map((history) => ({
        ...history,
        changedAt: history.changedAt.toISOString(),
      })),
    })),
  };

  return (
    <ProjectTodoWorkspace
      project={projectData}
      todos={projectData.todos}
      currentUser={{
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
      }}
      teamMembers={project.members.map(
        (membership) => membership.user
      )}
      isAdmin={user.role === "ADMIN"}
    />
  );
}

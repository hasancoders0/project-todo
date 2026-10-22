
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  getRequiredUser,
  canAccessProject,
  canAccessTodo,
} from "@/lib/permissions";

const VALID_STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED"];
const VALID_PRIORITIES = ["LOW", "MEDIUM", "HIGH"];

function readText(formData, key) {
  return String(formData.get(key) ?? "").trim();
}

function readFocusDuration(formData) {
  const value = Number(formData.get("focusDurationMinutes") ?? 25);

  if (!Number.isInteger(value) || value < 1 || value > 1440) {
    return null;
  }

  return value;
}

function readDeadline(formData) {
  const value = readText(formData, "deadlineAt");
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date;
}

function refreshTodoPages(projectId, todoId) {
  revalidatePath("/todos");
  revalidatePath("/projects");
  revalidatePath("/completed");

  if (projectId) revalidatePath(`/projects/${projectId}`);
  if (todoId) revalidatePath(`/todos/${todoId}`);
}

async function getProjectForTodo(projectId, user) {
  const hasAccess = await canAccessProject(projectId, user);
  if (!hasAccess) return null;

  return prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      status: true,
      members: {
        select: { userId: true },
      },
    },
  });
}

async function resolveAssignee({
  user,
  project,
  requestedAssigneeId,
}) {
  if (user.role !== "ADMIN") {
    const isMember = project.members.some(
      (member) => member.userId === user.id
    );

    if (!isMember) {
      return {
        error: "You must belong to this project to assign yourself a Todo.",
      };
    }

    return { assigneeId: user.id };
  }

  const assigneeId = requestedAssigneeId || user.id;

  const isProjectMember = project.members.some(
    (member) => member.userId === assigneeId
  );

  if (!isProjectMember) {
    return {
      error: "Choose a team member assigned to this project.",
    };
  }

  return { assigneeId };
}

export async function saveTodo(previousState, formData) {
  try {
    const user = await getRequiredUser();

    const todoId = readText(formData, "todoId");
    const projectId = readText(formData, "projectId");
    const title = readText(formData, "title");
    const description = readText(formData, "description");
    const priority = readText(formData, "priority") || "MEDIUM";
    const requestedAssigneeId = readText(formData, "assigneeId");
    const deadlineAt = readDeadline(formData);
    const focusDurationMinutes = readFocusDuration(formData);

    if (!projectId || !title || !deadlineAt) {
      return {
        error: "Enter a title, project, and valid deadline.",
      };
    }

    if (title.length > 200) {
      return { error: "The title cannot exceed 200 characters." };
    }

    if (description.length > 5000) {
      return {
        error: "The description cannot exceed 5,000 characters.",
      };
    }

    if (!VALID_PRIORITIES.includes(priority)) {
      return { error: "Choose a valid priority." };
    }

    if (focusDurationMinutes === null) {
      return {
        error: "Focus duration must be between 1 and 1,440 minutes.",
      };
    }

    const project = await getProjectForTodo(projectId, user);

    if (!project) {
      return {
        error: "You don't have access to the selected project.",
      };
    }

    if (project.status !== "ACTIVE") {
      return {
        error: "Todos can only be created or edited in active projects.",
      };
    }

    let existingTodo = null;

    if (todoId) {
      const hasAccess = await canAccessTodo(todoId, user);

      if (!hasAccess) {
        return {
          error: "You don't have permission to edit this Todo.",
        };
      }

      existingTodo = await prisma.todo.findUnique({
        where: { id: todoId },
        select: {
          id: true,
          projectId: true,
          createdById: true,
          assigneeId: true,
        },
      });

      if (!existingTodo) {
        return { error: "This Todo could not be found." };
      }

      if (
        user.role !== "ADMIN" &&
        existingTodo.createdById !== user.id
      ) {
        return {
          error: "Only an admin or the Todo creator can edit its details.",
        };
      }

      if (existingTodo.projectId !== projectId) {
        return {
          error: "Moving a Todo to another project is not supported.",
        };
      }
    }

    const assigneeResult = await resolveAssignee({
      user,
      project,
      requestedAssigneeId:
        user.role === "ADMIN"
          ? requestedAssigneeId || existingTodo?.assigneeId || user.id
          : user.id,
    });

    if (assigneeResult.error) {
      return { error: assigneeResult.error };
    }

    const data = {
      title,
      description: description || null,
      priority,
      deadlineAt,
      focusDurationMinutes,
      assigneeId: assigneeResult.assigneeId,
    };

    let savedTodoId = todoId;

    if (existingTodo) {
      await prisma.todo.update({
        where: { id: existingTodo.id },
        data,
      });
    } else {
      const todo = await prisma.todo.create({
        data: {
          ...data,
          projectId,
          createdById: user.id,
        },
        select: { id: true },
      });

      savedTodoId = todo.id;
    }

    refreshTodoPages(projectId, savedTodoId);

    return {
      success: true,
      message: existingTodo
        ? "Todo updated successfully."
        : "Todo created successfully.",
      todoId: savedTodoId,
    };
  } catch (error) {
    console.error("Save Todo failed:", error);

    return {
      error: "Unable to save this Todo. Please try again.",
    };
  }
}

export async function updateTodoStatus(formData) {
  const user = await getRequiredUser();

  const todoId = readText(formData, "todoId");
  const nextStatus = readText(formData, "status");
  const completionMessage = readText(formData, "completionMessage");
  const reopenReason = readText(formData, "reopenReason");

  if (!todoId || !VALID_STATUSES.includes(nextStatus)) {
    throw new Error("Please provide a valid Todo and status.");
  }

  const hasAccess = await canAccessTodo(todoId, user);

  if (!hasAccess) {
    throw new Error("You don't have permission to update this Todo.");
  }

  const todo = await prisma.todo.findUnique({
    where: { id: todoId },
    select: {
      id: true,
      title: true,
      projectId: true,
      assigneeId: true,
      status: true,
    },
  });

  if (!todo) throw new Error("Todo not found.");

  if (user.role !== "ADMIN" && todo.assigneeId !== user.id) {
    throw new Error(
      "Only the assigned member or an admin can change this status."
    );
  }

  const isCompleting =
    todo.status !== "COMPLETED" && nextStatus === "COMPLETED";

  const isReopening =
    todo.status === "COMPLETED" && nextStatus === "PENDING";

  if (isCompleting && !completionMessage) {
    throw new Error(
      "Add a short completion message before completing this Todo."
    );
  }

  if (completionMessage.length > 1000) {
    throw new Error(
      "The completion message cannot exceed 1,000 characters."
    );
  }

  if (isReopening && !reopenReason) {
    throw new Error(
      `Enter a reason for reopening "${todo.title}".`
    );
  }

  if (reopenReason.length > 1000) {
    throw new Error(
      "The reopening reason cannot exceed 1,000 characters."
    );
  }

  // Avoid creating duplicate history records for an unchanged status.
  if (todo.status === nextStatus) return { success: true };

  await prisma.$transaction(async (tx) => {
    await tx.todo.update({
      where: { id: todo.id },
      data: {
        status: nextStatus,
        completedAt: nextStatus === "COMPLETED" ? new Date() : null,
        completedById: nextStatus === "COMPLETED" ? user.id : null,
        completionMessage:
          nextStatus === "COMPLETED" ? completionMessage : null,
      },
    });

    if (isCompleting) {
      await tx.todoCompletion.create({
        data: {
          todoId: todo.id,
          completedById: user.id,
          message: completionMessage,
        },
      });
    }

    await tx.todoStatusHistory.create({
      data: {
        todoId: todo.id,
        changedById: user.id,
        fromStatus: todo.status,
        toStatus: nextStatus,
        reason: isReopening
          ? reopenReason
          : isCompleting
            ? completionMessage
            : null,
      },
    });
  });

  refreshTodoPages(todo.projectId, todo.id);

  return { success: true };
}

export async function deleteTodo(formData) {
  const user = await getRequiredUser();
  const todoId = readText(formData, "todoId");

  if (!todoId) throw new Error("Todo ID is required.");

  const hasAccess = await canAccessTodo(todoId, user);

  if (!hasAccess) {
    throw new Error("You don't have permission to delete this Todo.");
  }

  const todo = await prisma.todo.findUnique({
    where: { id: todoId },
    select: {
      id: true,
      projectId: true,
      createdById: true,
    },
  });

  if (!todo) throw new Error("Todo not found.");

  if (user.role !== "ADMIN" && todo.createdById !== user.id) {
    throw new Error(
      "Only an admin or the Todo creator can delete it."
    );
  }

  await prisma.todo.delete({
    where: { id: todo.id },
  });

  refreshTodoPages(todo.projectId, todo.id);
}

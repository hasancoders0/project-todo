"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

function readText(formData, key) {
  return String(formData.get(key) ?? "").trim();
}

function readMemberIds(formData) {
  return [
    ...new Set(
      formData
        .getAll("memberIds")
        .map((id) => String(id).trim())
        .filter(Boolean),
    ),
  ];
}

function parseDate(value) {
  if (!value) return null;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    return undefined;
  }

  return date;
}

function validateProjectForm(formData) {
  const name = readText(formData, "name");
  const description = readText(formData, "description");
  const startAtValue = readText(formData, "startAt");
  const deadlineAtValue = readText(formData, "deadlineAt");
  const memberIds = readMemberIds(formData);

  if (!name) {
    return { error: "Please enter a project name." };
  }

  if (name.length > 120) {
    return { error: "Project name cannot exceed 120 characters." };
  }

  if (description.length > 2000) {
    return { error: "Description cannot exceed 2,000 characters." };
  }

  if (!deadlineAtValue) {
    return { error: "Please select a project deadline." };
  }

  if (memberIds.length === 0) {
    return { error: "Please select at least one team member." };
  }

  const startAt = parseDate(startAtValue);
  const deadlineAt = parseDate(deadlineAtValue);

  if (startAt === undefined) {
    return { error: "Please enter a valid start date." };
  }

  if (!deadlineAt) {
    return { error: "Please enter a valid deadline." };
  }

  if (startAt && startAt > deadlineAt) {
    return {
      error: "The start date cannot be after the project deadline.",
    };
  }

  return {
    data: {
      name,
      description: description || null,
      startAt,
      deadlineAt,
      memberIds,
    },
  };
}

async function validateMembers(memberIds) {
  const members = await prisma.user.findMany({
    where: {
      id: { in: memberIds },
    },
    select: {
      id: true,
    },
  });

  return members.length === memberIds.length;
}

function refreshProjectPaths(projectId) {
  revalidatePath("/dashboard");
  revalidatePath("/projects");
  revalidatePath("/todos");
  revalidatePath("/completed");

  if (projectId) {
    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/projects/${projectId}/edit`);
  }
}

export async function createProject(previousState, formData) {
  const user = await requireAdmin();
  const validation = validateProjectForm(formData);

  if (validation.error) {
    return { error: validation.error };
  }

  const { data } = validation;

  try {
    const membersExist = await validateMembers(data.memberIds);

    if (!membersExist) {
      return {
        error:
          "One or more selected team members no longer exist. Refresh and try again.",
      };
    }

    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        startAt: data.startAt,
        deadlineAt: data.deadlineAt,
        creator: {
          connect: { id: user.id },
        },
        members: {
          create: data.memberIds.map((userId) => ({
            user: {
              connect: { id: userId },
            },
          })),
        },
      },
      select: {
        id: true,
      },
    });

    refreshProjectPaths(project.id);

    redirect(`/projects/${project.id}`);
  } catch (error) {
    // Next.js redirect throws internally. Let it reach Next.js unchanged.
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      String(error.digest).startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    console.error("Create project failed:", error);

    return {
      error: "The project could not be created. Please try again.",
    };
  }
}

export async function deleteProject(formData) {
  await requireAdmin();

  const projectId = String(formData.get("projectId") ?? "").trim();

  if (!projectId) {
    return { error: "The project ID is missing." };
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
      },
    });

    if (!project) {
      return { error: "This project no longer exists." };
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    revalidatePath("/dashboard");
    revalidatePath("/projects");
    revalidatePath("/todos");
    revalidatePath("/completed");

  } catch (error) {
    console.error("Delete project failed:", error);

    return {
      error:
        "The project could not be deleted. It may contain related records that must be handled first.",
    };
  }

  redirect("/projects");
}

export async function updateProject(previousState, formData) {
  await requireAdmin();

  const projectId = readText(formData, "projectId");

  if (!projectId) {
    return { error: "The project ID is missing." };
  }

  const validation = validateProjectForm(formData);

  if (validation.error) {
    return { error: validation.error };
  }

  const { data } = validation;

  try {
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });

    if (!existingProject) {
      return { error: "This project no longer exists." };
    }

    const membersExist = await validateMembers(data.memberIds);

    if (!membersExist) {
      return {
        error:
          "One or more selected team members no longer exist. Refresh and try again.",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.project.update({
        where: { id: projectId },
        data: {
          name: data.name,
          description: data.description,
          startAt: data.startAt,
          deadlineAt: data.deadlineAt,
        },
      });

      // Replace the existing memberships with the submitted selection.
      await tx.project.update({
        where: { id: projectId },
        data: {
          members: {
            deleteMany: {},
          },
        },
      });

      await tx.project.update({
        where: { id: projectId },
        data: {
          members: {
            create: data.memberIds.map((userId) => ({
              user: {
                connect: { id: userId },
              },
            })),
          },
        },
      });
    });

    refreshProjectPaths(projectId);
  } catch (error) {
    console.error("Update project failed:", error);

    return {
      error: "The project could not be updated. Please try again.",
    };
  }

  redirect(`/projects/${projectId}`);
}

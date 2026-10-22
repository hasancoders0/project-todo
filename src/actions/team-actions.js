
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

/**
 * Get the current logged-in user.
 */
async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("project-todo-user")?.value;

  if (!userId) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
    },
  });
}

/**
 * Verify that the current user is an administrator.
 */
async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    throw new Error("Only administrators can manage team members.");
  }

  return user;
}

/**
 * Log in using a username.
 */
export async function loginWithUsername(formData) {
  const username = String(formData.get("username") || "")
    .trim()
    .toLowerCase();

  if (!username) {
    redirect("/login?error=missing-username");
  }

  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!user) {
    redirect("/login?error=user-not-found");
  }

  const cookieStore = await cookies();

  cookieStore.set("project-todo-user", user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect("/dashboard");
}

/**
 * Log out the current user.
 */
export async function logout() {
  const cookieStore = await cookies();

  cookieStore.delete("project-todo-user");

  redirect("/login");
}

/**
 * Create a new team member.
 */
export async function createTeamMember(formData) {
  await requireAdmin();

  const name = String(formData.get("name") || "").trim();
  const username = String(formData.get("username") || "")
    .trim()
    .toLowerCase();

  if (!name || !username) {
    throw new Error("Name and username are required.");
  }

  if (name.length > 100) {
    throw new Error("Name must be 100 characters or fewer.");
  }

  if (username.length > 50) {
    throw new Error("Username must be 50 characters or fewer.");
  }

  if (!/^[a-z0-9_-]+$/.test(username)) {
    throw new Error(
      "Username can contain lowercase letters, numbers, underscores, and hyphens only."
    );
  }

  try {
    await prisma.user.create({
      data: {
        name,
        username,
        role: "MEMBER",
      },
    });
  } catch (error) {
    if (error?.code === "P2002") {
      throw new Error("This username is already taken.");
    }

    throw error;
  }

  revalidatePath("/team");
  revalidatePath("/projects");
  revalidatePath("/todos");
  revalidatePath("/dashboard");
}

/**
 * Replace a member's project assignments with the selected projects.
 */
export async function updateTeamMemberProjects(formData) {
  await requireAdmin();

  const userId = String(formData.get("userId") || "").trim();

  const projectIds = [
    ...new Set(
      formData
        .getAll("projectIds")
        .map((value) => String(value).trim())
        .filter(Boolean)
    ),
  ];

  if (!userId) {
    throw new Error("Member ID is required.");
  }

  const member = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
    },
  });

  if (!member || member.role !== "MEMBER") {
    throw new Error("Team member was not found.");
  }

  const projects = await prisma.project.findMany({
    where: {
      id: { in: projectIds },
    },
    select: { id: true },
  });

  if (projects.length !== projectIds.length) {
    throw new Error("One or more selected projects do not exist.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.projectMember.deleteMany({
      where: { userId },
    });

    if (projectIds.length > 0) {
      await tx.projectMember.createMany({
        data: projectIds.map((projectId) => ({
          userId,
          projectId,
        })),
        skipDuplicates: true,
      });
    }
  });

  revalidatePath("/team");
  revalidatePath("/projects");
  revalidatePath("/todos");
  revalidatePath("/completed");
  revalidatePath("/dashboard");
}

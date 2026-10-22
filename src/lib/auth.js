
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("project-todo-user")?.value;

  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId },
  });
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  return user;
}

export async function requireAdmin() {
  const user = await requireUser();

  if (user.role !== "ADMIN") redirect("/dashboard");

  return user;
}

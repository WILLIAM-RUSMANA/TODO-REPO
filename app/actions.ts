"use server";

import { auth } from "@/auth";
import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";

export async function addTodo(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  // ... rest of your code
}

export async function handleTodo(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return;
  await prisma.todo.create({
    data: { content: formData.get("content") as string, userId: session.user.id },
  });
  revalidatePath("/");
}

export async function toggleTodo(id: string, completed: boolean) {
  await prisma.todo.update({ where: { id }, data: { completed: !completed } });
  revalidatePath("/");
}

export async function deleteTodo(id: string) {
  await prisma.todo.delete({ where: { id } });
  revalidatePath("/");
}
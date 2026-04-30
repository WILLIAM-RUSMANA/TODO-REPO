"use server";

import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function createTodo(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const content = formData.get("content") as string;

  try {
    await prisma.todo.create({
      data: {
        content,
        userId: session.user.id,
      },
    });
    revalidatePath("/");
  } catch (error) {
    return { error: "Failed to create todo" };
  }
}

export async function toggleTodo(id: string, completed: boolean) {
  try {
    await prisma.todo.update({
      where: { id },
      data: { completed: !completed },
    });
    revalidatePath("/");
  } catch (error) {
    return { error: "Update failed" };
  }
}

export async function deleteTodo(id: string) {
  try {
    await prisma.todo.delete({ where: { id } });
    revalidatePath("/");
  } catch (error) {
    return { error: "Deletion failed" };
  }
}
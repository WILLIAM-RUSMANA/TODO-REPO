"use server";

import { auth } from "@/auth";
// import { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma"; //  This uses the better-sqlite3 instance we verified earlier
import { revalidatePath } from "next/cache";

// const prisma = new PrismaClient();

export async function createTodo(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const content = formData.get("content") as string;
  if (!content) return; // Prevent creating empty todos

  try {
    await prisma.todo.create({
      data: {
        content,
        userId: session.user.id,
      },
    });
    
    revalidatePath("/");
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to create todo"); 
  }
}

export async function toggleTodo(id: string, completed: boolean) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    await prisma.todo.update({
      where: { id },
      data: { completed: !completed },
    });
    
    revalidatePath("/");
  } catch (error) {
    console.error("Failed to toggle todo:", error);
    throw new Error("Failed to update task status"); //  Throwing instead of returning keeps TS happy!
  }
}

export async function deleteTodo(id: string) {
  try {
    await prisma.todo.delete({ where: { id } });
    revalidatePath("/");
  } catch (error) {
    console.error("Failed to delete todo:", error);
    throw new Error("Failed to delete task");
  }
}
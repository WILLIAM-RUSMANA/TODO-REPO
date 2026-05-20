// app/page.tsx

export const dynamic = "force-dynamic";

import { auth, signIn, signOut } from "@/auth";
import { createTodo, deleteTodo, toggleTodo } from "./actions/todoActions";
import { prisma } from "@/lib/prisma";
import { Trash2, CheckCircle, Circle, LogOut, Plus } from "lucide-react";

// const prisma = new PrismaClient();

export default async function Home() {
  const session = await auth();

  if (!session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
          <h1 className="text-2xl font-bold mb-6">Welcome to TaskMaster</h1>
          <form action={async () => { "use server"; await signIn("google"); }}>
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
              Sign in with Google
            </button>
          </form>
        </div>
      </main>
    );
  }

  const todos = await prisma.todo.findMany({
    where: { userId: session.user?.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <header className="px-6 py-4 bg-white border-b flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">My Tasks</h1>
          <form action={async () => { "use server"; await signOut(); }}>
            <button className="text-gray-500 hover:text-red-500 transition">
              <LogOut size={20} />
            </button>
          </form>
        </header>

        {/* Input Form */}
        <form action={createTodo} className="p-6 flex gap-2">
          <input
            name="content"
            placeholder="Add a new task..."
            required
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition">
            <Plus size={24} />
          </button>
        </form>

        {/* List */}
        <ul className="divide-y border-t">
          {todos.map((todo: { id: string; content: string; completed: boolean }) => (
            <li key={todo.id} className="flex items-center justify-between p-6 hover:bg-gray-50">
              <div className="flex items-center gap-4 flex-1">
                <form action={toggleTodo.bind(null, todo.id, todo.completed)}>
                  <button className="text-blue-500">
                    {todo.completed ? <CheckCircle /> : <Circle />}
                  </button>
                </form>
                <span className={`text-lg ${todo.completed ? "line-through text-gray-400" : "text-gray-700"}`}>
                  {todo.content}
                </span>
              </div>
              
              <form action={deleteTodo.bind(null, todo.id)}>
                <button className="text-gray-300 hover:text-red-500 transition">
                  <Trash2 size={20} />
                </button>
              </form>
            </li>
          ))}
          {todos.length === 0 && (
            <p className="p-10 text-center text-gray-400">No tasks found. Start by adding one!</p>
          )}
        </ul>
      </div>
    </main>
  );
}
import { TodoApp } from "@/components/todo-app";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center gap-8 bg-zinc-50 px-4 py-16 dark:bg-black">
      <h1 className="text-4xl font-semibold tracking-tight">Задачи</h1>
      <TodoApp />
    </main>
  );
}

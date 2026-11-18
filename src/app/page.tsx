import { TodoList } from "@/components/todo-list";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center gap-8 bg-zinc-50 px-4 py-16 dark:bg-black">
      <h1 className="text-4xl font-semibold tracking-tight">Задачи</h1>
      <div className="grid w-full max-w-5xl items-start gap-6 md:grid-cols-2">
        <TodoList list="work" title="Работни" autoFocus />
        <TodoList list="personal" title="Лични" />
      </div>
    </main>
  );
}

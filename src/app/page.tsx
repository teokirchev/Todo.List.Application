import { ListChecks } from "lucide-react";
import { TodoList } from "@/components/todo-list";

export default function Home() {
  return (
    <main className="relative isolate flex flex-1 flex-col items-center overflow-hidden bg-zinc-50 px-4 py-12 sm:py-16 dark:bg-zinc-950">
      {/* Decorative background glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-24 size-112 rounded-full bg-indigo-300/40 blur-3xl dark:bg-indigo-600/20" />
        <div className="absolute -top-24 -right-24 size-112 rounded-full bg-rose-300/40 blur-3xl dark:bg-rose-600/15" />
        <div className="absolute bottom-0 left-1/2 size-96 -translate-x-1/2 rounded-full bg-amber-200/30 blur-3xl dark:bg-amber-500/10" />
      </div>

      <header className="mb-10 flex flex-col items-center gap-3 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 via-violet-500 to-rose-500 text-white shadow-xl shadow-violet-500/30">
          <ListChecks className="size-8" aria-hidden />
        </span>
        <h1 className="bg-linear-to-r from-indigo-600 via-violet-600 to-rose-500 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl dark:from-indigo-400 dark:via-violet-400 dark:to-rose-400">
          Задачи
        </h1>
        <p className="max-w-md text-zinc-500 dark:text-zinc-400">
          Работата и личният живот – подредени на едно място.
        </p>
      </header>

      <div className="grid w-full max-w-5xl items-start gap-6 md:grid-cols-2">
        <TodoList list="work" autoFocus />
        <TodoList list="personal" />
      </div>
    </main>
  );
}

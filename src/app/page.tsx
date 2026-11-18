import { ClubCrest } from "@/components/club-emblem";
import { TodoList } from "@/components/todo-list";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center px-4 py-10 sm:py-12">
      <header className="mb-10 flex flex-col items-center gap-3 text-center text-white">
        <ClubCrest className="h-28 w-auto drop-shadow-[0_10px_20px_rgb(0_0_0/0.35)]" />
        <p className="font-display text-sm tracking-[0.35em] text-white/80 uppercase">
          The Gunners <span className="text-club-gold">·</span> Est. 1886
        </p>
        <h1 className="font-display text-5xl font-bold tracking-wide uppercase drop-shadow sm:text-6xl">
          Задачи
        </h1>
        <p className="font-display text-lg tracking-wider text-white/85 italic">
          Victoria Concordia Crescit
        </p>
      </header>

      <div className="grid w-full max-w-5xl items-start gap-6 md:grid-cols-2">
        <TodoList list="work" autoFocus />
        <TodoList list="personal" />
      </div>
    </main>
  );
}

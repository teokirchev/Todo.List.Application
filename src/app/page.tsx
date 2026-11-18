import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "@/app/actions";
import { ClubCrest } from "@/components/club-emblem";
import { TodoBoard } from "@/components/todo-board";
import { TodoList } from "@/components/todo-list";
import { getCurrentUser, type User } from "@/lib/auth";
import { getTodoLists } from "@/lib/todo-repo";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center px-4 py-10 sm:py-12">
      <header className="mb-8 flex flex-col items-center gap-3 text-center text-white">
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

      {/* Reads the session, so it streams in behind the boundary while the header shows instantly. */}
      <Suspense fallback={<BoardPlaceholder />}>
        <Board />
      </Suspense>
    </main>
  );
}

async function Board() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const todos = await getTodoLists(user.id);

  return (
    <>
      <UserBar user={user} />
      <TodoBoard initial={todos} />
    </>
  );
}

function UserBar({ user }: { user: User }) {
  const initial = user.name.trim().charAt(0).toUpperCase() || "?";
  return (
    <div className="mb-5 flex w-full max-w-5xl items-center justify-end gap-3 text-white">
      <span className="flex size-8 items-center justify-center rounded-full bg-white font-display text-sm font-semibold text-club-red shadow">
        {initial}
      </span>
      <span className="truncate text-sm font-medium" title={user.email}>
        {user.name}
      </span>
      <form action={signOut}>
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded-lg bg-black/20 px-3 py-1.5 text-sm font-medium ring-1 ring-white/20 transition hover:bg-black/30"
        >
          <LogOut className="size-4" aria-hidden />
          Изход
        </button>
      </form>
    </div>
  );
}

function BoardPlaceholder() {
  return (
    <>
      <div className="mb-5 h-8 w-full max-w-5xl" />
      <div className="grid w-full max-w-5xl items-start gap-6 md:grid-cols-2" aria-busy>
        <TodoList list="work" todos={null} />
        <TodoList list="personal" todos={null} />
      </div>
    </>
  );
}

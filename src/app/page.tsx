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
    <main className="relative flex flex-1 flex-col items-center px-4 py-10 sm:py-12">
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
    // Pinned to the top-right corner of the page; on phones only the initial and the icon, so it clears the crest.
    <div className="absolute top-4 right-4 flex items-center gap-2 text-white sm:top-6 sm:right-6 sm:gap-3">
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white font-display text-sm font-semibold text-club-red shadow"
        title={`${user.name} (${user.email})`}
      >
        {initial}
      </span>
      <span className="hidden max-w-48 truncate text-sm font-medium sm:inline" title={user.email}>
        {user.name}
      </span>
      <form action={signOut}>
        <button
          type="submit"
          aria-label="Изход"
          className="flex items-center gap-1.5 rounded-lg bg-black/20 px-2 py-1.5 text-sm font-medium ring-1 ring-white/20 transition hover:bg-black/30 sm:px-3"
        >
          <LogOut className="size-4" aria-hidden />
          <span className="hidden sm:inline">Изход</span>
        </button>
      </form>
    </div>
  );
}

function BoardPlaceholder() {
  return (
    <div className="grid w-full max-w-5xl items-start gap-6 md:grid-cols-2" aria-busy>
      <TodoList list="work" todos={null} />
      <TodoList list="personal" todos={null} />
    </div>
  );
}

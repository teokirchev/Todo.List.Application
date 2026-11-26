import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShowLoader } from "@/components/show-loader";
import { connection } from "next/server";
import { LogOut } from "lucide-react";
import { signOut } from "@/app/actions";
import { ClubCrest } from "@/components/club-emblem";
import { TeamPicker } from "@/components/team-picker";
import { TeamText } from "@/components/team-text";
import { getCurrentUser } from "@/lib/auth";
import { getUserTeam } from "@/lib/todo-repo";

export const metadata: Metadata = {
  title: "Профил · Задачи",
};

export default function ProfilePage({ searchParams }: PageProps<"/profile">) {
  return (
    <main className="flex flex-1 flex-col items-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border-4 border-white bg-white shadow-2xl shadow-black/25 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="relative flex flex-col items-center gap-2 overflow-hidden bg-linear-to-br from-club-primary to-club-primary-dark px-6 pt-8 pb-6 text-center text-white">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(135deg,rgb(255_255_255/0.06)_0_14px,transparent_14px_28px)]"
          />
          <ClubCrest className="relative h-24 drop-shadow-[0_8px_16px_rgb(0_0_0/0.35)]" />
          <h1 className="relative font-display text-4xl font-bold tracking-wide uppercase">Профил</h1>
          <p className="relative font-display text-sm tracking-[0.3em] text-white/80 uppercase">
            <TeamText field="name" /> · <TeamText field="nickname" />
          </p>
        </div>

        <Suspense
          fallback={
            <div className="h-64 animate-pulse bg-zinc-50 dark:bg-zinc-900">
              <ShowLoader />
            </div>
          }
        >
          <ProfileBody searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function ProfileBody({ searchParams }: { searchParams: PageProps<"/profile">["searchParams"] }) {
  // Reads the session (which checks its expiry against the clock), so it must run per request.
  await connection();
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const team = await getUserTeam(user.id);
  const { welcome } = await searchParams;

  return (
    <div className="flex flex-col gap-5 px-6 py-6">
      {welcome && !team && (
        <div className="rounded-2xl bg-club-accent/15 px-4 py-3 text-sm text-zinc-700 ring-1 ring-club-accent/30 dark:text-zinc-200">
          <p className="font-display text-base tracking-wide uppercase">Добре дошъл, {user.name.split(" ")[0]}!</p>
          <p className="mt-1">Избери любимия си отбор – приложението ще се оцвети в неговите цветове. Можеш да го смениш по всяко време от тази страница.</p>
        </div>
      )}

      <div className="flex items-center gap-3 rounded-2xl bg-zinc-50 p-3 ring-1 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-800">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-club-primary font-display text-lg font-semibold text-white">
          {user.name.trim().charAt(0).toUpperCase() || "?"}
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium">{user.name}</p>
          <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">{user.email}</p>
        </div>
      </div>

      <TeamPicker initial={team} />

      <form action={signOut} className="flex justify-center border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
        >
          <LogOut className="size-4" aria-hidden />
          Изход
        </button>
      </form>
    </div>
  );
}

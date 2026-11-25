import { Suspense } from "react";
import type { Metadata } from "next";
import { ClubCrest } from "@/components/club-emblem";
import { isInviteOnly } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Вход · Задачи",
};

const ERRORS: Record<string, string> = {
  not_allowed: "Този Google акаунт няма достъп. Помоли собственика на приложението да те добави.",
  failed: "Входът не успя. Опитай пак.",
  config: "Входът с Google още не е настроен.",
};

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <main className="flex flex-1 flex-col items-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-sm overflow-hidden rounded-3xl border-4 border-white bg-white text-center shadow-2xl shadow-black/25 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3 bg-linear-to-br from-club-red to-club-red-dark px-6 pt-8 pb-6 text-white">
          <ClubCrest className="h-24 w-auto drop-shadow-[0_8px_16px_rgb(0_0_0/0.35)]" />
          <h1 className="font-display text-4xl font-bold tracking-wide uppercase">Задачи</h1>
          <p className="font-display text-sm tracking-[0.3em] text-white/80 uppercase">The Gunners</p>
        </div>

        <div className="flex flex-col gap-4 px-6 py-7">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Влез с Google акаунта си, за да видиш задачите си на всяко устройство.
          </p>

          <Suspense>
            <LoginError searchParams={searchParams} />
          </Suspense>

          {/* A plain link: the route handler redirects to Google. */}
          <a
            href="/auth/google"
            className="flex items-center justify-center gap-3 rounded-2xl border border-zinc-300 bg-white px-4 py-3 font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            <GoogleLogo className="size-5" />
            Вход с Google
          </a>

          <p className="text-xs text-zinc-400">
            {isInviteOnly() ? "Достъп имат само поканени акаунти." : "Влизането е с Google акаунт."} ·{" "}
            <a href="/privacy" className="underline hover:text-zinc-600 dark:hover:text-zinc-200">
              Поверителност
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}

async function LoginError({ searchParams }: { searchParams: PageProps<"/login">["searchParams"] }) {
  const { error } = await searchParams;
  const message = typeof error === "string" ? ERRORS[error] : undefined;
  if (!message) return null;
  return (
    <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-club-red-dark dark:bg-red-500/10 dark:text-red-300">
      {message}
    </p>
  );
}

function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

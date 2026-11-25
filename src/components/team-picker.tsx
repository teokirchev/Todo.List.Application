"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, Check, LoaderCircle } from "lucide-react";
import { saveTeam } from "@/app/actions";
import { applyTeam } from "@/components/team-sync";
import { TEAMS, type TeamId } from "@/lib/teams";

/** Club select on the profile page: the theme changes at once and the choice is saved to the account. */
export function TeamPicker({ initial }: { initial: TeamId | null }) {
  const [team, setTeam] = useState<TeamId | null>(initial);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function choose(next: TeamId) {
    const previous = team;
    setTeam(next);
    setSaved(false);
    setError(null);
    applyTeam(next);
    startTransition(async () => {
      try {
        await saveTeam(next);
        setSaved(true);
      } catch {
        setError("Изборът не беше запазен. Опитай пак.");
        setTeam(previous);
        if (previous) applyTeam(previous);
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="font-display text-xs tracking-widest text-zinc-500 uppercase dark:text-zinc-400">Любим отбор</span>
        <select
          value={team ?? ""}
          onChange={(e) => choose(e.target.value as TeamId)}
          className="h-12 w-full cursor-pointer rounded-2xl border border-zinc-200 bg-white px-4 text-base font-medium ring-4 ring-transparent transition outline-none focus:border-club-primary focus:ring-club-primary/15 dark:border-zinc-700 dark:bg-zinc-900"
        >
          {team === null && (
            <option value="" disabled>
              Избери отбор…
            </option>
          )}
          {TEAMS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </label>

      <p className="flex h-5 items-center gap-1.5 text-sm" role="status" aria-live="polite">
        {pending ? (
          <>
            <LoaderCircle className="size-4 animate-spin text-zinc-400" aria-hidden />
            <span className="text-zinc-500">Запазване…</span>
          </>
        ) : error ? (
          <span className="text-red-600 dark:text-red-400">{error}</span>
        ) : saved ? (
          <>
            <Check className="size-4 text-emerald-600" aria-hidden />
            <span className="text-zinc-600 dark:text-zinc-300">Запазено. Темата важи на всичките ти устройства.</span>
          </>
        ) : null}
      </p>

      {team ? (
        <Link
          href="/"
          className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-club-primary px-4 font-display font-medium tracking-wide text-white uppercase shadow-lg shadow-club-primary/30 transition hover:bg-club-primary-dark active:scale-[0.98]"
        >
          Към задачите
          <ArrowRight className="size-5" aria-hidden />
        </Link>
      ) : (
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">Избери отбор, за да продължиш.</p>
      )}
    </div>
  );
}

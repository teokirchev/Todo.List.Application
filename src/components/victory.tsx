"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import type { ListName } from "@/lib/todos";

// Celebration when every todo in a list is done: from the bottom of the screen two arms in club
// sleeves lift a golden trophy, "ШАМПИОН!" appears and confetti bursts up. It never blocks the
// page (clicks go through) and goes back down by itself; Esc sends it away sooner.

/** Leaves time for the row's cannon shot to play first. */
const START_DELAY_MS = 900;
/** How long the trophy stays up before it goes back down. */
const SHOW_MS = 3000;
/** Length of the way down (matches .victory-leaving in globals.css). */
const LEAVE_MS = 600;

const LIST_LABEL: Record<ListName, string> = {
  work: "Всички работни задачи са готови",
  personal: "Всички лични задачи са готови",
};

// Club colours of the active team, plus white and a light gold.
const CONFETTI_COLORS = ["var(--team-primary)", "#ffffff", "var(--team-accent)", "var(--team-secondary)", "#f5d97a"];

type Piece = {
  /** Start, in % of the screen width (around the trophy). */
  left: number;
  drift: number;
  /** How high it flies, in px. */
  rise: number;
  spin: number;
  delay: number;
  duration: number;
  color: string;
  round: boolean;
  size: number;
};
type Victory = {
  id: number;
  list: ListName;
  pieces: Piece[];
  reducedMotion: boolean;
};

const listeners = new Set<(list: ListName) => void>();

/** Shows the trophy for `list` (after the row's cannon shot). */
export function celebrateVictory(list: ListName) {
  listeners.forEach((listener) => listener(list));
}

function makeConfetti(count: number): Piece[] {
  return Array.from({ length: count }, () => ({
    left: 30 + Math.random() * 40,
    drift: (Math.random() - 0.5) * 520,
    rise: 260 + Math.random() * 320,
    spin: (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 720),
    // All of it lands within SHOW_MS.
    delay: 600 + Math.random() * 500,
    duration: 1600 + Math.random() * 900,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    round: Math.random() < 0.3,
    size: 6 + Math.random() * 6,
  }));
}

/** Mount once. */
export function VictoryLayer() {
  const [victory, setVictory] = useState<Victory | null>(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let startTimer: ReturnType<typeof setTimeout> | undefined;
    const listener = (list: ListName) => {
      clearTimeout(startTimer);
      startTimer = setTimeout(() => {
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        setLeaving(false);
        setVictory({
          id: Date.now(),
          list,
          pieces: reducedMotion ? [] : makeConfetti(60),
          reducedMotion,
        });
      }, START_DELAY_MS);
    };
    listeners.add(listener);
    return () => {
      clearTimeout(startTimer);
      listeners.delete(listener);
    };
  }, []);

  const leave = useCallback(() => setLeaving(true), []);

  // Goes down by itself after a while, or straight away on Esc.
  useEffect(() => {
    if (!victory) return;
    const t = setTimeout(leave, SHOW_MS);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && leave();
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [victory, leave]);

  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(() => setVictory(null), LEAVE_MS);
    return () => clearTimeout(t);
  }, [leaving]);

  if (!victory) return null;

  return (
    <div
      key={victory.id}
      role='status'
      aria-live='polite'
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-60 h-svh overflow-hidden ${
        leaving ? "victory-leaving" : ""
      } ${victory.reducedMotion ? "victory-still" : ""}`}
    >
      {victory.pieces.map((p, i) => (
        <span
          key={i}
          aria-hidden
          className='victory-confetti absolute bottom-24'
          style={
            {
              left: `${p.left}%`,
              width: p.size,
              height: p.round ? p.size : p.size * 1.6,
              borderRadius: p.round ? "9999px" : "2px",
              background: p.color,
              "--drift": `${p.drift}px`,
              "--rise": `${p.rise}px`,
              "--spin": `${p.spin}deg`,
              animationDelay: `${p.delay}ms`,
              animationDuration: `${p.duration}ms`,
            } as CSSProperties
          }
        />
      ))}

      <div className='victory-lift absolute bottom-0 left-1/2 flex w-72 flex-col items-center text-center sm:w-80'>
        <p className='victory-title font-display text-4xl font-bold tracking-wider text-club-accent uppercase sm:text-5xl'>
          Шампион!
        </p>
        <p className='victory-subtitle mt-1 rounded-full bg-zinc-950/75 px-3 py-1 text-sm font-medium text-white sm:text-base'>
          {LIST_LABEL[victory.list]}
        </p>
        <div className='relative mt-2 w-full'>
          <div aria-hidden className='victory-rays absolute top-[22%] left-1/2 size-80' />
          <TrophyLift className='victory-trophy relative w-full drop-shadow-[0_10px_24px_rgb(0_0_0/0.35)]' />
        </div>
      </div>
    </div>
  );
}

/** Two arms in club sleeves holding up an original, generic golden cup. */
function TrophyLift({ className }: { className?: string }) {
  return (
    <svg viewBox='0 0 200 290' overflow='visible' aria-hidden className={className}>
      <defs>
        <linearGradient id='victory-gold' x1='0' x2='1' y1='0' y2='0'>
          <stop offset='0' stopColor='#b08a35' />
          <stop offset='0.35' stopColor='#f5d97a' />
          <stop offset='0.6' stopColor='#d9b452' />
          <stop offset='1' stopColor='#9c7a2b' />
        </linearGradient>
        <linearGradient id='victory-gold-dark' x1='0' x2='0' y1='0' y2='1'>
          <stop offset='0' stopColor='#c9a54c' />
          <stop offset='1' stopColor='#7a5c1c' />
        </linearGradient>
      </defs>

      {/* arms: forearms, then sleeves in the team colour down to the edge of the screen */}
      <g strokeLinecap='round' fill='none'>
        <path d='M66 120 50 205' stroke='#d9a066' strokeWidth='20' />
        <path d='M134 120l16 85' stroke='#d9a066' strokeWidth='20' />
        <path d='M50 200 34 420' stroke='var(--team-primary)' strokeWidth='32' />
        <path d='m150 200 16 220' stroke='var(--team-primary)' strokeWidth='32' />
        <path d='M50 200 34 420' stroke='#fff' strokeOpacity='.18' strokeWidth='6' />
        <path d='m150 200 16 220' stroke='#fff' strokeOpacity='.18' strokeWidth='6' />
      </g>

      {/* the cup */}
      <g transform='translate(40 0)'>
        <path d='M31 28C9 28 7 62 37 67' fill='none' stroke='url(#victory-gold)' strokeWidth='7' strokeLinecap='round' />
        <path d='M89 28c22 0 24 34-6 39' fill='none' stroke='url(#victory-gold)' strokeWidth='7' strokeLinecap='round' />
        <path d='M28 18h64v22c0 24-14 40-32 42-18-2-32-18-32-42z' fill='url(#victory-gold)' />
        <rect x='23' y='12' width='74' height='9' rx='4.5' fill='#f2d377' />
        <path d='M38 26c-2 20 2 36 10 46' fill='none' stroke='#fff' strokeOpacity='.45' strokeWidth='4' strokeLinecap='round' />
        <path d='m60 34 3.8 7.7 8.5 1.2-6.2 6 1.5 8.4L60 53.3l-7.6 4 1.5-8.4-6.2-6 8.5-1.2z' fill='#fff8dc' fillOpacity='.9' />
        <path d='M54 82h12l-2 17h-8z' fill='url(#victory-gold-dark)' />
        <rect x='47' y='97' width='26' height='7' rx='3.5' fill='#d9b452' />
        <path d='M38 104h44l5 22H33z' fill='url(#victory-gold-dark)' />
        <rect x='45' y='110' width='30' height='9' rx='2' fill='#5c4413' />
        <rect x='30' y='125' width='60' height='8' rx='3' fill='#6b5018' />
      </g>

      {/* hands gripping the base */}
      <circle cx='68' cy='118' r='11' fill='#e0ac72' />
      <circle cx='132' cy='118' r='11' fill='#e0ac72' />
      <path d='M62 112h9M62 117h10M63 122h8M129 112h9M128 117h10M129 122h8' stroke='#b9824b' strokeWidth='1.6' strokeLinecap='round' />
    </svg>
  );
}

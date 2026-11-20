"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import type { ListName } from "@/lib/todos";

// Full-screen celebration when every todo in a list is done: a golden trophy with light rays,
// "ШАМПИОН!" and falling confetti in club colours.

/** Leaves time for the row's cannon shot to play first. */
const START_DELAY_MS = 900;
const FADE_OUT_MS = 400;

const LIST_LABEL: Record<ListName, string> = {
  work: "Всички работни задачи са готови",
  personal: "Всички лични задачи са готови",
};

const CONFETTI_COLORS = ["#ef0107", "#ffffff", "#c9a54c", "#063672", "#f5d97a"];

type Piece = {
  left: number;
  drift: number;
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
    left: Math.random() * 100,
    drift: (Math.random() - 0.5) * 160,
    spin: (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 720),
    delay: Math.random() * 900,
    duration: 2400 + Math.random() * 1600,
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
        const reducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        setLeaving(false);
        setVictory({
          id: Date.now(),
          list,
          pieces: reducedMotion ? [] : makeConfetti(70),
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

  const close = useCallback(() => setLeaving(true), []);

  // Stays up until dismissed with Esc (or a click on the overlay), then unmounts after the fade-out.
  useEffect(() => {
    if (!victory) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [victory, close]);

  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(() => setVictory(null), FADE_OUT_MS);
    return () => clearTimeout(t);
  }, [leaving]);

  if (!victory) return null;

  return (
    <div
      key={victory.id}
      role='status'
      aria-live='polite'
      onClick={close}
      className={`victory-backdrop fixed inset-0 z-[60] flex cursor-pointer items-center justify-center overflow-hidden bg-black/65 backdrop-blur-sm ${
        leaving ? "victory-leaving" : ""
      } ${victory.reducedMotion ? "victory-still" : ""}`}
    >
      {victory.pieces.map((p, i) => (
        <span
          key={i}
          aria-hidden
          className='victory-confetti absolute top-0'
          style={
            {
              left: `${p.left}%`,
              width: p.size,
              height: p.round ? p.size : p.size * 1.6,
              borderRadius: p.round ? "9999px" : "2px",
              background: p.color,
              "--drift": `${p.drift}px`,
              "--spin": `${p.spin}deg`,
              animationDelay: `${p.delay}ms`,
              animationDuration: `${p.duration}ms`,
            } as CSSProperties
          }
        />
      ))}

      <div className='relative flex flex-col items-center px-6 text-center'>
        <div
          aria-hidden
          className='victory-rays pointer-events-none absolute top-[38%] left-1/2 size-[34rem] max-w-[160vw]'
        />
        <TrophyArt className='victory-trophy relative w-44 drop-shadow-[0_12px_30px_rgb(0_0_0/0.5)] sm:w-56' />
        <p className='victory-title relative mt-4 font-display text-5xl font-bold tracking-wider text-club-gold uppercase sm:text-7xl'>
          Шампион!
        </p>
        <p className='victory-subtitle relative mt-2 text-lg font-medium text-white sm:text-xl'>
          {LIST_LABEL[victory.list]}
        </p>
        <p className='victory-subtitle relative mt-6 text-xs tracking-widest text-white/50 uppercase'>
          Клик или Esc за затваряне
        </p>
      </div>
    </div>
  );
}

/** An original, generic golden cup. */
function TrophyArt({ className }: { className?: string }) {
  return (
    <svg viewBox='0 0 120 140' aria-hidden className={className}>
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
      {/* handles */}
      <path
        d='M31 28C9 28 7 62 37 67'
        fill='none'
        stroke='url(#victory-gold)'
        strokeWidth='7'
        strokeLinecap='round'
      />
      <path
        d='M89 28c22 0 24 34-6 39'
        fill='none'
        stroke='url(#victory-gold)'
        strokeWidth='7'
        strokeLinecap='round'
      />
      {/* cup */}
      <path
        d='M28 18h64v22c0 24-14 40-32 42-18-2-32-18-32-42z'
        fill='url(#victory-gold)'
      />
      <rect x='23' y='12' width='74' height='9' rx='4.5' fill='#f2d377' />
      <path
        d='M38 26c-2 20 2 36 10 46'
        fill='none'
        stroke='#fff'
        strokeOpacity='.45'
        strokeWidth='4'
        strokeLinecap='round'
      />
      <path
        d='m60 34 3.8 7.7 8.5 1.2-6.2 6 1.5 8.4L60 53.3l-7.6 4 1.5-8.4-6.2-6 8.5-1.2z'
        fill='#fff8dc'
        fillOpacity='.9'
      />
      {/* stem and base */}
      <path d='M54 82h12l-2 17h-8z' fill='url(#victory-gold-dark)' />
      <rect x='47' y='97' width='26' height='7' rx='3.5' fill='#d9b452' />
      <path d='M38 104h44l5 22H33z' fill='url(#victory-gold-dark)' />
      <rect x='45' y='110' width='30' height='9' rx='2' fill='#5c4413' />
      <rect x='30' y='125' width='60' height='8' rx='3' fill='#6b5018' />
    </svg>
  );
}

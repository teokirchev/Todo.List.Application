"use client";

import { useEffect, useState, type CSSProperties } from "react";

// When a todo is deleted, a referee's red card is raised over the row while the row is "sent off"
// (it shakes and slides out), then the todo is removed.

/** `x`/`y` is where the card is shown on screen (its bottom centre). */
type Card = { id: number; x: number; y: number };
type CardRequest = Omit<Card, "id">;

const listeners = new Set<(card: CardRequest) => void>();
let nextId = 0;

/** Length of the card animation; also drives the CSS through --card-duration. */
const DURATION_MS = 1600;
/** How long the row plays its "sent off" animation before it is actually removed. */
export const SEND_OFF_MS = 900;

/** True when animations are wanted (the user has not asked for reduced motion). */
export function wantsMotion() {
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Raises a red card over `row` (the todo's card on screen), near its right end where the buttons are. */
export function showRedCard(row: DOMRect) {
  if (!wantsMotion()) return;
  const x = Math.min(row.right - 70, window.innerWidth - 40);
  const card = { x: Math.max(40, x), y: row.top + row.height / 2 + 10 };
  listeners.forEach((listener) => listener(card));
}

/** Mount once; renders the cards in a fixed layer that never blocks clicks. */
export function RedCardLayer() {
  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    const listener = (request: CardRequest) => {
      const id = ++nextId;
      setCards((prev) => [...prev, { ...request, id }]);
      setTimeout(() => setCards((prev) => prev.filter((c) => c.id !== id)), DURATION_MS);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return (
    <div aria-hidden className='pointer-events-none fixed inset-0 z-50 overflow-hidden'>
      {cards.map(({ id, x, y }) => (
        <div
          key={id}
          className='absolute'
          style={{ left: x, top: y, "--card-duration": `${DURATION_MS}ms` } as CSSProperties}
        >
          <div className='red-card absolute bottom-0 -left-6 h-16 w-12 rounded-md' />
          <span className='red-card-label absolute -top-26 -left-20 w-40 text-center font-display text-xl font-bold tracking-wide text-red-600 uppercase'>
            Изгонен!
          </span>
        </div>
      ))}
    </div>
  );
}

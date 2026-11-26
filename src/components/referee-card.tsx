"use client";

import { useEffect, useState, type CSSProperties } from "react";

// A referee's card raised over a todo row:
// - red when the todo is deleted (the row is "sent off": it shakes and slides out, then is removed);
// - yellow when a finished todo is put back to open (a warning).

export type CardColor = "red" | "yellow";

/** `x`/`y` is where the card is shown on screen (its bottom centre). */
type Card = { id: number; x: number; y: number; color: CardColor };
type CardRequest = Omit<Card, "id">;

const listeners = new Set<(card: CardRequest) => void>();
let nextId = 0;

/** Length of the card animation; also drives the CSS through --card-duration. */
const DURATION_MS = 1600;
/** How long the row plays its "sent off" animation before it is actually removed. */
export const SEND_OFF_MS = 900;

const LOOK: Record<CardColor, { card: string; label: string; text: string }> = {
  red: { card: "referee-card-red", label: "text-red-600", text: "Изгонен!" },
  yellow: { card: "referee-card-yellow", label: "text-amber-500", text: "Жълт картон!" },
};

/** True when animations are wanted (the user has not asked for reduced motion). */
export function wantsMotion() {
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Raises a card over `row` (the todo's card on screen), near its right end where the buttons are. */
export function showCard(row: DOMRect, color: CardColor) {
  if (!wantsMotion()) return;
  const x = Math.min(row.right - 70, window.innerWidth - 40);
  const card = { x: Math.max(40, x), y: row.top + row.height / 2 + 10, color };
  listeners.forEach((listener) => listener(card));
}

/** Mount once; renders the cards in a fixed layer that never blocks clicks. */
export function RefereeCardLayer() {
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
      {cards.map(({ id, x, y, color }) => (
        <div
          key={id}
          className='absolute'
          style={{ left: x, top: y, "--card-duration": `${DURATION_MS}ms` } as CSSProperties}
        >
          <div className={`referee-card ${LOOK[color].card} absolute bottom-0 -left-6 h-16 w-12 rounded-md`} />
          <span
            className={`referee-card-label absolute -top-26 -left-28 w-56 text-center font-display text-xl font-bold tracking-wide uppercase ${LOOK[color].label}`}
          >
            {LOOK[color].text}
          </span>
        </div>
      ))}
    </div>
  );
}

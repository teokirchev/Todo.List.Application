"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { Cannon, FootballIcon } from "@/components/club-emblem";

// A one-off celebration: when a todo is ticked off, the cannon appears beside it, recoils,
// and fires a football across the row, which lands with a "ГОЛ!".

type Shot = { id: number; x: number; y: number; distance: number };
type ShotRequest = Omit<Shot, "id">;

const listeners = new Set<(shot: ShotRequest) => void>();
let nextId = 0;

/** Size of the cannon artwork, and where its muzzle sits inside it (measured on cannon.svg). */
const CANNON = 100;
const MUZZLE_X = CANNON * 0.82;
const MUZZLE_Y = CANNON * 0.41;
/** Length of the whole celebration; also drives the CSS animations through --shot-duration. */
const DURATION_MS = 3000;

/**
 * Fires the cannon from just left of `origin` (the checkbox), shooting `distance` px to the right.
 * Does nothing for people who prefer reduced motion.
 */
export function fireCannon(origin: DOMRect, distance: number) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const shot = {
    x: origin.left,
    y: origin.top + origin.height / 2,
    distance: Math.max(80, distance),
  };
  listeners.forEach((listener) => listener(shot));
}

/** Mount once; renders the shots in a fixed layer that never blocks clicks. */
export function CannonLayer() {
  const [shots, setShots] = useState<Shot[]>([]);

  useEffect(() => {
    const listener = (request: ShotRequest) => {
      const id = ++nextId;
      setShots((prev) => [...prev, { ...request, id }]);
      setTimeout(
        () => setShots((prev) => prev.filter((s) => s.id !== id)),
        DURATION_MS,
      );
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return (
    <div
      aria-hidden
      className='pointer-events-none fixed inset-0 z-50 overflow-hidden'
    >
      {shots.map((shot) => (
        <CannonShot key={shot.id} {...shot} />
      ))}
    </div>
  );
}

function CannonShot({ x, y, distance }: Shot) {
  // The muzzle sits just left of the checkbox; everything else is placed relative to it.
  const muzzleLeft = x - 6;
  const style = {
    left: muzzleLeft,
    top: y,
    "--dist": `${distance}px`,
    "--shot-duration": `${DURATION_MS}ms`,
  } as CSSProperties;

  return (
    <div className='absolute' style={style}>
      <div
        className='cannon-shot-cannon absolute'
        style={{
          left: -MUZZLE_X,
          top: -MUZZLE_Y,
          width: CANNON,
          height: CANNON,
        }}
      >
        <Cannon className='size-full text-club-gold' />
      </div>
      <span className='cannon-shot-flash absolute -top-3 -left-1 size-6 rounded-full' />
      <span className='cannon-shot-smoke absolute -top-2.5 -left-1 size-5 rounded-full bg-zinc-300/80' />
      <span className='cannon-shot-smoke cannon-shot-smoke-2 absolute -top-2 -left-1 size-4 rounded-full bg-zinc-300/70' />
      <span className='cannon-shot-smoke cannon-shot-smoke-3 absolute -top-3 -left-0.5 size-3.5 rounded-full bg-zinc-200/70' />
      <div className='cannon-shot-ball absolute -top-3 -left-3 size-6'>
        <FootballIcon className='size-full drop-shadow' />
      </div>
      <span className='cannon-shot-goal absolute -top-10 font-display text-2xl font-bold tracking-wide text-club-gold uppercase'>
        Гол!
      </span>
    </div>
  );
}

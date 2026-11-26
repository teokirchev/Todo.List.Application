import { useId } from "react";

/** A plain black-and-white football. */
export function FootballIcon({ className }: { className?: string }) {
  const clipId = useId();
  return (
    <svg viewBox="-20 -20 40 40" fill="none" aria-hidden className={className}>
      <defs>
        <clipPath id={clipId}>
          <circle r="18" />
        </clipPath>
      </defs>
      <circle r="18" fill="#fff" />
      <g clipPath={`url(#${clipId})`} fill="#18181b">
        <path d="M0-6.5 6.18-2.01 3.82 5.26h-7.64l-2.36-7.27z" />
        <circle cx="10" cy="-13.75" r="5.5" />
        <circle cx="16.17" cy="5.25" r="5.5" />
        <circle cy="17" r="5.5" />
        <circle cx="-16.17" cy="5.25" r="5.5" />
        <circle cx="-10" cy="-13.75" r="5.5" />
      </g>
      <path
        d="M0-6.5V-18M6.18-2.01l10.9-3.55M3.82 5.26l6.76 9.3M-3.82 5.26l-6.76 9.3M-6.18-2.01l-10.9-3.55"
        stroke="#18181b"
        strokeWidth="1.6"
      />
      <circle r="18" stroke="#18181b" strokeWidth="2" />
    </svg>
  );
}

// Crest and symbol come from the active team through CSS variables (--team-crest, --team-symbol,
// see src/lib/teams.ts), so they switch with <html data-team> without any JavaScript.

/**
 * The team symbol (Arsenal: the cannon), painted in `currentColor` through a CSS mask,
 * so `text-*` classes set its colour. The image is square with the symbol centred.
 */
export function Cannon({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`team-symbol inline-block aspect-square bg-current [mask-image:var(--team-symbol)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] ${className}`}
    />
  );
}

/** How many small symbols the background grid draws (enough to cover a tall page; the rest is clipped). */
const PATTERN_CELLS = 480;

/**
 * Background of team symbols, in `currentColor`. Two styles, picked per team in src/lib/teams.ts:
 * - tiles: the symbol repeated edge to edge (--team-pattern-tile), good for wide, low symbols;
 * - grid: smaller symbols with space around them (--team-pattern-size), good for tall symbols.
 */
export function CannonPattern({ className = "" }: { className?: string }) {
  return (
    <>
      <div
        aria-hidden
        className={`team-pattern-tile bg-current [mask-image:var(--team-symbol)] [mask-repeat:repeat] [mask-size:var(--team-pattern-tile)_var(--team-pattern-tile)] ${className}`}
      />
      <div
        aria-hidden
        className={`team-pattern-grid grid grid-cols-[repeat(auto-fill,104px)] auto-rows-[104px] place-items-center overflow-hidden ${className}`}
      >
        {Array.from({ length: PATTERN_CELLS }, (_, i) => (
          <Cannon key={i} className="w-(--team-pattern-size)" />
        ))}
      </div>
    </>
  );
}

/** The team crest. Give it a height (e.g. h-28); the width follows the shield's proportions. */
export function ClubCrest({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block aspect-[323/380] bg-contain bg-center bg-no-repeat [background-image:var(--team-crest)] ${className}`}
    />
  );
}

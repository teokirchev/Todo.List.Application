import Image from "next/image";
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

// Both images are files supplied by the owner in public/.

/**
 * The cannon (public/cannon.svg), painted in `currentColor` through a CSS mask,
 * so `text-*` classes set its colour. The image is square with the cannon centred.
 */
export function Cannon({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block aspect-square bg-current [mask-image:url(/cannon.svg)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] ${className}`}
    />
  );
}

/** Background that tiles small cannons, in `currentColor`. */
export function CannonPattern({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`bg-current [mask-image:url(/cannon.svg)] [mask-repeat:repeat] [mask-size:96px_96px] ${className}`}
    />
  );
}

/** The crest (public/crest.svg). */
export function ClubCrest({ className }: { className?: string }) {
  return <Image src="/crest.svg" alt="" width={323} height={380} loading="eager" className={className} />;
}

import Image from "next/image";

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

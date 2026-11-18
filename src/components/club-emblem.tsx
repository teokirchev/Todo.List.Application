import type { SVGProps } from "react";

/** The club cannon, facing right. Drawn in `currentColor`. */
export function Cannon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 60" fill="none" aria-hidden className={className} {...props}>
      <g fill="currentColor">
        <circle cx="7" cy="24" r="5" />
        <path d="M10 15q3-2 8-2l66 6v10l-66 6q-5 0-8-2z" />
        <rect x="82" y="15" width="10" height="18" rx="2" />
        <path d="M18 34h48l-8 10H24z" />
      </g>
      <path d="M34 14.5v19M58 16.6v15" stroke="#000" strokeOpacity=".22" strokeWidth="2.5" />
      <g stroke="currentColor" strokeWidth="3">
        <circle cx="30" cy="47" r="10" />
        <circle cx="56" cy="47" r="10" />
        <path d="M30 37v20M20 47h20M56 37v20M46 47h20" strokeWidth="2" />
      </g>
      <circle cx="30" cy="47" r="3" fill="currentColor" />
      <circle cx="56" cy="47" r="3" fill="currentColor" />
    </svg>
  );
}

const SHIELD = "M8 8h104v62c0 34-24 54-52 64C32 124 8 104 8 70z";
const INNER = "M15 15h90v55c0 29-21 47-45 56-24-9-45-27-45-56z";

/** Club-style crest: gold-trimmed shield, ARSENAL banner and a gold cannon. */
export function ClubCrest(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 142" aria-hidden {...props}>
      <defs>
        <clipPath id="crest-inner">
          <path d={INNER} />
        </clipPath>
      </defs>
      <path d={SHIELD} fill="#c9a54c" />
      <path d="M11 11h98v59c0 32-22.5 50.5-49 60-26.5-9.5-49-28-49-60z" fill="#063672" />
      <g clipPath="url(#crest-inner)">
        <rect x="0" y="0" width="120" height="142" fill="#ef0107" />
        <rect x="0" y="0" width="120" height="44" fill="#fff" />
        <rect x="0" y="44" width="120" height="3" fill="#c9a54c" />
        <rect x="0" y="113" width="120" height="30" fill="#063672" />
        <rect x="0" y="111" width="120" height="2.5" fill="#c9a54c" />
      </g>
      <text
        x="60"
        y="37"
        textAnchor="middle"
        fontSize="19"
        fontWeight="700"
        letterSpacing="1.5"
        fill="#ef0107"
        className="font-display"
      >
        ARSENAL
      </text>
      <g transform="translate(19 56) scale(.82)" color="#c9a54c">
        <Cannon width="100" height="60" />
      </g>
    </svg>
  );
}

/** Background that tiles small cannons. */
export function CannonPattern(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden {...props}>
      <defs>
        <pattern id="cannon-tile" width="150" height="110" patternUnits="userSpaceOnUse">
          <g transform="translate(20 20) scale(.5)">
            <Cannon width="100" height="60" />
          </g>
          <g transform="translate(95 75) scale(.5)">
            <Cannon width="100" height="60" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#cannon-tile)" />
    </svg>
  );
}

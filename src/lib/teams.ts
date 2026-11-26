// Football club themes. Each team sets the colour roles used across the UI (as CSS variables),
// its crest and background symbol, and a few short texts.
//
// The active team is the data-team attribute on <html>. It is set before the first paint from the
// "team" cookie (see TEAM_INIT_SCRIPT), and the user's choice is stored in the database (users.team).
//
// To add a team: add an entry to TEAMS. To give a team its real crest/symbol, put the files in
// public/teams/<id>/ and set `crest` / `symbol`; until then a generic shield with the team's
// initials and a football are used.

export type TeamId = "arsenal" | "liverpool" | "manutd" | "chelsea" | "mancity" | "realmadrid" | "barcelona";

export type Team = {
  id: TeamId;
  /** Display name (Bulgarian). */
  name: string;
  nickname: string;
  founded: number;
  stadium: string;
  motto: string;
  /** Short cheer used in celebrations. */
  chant: string;
  /** Short line in the page footer. */
  footer: string;
  /** Shown on the generic shield until a real crest is supplied. */
  initials: string;
  colors: {
    /** Main colour: page band, work list, buttons. */
    primary: string;
    primaryDark: string;
    /** Second colour: personal list. */
    secondary: string;
    secondaryDark: string;
    /** Highlights: symbol, stripes, trophy text. */
    accent: string;
  };
  /** Crest image in public/ (any aspect ratio close to a shield). */
  crest?: string;
  /** Silhouette in public/ (only its shape is used), painted in the accent colour: background and work-list badge. */
  symbol?: string;
  /** The tick-off celebration shows the symbol firing (tuned to Arsenal's cannon; other symbols skip it). */
  cannonShot?: boolean;
  /**
   * Show the symbol in its own colours (e.g. a full crest) instead of as a silhouette in the accent
   * colour. Multi-coloured artwork would otherwise collapse into a flat blob.
   */
  symbolInColor?: boolean;
  /** The background shows the symbol mirrored on the left; leave off for symbols with lettering. */
  mirrorSymbol?: boolean;
  /**
   * Faint background pattern on the white area, tuned per team:
   * - patternTile: symbols packed edge to edge in tiles of this size (px), suits wide, low symbols;
   * - otherwise a spaced grid with each symbol patternSize px (default 48, or 72 for the generic football).
   */
  patternTile?: number;
  patternSize?: number;
  /** The two symbols on the coloured band: "big" (wide, low symbols) or "compact" (default; tall symbols). */
  sideSymbols?: "big" | "compact";
};

export const DEFAULT_TEAM: TeamId = "arsenal";

export const TEAMS: Team[] = [
  {
    id: "arsenal",
    name: "Арсенал",
    nickname: "The Gunners",
    founded: 1886,
    stadium: "Emirates",
    motto: "Victoria Concordia Crescit",
    chant: "COYG",
    footer: "North London is Red",
    initials: "AFC",
    colors: { primary: "#ef0107", primaryDark: "#b5000b", secondary: "#063672", secondaryDark: "#031f45", accent: "#c9a54c" },
    crest: "/crest.svg",
    symbol: "/cannon.svg",
    cannonShot: true,
    mirrorSymbol: true,
    patternTile: 96,
    sideSymbols: "big",
  },
  {
    id: "liverpool",
    name: "Ливърпул",
    nickname: "The Reds",
    founded: 1892,
    stadium: "Anfield",
    motto: "You'll Never Walk Alone",
    chant: "YNWA",
    footer: "This is Anfield",
    initials: "LFC",
    colors: { primary: "#c8102e", primaryDark: "#8a0a1f", secondary: "#00a398", secondaryDark: "#006b63", accent: "#f6eb61" },
    crest: "/teams/liverpool/crest.svg",
    symbol: "/teams/liverpool/symbol.png",
  },
  {
    id: "manutd",
    name: "Манчестър Юнайтед",
    nickname: "Red Devils",
    founded: 1878,
    stadium: "Old Trafford",
    motto: "Concilio et Labore",
    chant: "GGMU",
    footer: "Theatre of Dreams",
    initials: "MUFC",
    colors: { primary: "#da291c", primaryDark: "#9e1b12", secondary: "#27272a", secondaryDark: "#0a0a0a", accent: "#fbe122" },
    crest: "/teams/manutd/crest.svg",
    symbol: "/teams/manutd/symbol.svg",
    mirrorSymbol: true,
  },
  {
    id: "chelsea",
    name: "Челси",
    nickname: "The Blues",
    founded: 1905,
    stadium: "Stamford Bridge",
    motto: "Pride of London",
    chant: "KTBFFH",
    footer: "Stamford Bridge",
    initials: "CFC",
    colors: { primary: "#034694", primaryDark: "#022a5c", secondary: "#c8102e", secondaryDark: "#8a0a1f", accent: "#dba111" },
    crest: "/teams/chelsea/crest.svg",
    symbol: "/teams/chelsea/symbol.svg",
  },
  {
    id: "mancity",
    name: "Манчестър Сити",
    nickname: "The Citizens",
    founded: 1880,
    stadium: "Etihad",
    motto: "Superbia in Proelio",
    chant: "Come on City",
    footer: "Etihad Stadium",
    initials: "MCFC",
    colors: { primary: "#4a90cc", primaryDark: "#1c2c5b", secondary: "#1c2c5b", secondaryDark: "#0f1a3a", accent: "#ffc659" },
    crest: "/teams/mancity/crest.svg",
    symbol: "/teams/mancity/symbol.png",
    symbolInColor: true,
  },
  {
    id: "realmadrid",
    name: "Реал Мадрид",
    nickname: "Los Blancos",
    founded: 1902,
    stadium: "Bernabéu",
    motto: "Hala Madrid",
    chant: "¡Hala Madrid!",
    footer: "Santiago Bernabéu",
    initials: "RMCF",
    colors: { primary: "#00529f", primaryDark: "#003366", secondary: "#3d195b", secondaryDark: "#24103a", accent: "#febe10" },
    crest: "/teams/realmadrid/crest.svg",
    symbol: "/teams/realmadrid/crest.svg",
    symbolInColor: true,
  },
  {
    id: "barcelona",
    name: "Барселона",
    nickname: "Blaugrana",
    founded: 1899,
    stadium: "Camp Nou",
    motto: "Més que un club",
    chant: "Visca Barça",
    footer: "Camp Nou",
    initials: "FCB",
    colors: { primary: "#a50044", primaryDark: "#6e002d", secondary: "#004d98", secondaryDark: "#00305f", accent: "#edbb00" },
    crest: "/teams/barcelona/crest.svg",
    symbol: "/teams/barcelona/crest.svg",
    symbolInColor: true,
  },
];

const TEAM_IDS = TEAMS.map((t) => t.id);

export function isTeamId(value: unknown): value is TeamId {
  return typeof value === "string" && (TEAM_IDS as string[]).includes(value);
}

export function getTeam(id: TeamId): Team {
  return TEAMS.find((t) => t.id === id)!;
}

export const TEAM_COOKIE = "team";

/** Generic shield in the team's colours with its initials (used until a real crest is supplied). */
function genericCrestSvg(team: Team): string {
  const { primary, secondary, accent } = team.colors;
  const size = team.initials.length > 3 ? 26 : 32;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 142">` +
    `<path d="M8 8h104v62c0 34-24 54-52 64C32 124 8 104 8 70z" fill="${accent}"/>` +
    `<path d="M14 14h92v56c0 30-21 48-46 57C35 118 14 100 14 70z" fill="${primary}"/>` +
    `<path d="M14 92h92c-5 17-23 29-46 35-23-6-41-18-46-35z" fill="${secondary}"/>` +
    `<circle cx="60" cy="44" r="13" fill="none" stroke="#fff" stroke-width="3" opacity=".9"/>` +
    `<text x="60" y="${size > 28 ? 86 : 84}" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="${size}" fill="#fff">${team.initials}</text>` +
    `</svg>`;
  return svg;
}

/** URL of the team's crest: the supplied file, or the generic shield as a data URL. */
export function crestHref(team: Team): string {
  return team.crest ?? `data:image/svg+xml,${encodeURIComponent(genericCrestSvg(team))}`;
}

/** Crest per team, used as the browser-tab icon (favicon). */
export const TEAM_ICONS = Object.fromEntries(TEAMS.map((t) => [t.id, crestHref(t)])) as Record<TeamId, string>;

/**
 * Runs inline in <head> before the first paint: applies the team from the cookie and points the
 * browser-tab icon at its crest (the installed app's icon is the same football for every club). Next.js may
 * insert icon <link> tags after this script (streamed metadata), so new ones are caught as they appear. The team is read from <html data-team>, so a
 * later switch (applyTeam) is respected too.
 */
export const TEAM_INIT_SCRIPT = `(function(){try{var m=document.cookie.match(/(?:^|; )${TEAM_COOKIE}=([^;]+)/);var t=m&&decodeURIComponent(m[1]);var icons=${JSON.stringify(TEAM_ICONS)};var root=document.documentElement;if(t in icons)root.setAttribute("data-team",t);var setIcon=function(){var h=icons[root.getAttribute("data-team")]||icons[${JSON.stringify(DEFAULT_TEAM)}];var ls=document.querySelectorAll('link[rel~="icon"]');for(var i=0;i<ls.length;i++){if(ls[i].getAttribute("href")!==h){ls[i].href=h;ls[i].removeAttribute("sizes");ls[i].removeAttribute("type")}}};setIcon();new MutationObserver(function(ms){for(var i=0;i<ms.length;i++){var a=ms[i].addedNodes;for(var j=0;j<a.length;j++){var n=a[j];if(n.nodeName==="LINK"||(n.querySelector&&n.querySelector('link[rel~="icon"]'))){setIcon();return}}}}).observe(root,{childList:true,subtree:true})}catch(e){}})()`;

/** CSS for every team: colour variables, crest and symbol, and which team texts are visible. */
export function teamCss(): string {
  const rules = TEAMS.map((t) => {
    const selector = t.id === DEFAULT_TEAM ? `:root, :root[data-team="${t.id}"]` : `:root[data-team="${t.id}"]`;
    const c = t.colors;
    const vars = [
      `--team-primary:${c.primary}`,
      `--team-primary-dark:${c.primaryDark}`,
      `--team-secondary:${c.secondary}`,
      `--team-secondary-dark:${c.secondaryDark}`,
      `--team-accent:${c.accent}`,
      `--team-crest:url("${crestHref(t)}")`,
      `--team-symbol:url("${t.symbol ?? "/teams/football.svg"}")`,
      `--team-pattern-tile:${t.patternTile ?? 96}px`,
      // The generic football is small inside its square, so it gets a bigger box than tall symbols.
      `--team-pattern-size:${t.patternSize ?? (t.symbol ? 48 : 72)}px`,
    ].join(";");
    const textSelector =
      t.id === DEFAULT_TEAM
        ? `:root:not([data-team]) [data-team-text="${t.id}"], :root[data-team="${t.id}"] [data-team-text="${t.id}"]`
        : `:root[data-team="${t.id}"] [data-team-text="${t.id}"]`;
    // The celebration's "shooter" is tuned to the cannon (muzzle position), so other teams skip it.
    const noShooter = t.cannonShot ? "" : `:root[data-team="${t.id}"] .cannon-shot-cannon{display:none}`;
    // Mirroring would reverse lettering (e.g. "L.F.C."), so only symbols marked safe are flipped.
    const noMirror = t.mirrorSymbol ? "" : `:root[data-team="${t.id}"] .team-symbol-mirror{scale:none}`;
    // Each team shows one pattern style and one size of side symbols; the others are hidden.
    const scoped = (cls: string) =>
      t.id === DEFAULT_TEAM
        ? `:root:not([data-team]) .${cls}, :root[data-team="${t.id}"] .${cls}`
        : `:root[data-team="${t.id}"] .${cls}`;
    const hidePattern = scoped(t.patternTile ? "team-pattern-grid" : "team-pattern-tile");
    // Full-colour symbols: drawn as an image instead of a tinted mask, faint in the background pattern.
    const inColor = t.symbolInColor
      ? `${scoped("team-symbol")}{-webkit-mask-image:none;mask-image:none;background-color:transparent;background-image:var(--team-symbol);background-size:contain;background-position:center;background-repeat:no-repeat}` +
        `${scoped("team-pattern-grid .team-symbol")}{opacity:.16}`
      : "";
    const hideSide = scoped(t.sideSymbols === "big" ? "team-side-compact" : "team-side-big");
    return `${selector}{${vars}}${textSelector}{display:inline}${noShooter}${noMirror}${hidePattern},${hideSide}{display:none}${inColor}`;
  });
  return `[data-team-text]{display:none}${rules.join("")}`;
}

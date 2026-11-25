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
  /** Single-colour silhouette in public/, painted in the accent colour (background, badges, celebration). */
  symbol?: string;
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

/** Runs inline in <head> before the first paint: applies the team from the cookie. */
export const TEAM_INIT_SCRIPT = `(function(){try{var m=document.cookie.match(/(?:^|; )${TEAM_COOKIE}=([^;]+)/);var t=m&&decodeURIComponent(m[1]);if(t&&${JSON.stringify(TEAM_IDS)}.indexOf(t)>=0)document.documentElement.setAttribute("data-team",t)}catch(e){}})()`;

/** Generic shield in the team's colours with its initials (used until a real crest is supplied). */
function genericCrest(team: Team): string {
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
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

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
      `--team-crest:${t.crest ? `url("${t.crest}")` : genericCrest(t)}`,
      `--team-symbol:url("${t.symbol ?? "/teams/football.svg"}")`,
    ].join(";");
    const textSelector =
      t.id === DEFAULT_TEAM
        ? `:root:not([data-team]) [data-team-text="${t.id}"], :root[data-team="${t.id}"] [data-team-text="${t.id}"]`
        : `:root[data-team="${t.id}"] [data-team-text="${t.id}"]`;
    // The celebration's "shooter" only makes sense with a real symbol (e.g. Arsenal's cannon).
    const noShooter = t.symbol ? "" : `:root[data-team="${t.id}"] .cannon-shot-cannon{display:none}`;
    return `${selector}{${vars}}${textSelector}{display:inline}${noShooter}`;
  });
  return `[data-team-text]{display:none}${rules.join("")}`;
}

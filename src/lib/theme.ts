// Day / night theme, kept in localStorage and applied as data-theme on <html>.
// Until the user picks one, the browser's light/dark setting is used.

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

/**
 * Runs inline in <head> before the first paint, so the page never flashes in the wrong theme.
 * Keep it in sync with currentTheme() below.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var p=localStorage.getItem("${THEME_STORAGE_KEY}");var d=p==="dark"||(p!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.setAttribute("data-theme",d?"dark":"light")}catch(e){}})()`;

/** The user's saved choice, or null if they never picked one. */
export function storedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

/** The saved choice, or the browser setting when there is none. */
export function currentTheme(): Theme {
  return storedTheme() ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
}

export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

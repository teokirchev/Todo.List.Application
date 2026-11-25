"use client";

import { useEffect, useLayoutEffect, useSyncExternalStore } from "react";
import { Moon, Sun, type LucideIcon } from "lucide-react";
import { applyTheme, currentTheme, THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

const OPTIONS: { value: Theme; label: string; icon: LucideIcon }[] = [
  { value: "light", label: "Ден", icon: Sun },
  { value: "dark", label: "Нощ", icon: Moon },
];

// A tiny store over localStorage (and the browser setting, used until a choice is saved),
// so every toggle and every open tab stay in sync.
const CHANGE_EVENT = "theme-change";

function subscribe(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onStorage = (e: StorageEvent) => {
    if (e.key === THEME_STORAGE_KEY || e.key === null) onChange();
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  media.addEventListener("change", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
    media.removeEventListener("change", onChange);
  };
}

function chooseTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage unavailable: the choice still applies until the page is reloaded.
  }
  applyTheme(theme);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Day / night switch. The theme itself is applied before paint by the script in the layout. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  // The server cannot know the theme, so it renders "light" and the client corrects it after hydration.
  const theme = useSyncExternalStore(subscribe, currentTheme, () => "light" as const);

  // Re-apply on mount: in development React's Strict Mode remount clears attributes set by the inline script.
  useLayoutEffect(() => {
    applyTheme(currentTheme());
  }, []);

  // Follows changes from other tabs, and the browser setting while nothing is saved.
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <div
      role="radiogroup"
      aria-label="Тема"
      className={`flex items-center gap-0.5 rounded-xl bg-black/20 p-1 ring-1 ring-white/20 ${className}`}
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          aria-label={label}
          title={label}
          onClick={() => chooseTheme(value)}
          className="flex size-8 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/15 hover:text-white aria-checked:bg-white aria-checked:text-club-red aria-checked:shadow"
        >
          <Icon className="size-4" aria-hidden />
        </button>
      ))}
    </div>
  );
}

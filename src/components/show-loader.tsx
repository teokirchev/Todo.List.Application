"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** How many <ShowLoader> are mounted; the loader stays while any is. */
let busy = 0;

/**
 * Put inside a Suspense fallback: while it is on screen (e.g. the todos are still coming after moving
 * between pages in the app), the football loading screen (src/components/app-loader.tsx) is shown
 * through <html data-busy>. Renders nothing itself.
 */
export function ShowLoader() {
  useEffect(() => {
    const root = document.documentElement;
    busy++;
    root.setAttribute("data-busy", "");
    return () => {
      busy--;
      if (busy === 0) root.removeAttribute("data-busy");
    };
  }, []);
  return null;
}

/** Gives up on a navigation that never arrives (e.g. it failed), so the loader cannot stay forever. */
const NAVIGATION_TIMEOUT_MS = 10000;

/**
 * Mount once in the root layout. Shows the loading screen (through <html data-navigating>) from the
 * click on an in-app link until the new page is on screen, so the old page does not linger and then
 * jump. If the new page still waits for data, <ShowLoader> in its Suspense fallback keeps it up.
 */
export function NavigationLoader() {
  const pathname = usePathname();

  // The new page has rendered.
  useEffect(() => {
    document.documentElement.removeAttribute("data-navigating");
  }, [pathname]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onClick = (e: MouseEvent) => {
      // No defaultPrevented check: <Link> itself prevents the click to navigate without reloading.
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement) || link.target || link.hasAttribute("download")) return;
      const to = new URL(link.href);
      if (to.origin !== location.origin || to.pathname === location.pathname) return;
      const root = document.documentElement;
      root.setAttribute("data-navigating", "");
      clearTimeout(timer);
      timer = setTimeout(() => root.removeAttribute("data-navigating"), NAVIGATION_TIMEOUT_MS);
    };
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      clearTimeout(timer);
    };
  }, []);

  return null;
}

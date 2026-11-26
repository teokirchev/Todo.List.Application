"use client";

import { useEffect } from "react";
import { TEAM_COOKIE, TEAM_ICONS, type TeamId } from "@/lib/teams";

/** Points the browser-tab icon(s) at the team's crest and the iPhone home-screen icon at its icon. */
export function setTeamFavicon(team: TeamId) {
  document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]').forEach((link) => {
    link.href = TEAM_ICONS[team];
    link.removeAttribute("sizes");
    link.removeAttribute("type");
  });
  document.querySelectorAll<HTMLLinkElement>('link[rel="apple-touch-icon"]').forEach((link) => {
    link.href = `/teams/${team}/apple-icon.png`;
  });
}

/** Puts <html data-team>, the tab icon and the cookie in line with the given team. */
export function applyTeam(team: TeamId) {
  document.documentElement.setAttribute("data-team", team);
  setTeamFavicon(team);
  document.cookie = `${TEAM_COOKIE}=${team}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax${
    location.protocol === "https:" ? "; secure" : ""
  }`;
}

/**
 * Keeps this browser on the team saved in the database, e.g. after picking a club on another device
 * (the cookie the pre-paint script reads is per browser). Also re-applies the tab icon after React
 * has rendered the head, in case it reset the link the pre-paint script changed.
 */
export function TeamSync({ team }: { team: TeamId }) {
  useEffect(() => {
    if (document.documentElement.getAttribute("data-team") !== team) applyTeam(team);
    else setTeamFavicon(team);
  }, [team]);
  return null;
}
